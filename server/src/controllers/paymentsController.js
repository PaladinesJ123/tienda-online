import Stripe from "stripe";
import { sequelize } from "../db.js";
import { Order } from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";
import { Product } from "../models/Product.js";
import { Coupon } from "../models/Coupon.js";
import { CouponUsage } from "../models/CouponUsage.js";
import { sendOrderPaidEmail } from "../lib/mailer.js";
import { createEvent } from "../lib/events.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Crea un PaymentIntent para un orderId existente (status = pending)
 * Devuelve clientSecret para el frontend.
 */
export const createPaymentIntent = async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findByPk(orderId, { include: [OrderItem] });
  if (!order) return res.status(404).json({ error: "Pedido no encontrado" });
  if (order.status !== "pending") {
    return res.status(400).json({ error: "El pedido no esta pendiente de pago" });
  }
  const amount = Math.round(Number(order.total) * 100); // en cents
  const currency = process.env.CURRENCY || "usd";

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata: {
      orderId: String(order.id),
      userId: String(order.userId),
    },
    automatic_payment_methods: { enabled: true }
  });

  res.json({ clientSecret: paymentIntent.client_secret });
};

/**
 * Webhook de Stripe. Marca el pedido como 'paid' y descuenta stock.
 */
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const orderId = Number(pi.metadata?.orderId);

    if (orderId) {
      await sequelize.transaction(async (t) => {
        const order = await Order.findByPk(orderId, {
          include: [OrderItem],
          transaction: t,
          lock: t.LOCK.UPDATE
        });
        if (!order) return;
        if (order.status !== "pending") return;

        const productIds = order.OrderItems.map(i => i.productId);
        const products = await Product.findAll({
          where: { id: productIds },
          transaction: t,
          lock: t.LOCK.UPDATE
        });
        const byId = Object.fromEntries(products.map(p => [p.id, p]));

        for (const item of order.OrderItems) {
          const product = byId[item.productId];
          if (!product || product.stock < item.quantity) {
            throw new Error(`Stock insuficiente durante confirmación de pago (productId=${item.productId})`);
          }
          await product.update({ stock: product.stock - item.quantity }, { transaction: t });
        }

        order.status = "paid";
        await order.save({ transaction: t });
        await createEvent({
          orderId: order.id,
          type: "paid",
          note: `PI ${pi.id}`,
          actorType: "webhook",
          actorId: null,
          transaction: t
        });

        if (order.couponId && Number(order.discountAmount) > 0) {
          const exists = await CouponUsage.findOne({ where: { orderId: order.id }, transaction: t });
          if (!exists) {
            await CouponUsage.create({
              couponId: order.couponId,
              userId: order.userId,
              orderId: order.id,
              amount: order.discountAmount
            }, { transaction: t });
            const coupon = await Coupon.findByPk(order.couponId, { transaction: t, lock: t.LOCK.UPDATE });
            if (coupon) {
              coupon.usageCount += 1;
              await coupon.save({ transaction: t });
            }
          }
        }
      });

      try { await sendOrderPaidEmail(orderId); } catch (e) { console.warn("Email order paid fallo:", e.message); }
    }
  }

  res.json({ received: true });
};
