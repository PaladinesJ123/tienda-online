// server/src/controllers/orderController.js
import { sequelize } from "../db.js";
import { Order } from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { Address } from "../models/Address.js";
import { Coupon } from "../models/Coupon.js";
import { CouponUsage } from "../models/CouponUsage.js";
import { Shipment } from "../models/Shipment.js";
import { OrderEvent } from "../models/OrderEvent.js";
import { sendOrderCreatedEmail } from "../lib/mailer.js";
import { createEvent } from "../lib/events.js";

// helper de arriba (mismo que en couponsController)
const calcDiscount = (subtotal, coupon) => {
  let discount = 0;
  if (coupon.type === "percentage") {
    discount = Number(subtotal) * (Number(coupon.value) / 100);
    if (coupon.maxDiscount != null) discount = Math.min(discount, Number(coupon.maxDiscount));
  } else {
    discount = Math.min(Number(coupon.value), Number(subtotal));
  }
  return Number(discount.toFixed(2));
};

export const createOrder = async (req, res) => {
  const { items, addressId, couponCode } = req.body;
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "Items vacíos" });
  if (!addressId) return res.status(400).json({ error: "Falta addressId" });

  try {
    const result = await sequelize.transaction(async (t) => {
      const address = await Address.findOne({ where: { id: addressId, userId: req.user.id }, transaction: t });
      if (!address) throw new Error("Dirección no encontrada");

      const products = await Product.findAll({ where: { id: items.map(i => i.productId) }, transaction: t });
      const byId = Object.fromEntries(products.map(p => [p.id, p]));
      let subtotal = 0;

      for (const i of items) {
        const p = byId[i.productId];
        if (!p || p.stock < i.quantity) throw new Error(`Stock insuficiente en ${i.productId}`);
        subtotal += Number(p.price) * i.quantity;
      }

      let discountAmount = 0, couponId = null, couponCodeFinal = null;
      if (couponCode) {
        const code = couponCode.toString().toUpperCase().trim();
        const coupon = await Coupon.findOne({ where: { code }, transaction: t });
        if (!coupon) throw new Error("Cupón no existe");
        const now = new Date();
        if (!coupon.isActive) throw new Error("Cupón inactivo");
        if (coupon.startsAt && now < coupon.startsAt) throw new Error("Cupón aún no válido");
        if (coupon.expiresAt && now > coupon.expiresAt) throw new Error("Cupón expirado");
        if (coupon.minOrderTotal && subtotal < Number(coupon.minOrderTotal)) throw new Error(`Subtotal mínimo ${coupon.minOrderTotal}`);
        if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) throw new Error("Cupón sin stock de usos");
        if (coupon.perUserLimit != null) {
          const used = await CouponUsage.count({ where: { couponId: coupon.id, userId: req.user.id }, transaction: t });
          if (used >= coupon.perUserLimit) throw new Error("Límite por usuario alcanzado");
        }
        discountAmount = calcDiscount(subtotal, coupon);
        couponId = coupon.id;
        couponCodeFinal = coupon.code;
      }

      const total = Number((subtotal - discountAmount).toFixed(2));

      const order = await Order.create({
        userId: req.user.id,
        total,
        status: "pending",
        couponId,
        couponCode: couponCodeFinal,
        discountAmount,
        shippingName: address.name,
        shippingPhone: address.phone,
        shippingLine1: address.line1,
        shippingLine2: address.line2,
        shippingCity: address.city,
        shippingState: address.state,
        shippingPostalCode: address.postalCode,
        shippingCountry: address.country
      }, { transaction: t });

      await Promise.all(items.map(i => OrderItem.create({
        orderId: order.id,
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: byId[i.productId].price
      }, { transaction: t })));

      await createEvent({
        orderId: order.id,
        type: "created",
        note: `Subtotal $${subtotal.toFixed(2)}${discountAmount ? ` / Desc $${discountAmount.toFixed(2)}` : ""} / Total $${(subtotal - discountAmount).toFixed(2)}`,
        actorType: "user",
        actorId: req.user.id,
        transaction: t
      });

      return { orderId: order.id, subtotal, discount: discountAmount, total, status: order.status };
    });

    try { await sendOrderCreatedEmail(result.orderId); } catch (e) { console.warn("Email order created falló:", e.message); }
    res.status(201).json(result);
  } catch (err) {
    const message = err?.message || "Error al crear pedido";
    if (message === "Dirección no encontrada") {
      return res.status(404).json({ error: message });
    }
    const knownErrors = [
      "Items vacíos",
      "Falta addressId",
      "Cupón no existe",
      "Cupón inactivo",
      "Cupón aún no válido",
      "Cupón expirado",
      "Cupón sin stock de usos",
      "Límite por usuario alcanzado"
    ];
    if (knownErrors.includes(message) || message.startsWith("Stock insuficiente") || message.startsWith("Subtotal mínimo")) {
      return res.status(400).json({ error: message });
    }
    console.error("Error creando pedido:", err);
    return res.status(500).json({ error: "Error al crear pedido" });
  }
};

export const myOrders = async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    include: [OrderItem, Shipment],
    order: [["id", "DESC"]]
  });
  res.json(orders);
};

export const updateStatus = async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ error: "No encontrado" });

  const prev = order.status;
  order.status = req.body.status ?? order.status;
  await order.save();

  const loggable = ["cancelled"];
  const typeMap = { cancelled: "cancelled" };

  if (loggable.includes(order.status)) {
    await createEvent({
      orderId: order.id,
      type: typeMap[order.status] || "status_changed",
      note: `De ${prev} a ${order.status}`,
      actorType: "admin",
      actorId: req.user.id
    });
  }

  res.json(order);
};

export const listAll = async (_req, res) => {
  const orders = await Order.findAll({
    include: [
      { model: OrderItem, include: [Product] },
      { model: User, attributes: ["id", "name", "email", "role"] },
      { model: Shipment }
    ],
    order: [["id", "DESC"]]
  });
  res.json(orders);
};

export const getEvents = async (req, res) => {
  const orderId = Number(req.params.id);
  const order = await Order.findByPk(orderId, { attributes: ["id", "userId"] });
  if (!order) return res.status(404).json({ error: "No encontrado" });

  const isAdmin = req.user?.role === "admin" || req.user?.role === "superadmin";
  if (!isAdmin && order.userId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const rows = await OrderEvent.findAll({
    where: { orderId },
    order: [["id", "ASC"]]
  });
  res.json(rows);
};
