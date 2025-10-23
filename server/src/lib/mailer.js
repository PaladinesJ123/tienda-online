// server/src/lib/mailer.js
import nodemailer from "nodemailer";
import { Order } from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { Shipment } from "../models/Shipment.js";

let transporter;
let usingEthereal = false;

async function buildTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    usingEthereal = false;
  } else {
    const test = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: test.smtp.host,
      port: test.smtp.port,
      secure: test.smtp.secure,
      auth: { user: test.user, pass: test.pass }
    });
    usingEthereal = true;
    console.log("Mailer en modo Ethereal (solo pruebas).");
  }

  return transporter;
}

function wrapLayout(title, body) {
  return `
  <div style="font-family:system-ui,Arial,sans-serif;max-width:640px;margin:auto">
    <h2 style="color:#111">${title}</h2>
    <div style="border:1px solid #eee;border-radius:12px;padding:16px">${body}</div>
    <p style="color:#666;font-size:12px;margin-top:16px">
      Gracias por comprar en <b>Tienda</b>.
    </p>
  </div>`;
}

function renderAddress(o) {
  const L = value => (value ? String(value) : "");
  return `
    <div>
      <b>${L(o.shippingName)}</b>${o.shippingPhone ? ` - ${o.shippingPhone}` : ""}<br/>
      ${L(o.shippingLine1)}${o.shippingLine2 ? `, ${o.shippingLine2}` : ""}<br/>
      ${L(o.shippingCity)}${o.shippingState ? `, ${o.shippingState}` : ""} ${L(o.shippingPostalCode)}<br/>
      ${L(o.shippingCountry)}
    </div>
  `;
}

function renderItems(orderItems) {
  return `
    <table width="100%" cellspacing="0" cellpadding="6" style="border-collapse:collapse">
      <thead>
        <tr>
          <th align="left">Producto</th>
          <th align="right">Cant.</th>
          <th align="right">Precio</th>
          <th align="right">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${orderItems
          .map(
            item => `
          <tr>
            <td>${item.Product?.title ?? `Producto ${item.productId}`}</td>
            <td align="right">${item.quantity}</td>
            <td align="right">$${Number(item.unitPrice).toFixed(2)}</td>
            <td align="right">$${(Number(item.unitPrice) * item.quantity).toFixed(2)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

async function sendMail({ to, subject, html }) {
  const t = await buildTransporter();
  const info = await t.sendMail({
    from: process.env.SMTP_FROM || "Tienda <no-reply@example.com>",
    to,
    subject,
    html
  });
  if (usingEthereal) {
    console.log("Vista previa Ethereal:", nodemailer.getTestMessageUrl(info));
  }
  return info;
}

// ============ PUBLICAS ============

export async function sendWelcomeEmail(user) {
  const html = wrapLayout(
    "Bienvenid@ a Tienda",
    `<p>Hola ${user.name},</p>
     <p>Tu cuenta fue creada correctamente.</p>`
  );
  await sendMail({ to: user.email, subject: "Bienvenid@ a Tienda", html });
}

export async function sendOrderCreatedEmail(orderId) {
  const order = await Order.findByPk(orderId, {
    include: [
      { model: OrderItem, include: [Product] },
      { model: User, attributes: ["id", "name", "email"] }
    ]
  });
  if (!order) return;

  const itemsHtml = renderItems(order.OrderItems || []);
  const addressHtml = renderAddress(order);

  const couponRow =
    Number(order.discountAmount) > 0
      ? `<tr><td colspan="3" align="right">Descuento</td><td align="right">-$${Number(order.discountAmount).toFixed(2)}</td></tr>`
      : "";

  const html = wrapLayout(
    `Pedido #${order.id} creado`,
    `
    <p>Hola ${order.User?.name || ""},</p>
    <p>Recibimos tu pedido <b>#${order.id}</b>. A continuacion el detalle:</p>
    ${itemsHtml}
    <table width="100%" cellspacing="0" cellpadding="6" style="border-collapse:collapse;margin-top:8px">
      <tbody>
        ${couponRow}
        <tr><td colspan="3" align="right"><b>Total</b></td><td align="right"><b>$${Number(order.total).toFixed(2)}</b></td></tr>
      </tbody>
    </table>
    <h3>Envio</h3>
    ${addressHtml}
    <p>Estado actual: <b>${order.status}</b></p>
    `
  );

  await sendMail({ to: order.User?.email, subject: `Pedido #${order.id} creado`, html });
}

export async function sendOrderPaidEmail(orderId) {
  const order = await Order.findByPk(orderId, {
    include: [
      { model: OrderItem, include: [Product] },
      { model: User, attributes: ["id", "name", "email"] }
    ]
  });
  if (!order) return;

  const itemsHtml = renderItems(order.OrderItems || []);
  const addressHtml = renderAddress(order);

  const html = wrapLayout(
    `Pago confirmado - Pedido #${order.id}`,
    `
    <p>Gracias ${order.User?.name || ""}!</p>
    <p>Tu pago fue confirmado. Prepararemos tu pedido <b>#${order.id}</b> para envio.</p>
    ${itemsHtml}
    <table width="100%" cellspacing="0" cellpadding="6" style="border-collapse:collapse;margin-top:8px">
      <tbody>
        <tr><td colspan="3" align="right"><b>Total</b></td><td align="right"><b>$${Number(order.total).toFixed(2)}</b></td></tr>
      </tbody>
    </table>
    <h3>Envio</h3>
    ${addressHtml}
    <p>Estado actual: <b>${order.status}</b></p>
    `
  );

  await sendMail({ to: order.User?.email, subject: `Pago confirmado - Pedido #${order.id}`, html });
}

export async function sendOrderShippedEmail(orderId) {
  const order = await Order.findByPk(orderId, {
    include: [
      { model: OrderItem, include: [Product] },
      { model: User, attributes: ["id", "name", "email"] },
      { model: Shipment }
    ]
  });
  if (!order) return;

  const shipment = order.Shipment;
  const tracking = shipment?.trackingUrl
    ? `<a href="${shipment.trackingUrl}">${shipment.trackingNumber}</a>`
    : shipment?.trackingNumber || "-";

  const html = wrapLayout(
    `Tu pedido #${order.id} fue enviado`,
    `
      <p>Hola ${order.User?.name || ""},</p>
      <p>Tu pedido ya esta en camino.</p>
      <p><b>Transportista:</b> ${shipment?.carrier ?? "-"}<br/>
      <b>Guia:</b> ${tracking}</p>
      ${renderItems(order.OrderItems || [])}
      <h3>Direccion de envio</h3>
      ${renderAddress(order)}
      <p>Estado actual: <b>${order.status}</b></p>
    `
  );

  await sendMail({ to: order.User?.email, subject: `Pedido #${order.id} enviado`, html });
}

export async function sendOrderDeliveredEmail(orderId) {
  const order = await Order.findByPk(orderId, {
    include: [
      { model: OrderItem, include: [Product] },
      { model: User, attributes: ["id", "name", "email"] },
      { model: Shipment }
    ]
  });
  if (!order) return;

  const html = wrapLayout(
    `Pedido #${order.id} entregado`,
    `
      <p>Hola ${order.User?.name || ""},</p>
      <p>Confirmamos que tu pedido <b>#${order.id}</b> fue entregado. Gracias por tu compra!</p>
      ${renderItems(order.OrderItems || [])}
      <h3>Direccion de envio</h3>
      ${renderAddress(order)}
      <p>Estado actual: <b>${order.status}</b></p>
    `
  );
  await sendMail({ to: order.User?.email, subject: `Pedido #${order.id} entregado`, html });
}
