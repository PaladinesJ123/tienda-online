import { useEffect, useState } from "react";
import http from "../api/http";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState({});
  const [open, setOpen] = useState({});

  useEffect(() => {
    (async () => {
      const r = await http.get("/orders/mine");
      setOrders(r.data);
    })();
  }, []);

  const toggle = async (orderId) => {
    const isOpen = !!open[orderId];
    setOpen((prev) => ({ ...prev, [orderId]: !isOpen }));
    if (!isOpen && !events[orderId]) {
      const r = await http.get(`/orders/${orderId}/events`);
      setEvents((prev) => ({ ...prev, [orderId]: r.data }));
    }
  };

  return (
    <div>
      <h2>Mis pedidos</h2>
      {orders.map((order) => (
        <div key={order.id} className="card">
          <h3>
            Pedido #{order.id} - {order.status}
          </h3>
          <b>Total: ${order.total}</b>
          <ul>
            {order.OrderItems?.map((item) => (
              <li key={item.id}>
                Producto {item.productId} x {item.quantity} - ${item.unitPrice}
              </li>
            ))}
          </ul>

          {order.Shipment ? (
            <div style={{ marginTop: 6 }}>
              <b>Envio:</b> {order.Shipment.carrier} - Guia:{" "}
              {order.Shipment.trackingUrl ? (
                <a href={order.Shipment.trackingUrl} target="_blank" rel="noreferrer">
                  {order.Shipment.trackingNumber}
                </a>
              ) : (
                order.Shipment.trackingNumber
              )}
              <div style={{ fontSize: 12, opacity: 0.8 }}>Estado del envio: {order.Shipment.status}</div>
            </div>
          ) : (
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>Aun sin envio.</div>
          )}

          <button type="button" onClick={() => toggle(order.id)} style={{ marginTop: 6 }}>
            {open[order.id] ? "Ocultar historial" : "Ver historial"}
          </button>

          {open[order.id] && (
            <div style={{ marginTop: 8, fontSize: 14 }}>
              {(events[order.id] || []).map((ev) => (
                <div key={ev.id} style={{ padding: "6px 0", borderTop: "1px solid #eee" }}>
                  <b>{ev.type}</b> - {ev.note || "-"}{" "}
                  <span style={{ opacity: 0.7 }}>({new Date(ev.createdAt).toLocaleString()})</span>
                </div>
              ))}
              {(!events[order.id] || events[order.id].length === 0) && <div>No hay eventos.</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
