import { Shipment } from "../models/Shipment.js";
import { Order } from "../models/Order.js";
import { buildTrackingUrl } from "../lib/shipping.js";
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from "../lib/mailer.js";
import { createEvent } from "../lib/events.js";

export const createOrUpdate = async (req,res)=>{
  const { orderId, carrier, trackingNumber, notes } = req.body;
  if (!orderId || !carrier || !trackingNumber) return res.status(400).json({ error:"Faltan datos" });

  const order = await Order.findByPk(orderId);
  if (!order) return res.status(404).json({ error:"Pedido no encontrado" });

  const trackingUrl = buildTrackingUrl(carrier, trackingNumber);
  let sh = await Shipment.findOne({ where: { orderId } });

  if (!sh) {
    sh = await Shipment.create({
      orderId, carrier, trackingNumber, trackingUrl,
      status: "in_transit", shippedAt: new Date(), notes: notes || null
    });
  } else {
    await sh.update({
      carrier, trackingNumber, trackingUrl,
      notes: notes ?? sh.notes,
      status: sh.status === "ready" ? "in_transit" : sh.status,
      shippedAt: sh.shippedAt || new Date()
    });
  }

  if (order.status !== "shipped") {
    order.status = "shipped";
    await order.save();
  }

  await createEvent({
    orderId: order.id,
    type: "shipped",
    note: `${sh.carrier} #${sh.trackingNumber}`,
    actorType: "admin",
    actorId: req.user.id
  });

  try { await sendOrderShippedEmail(order.id); } catch(e){ console.warn("Email shipped falló:", e.message); }
  res.status(201).json(sh);
};

export const updateStatus = async (req,res)=>{
  const { id } = req.params;
  const { status } = req.body; // ready | in_transit | delivered | returned
  const sh = await Shipment.findByPk(id);
  if (!sh) return res.status(404).json({ error:"No encontrado" });

  await sh.update({
    status,
    deliveredAt: status === "delivered" ? new Date() : sh.deliveredAt
  });

  const order = await Order.findByPk(sh.orderId);
  if (order && status === "delivered" && order.status !== "cancelled") {
    order.status = "delivered";
    await order.save();
    await createEvent({
      orderId: order.id,
      type: "delivered",
      note: "Entrega confirmada",
      actorType: "admin",
      actorId: req.user.id
    });
    try { await sendOrderDeliveredEmail(order.id); } catch(e){ console.warn("Email delivered falló:", e.message); }
  }

  res.json(sh);
};

export const byOrder = async (req,res)=>{
  const sh = await Shipment.findOne({ where: { orderId: req.params.orderId } });
  if (!sh) return res.status(404).json({ error:"No encontrado" });
  res.json(sh);
};

export const listAll = async (_req,res)=>{
  const rows = await Shipment.findAll({ order:[["id","DESC"]] });
  res.json(rows);
};
