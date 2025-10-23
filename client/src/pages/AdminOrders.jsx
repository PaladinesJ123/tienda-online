import { useEffect, useState } from "react";
import http from "../api/http";

const STATES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shipForm, setShipForm] = useState({ carrier: "", trackingNumber: "", notes: "" });
  const [evOpen, setEvOpen] = useState({});
  const [evData, setEvData] = useState({});

  const load = async () => {
    setLoading(true);
    const r = await http.get("/orders"); // incluye Shipment ahora
    setOrders(r.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id, status) => {
    await http.patch(`/orders/${id}/status`, { status });
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
  };

  const createShipment = async (orderId) => {
    if (!shipForm.carrier || !shipForm.trackingNumber) {
      alert("Transportista y numero de guia son obligatorios.");
      return;
    }
    const r = await http.post("/shipments", { orderId, ...shipForm });
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, Shipment: r.data, status: "shipped" } : o)));
    setShipForm({ carrier: "", trackingNumber: "", notes: "" });
  };

  const setShipmentDelivered = async (shipmentId, orderId) => {
    await http.patch(`/shipments/${shipmentId}`, { status: "delivered" });
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId ? { ...o, status: "delivered", Shipment: { ...o.Shipment, status: "delivered" } } : o
      )
    );
  };

  const loadEvents = async (orderId) => {
    if (!evData[orderId]) {
      const r = await http.get(`/orders/${orderId}/events`);
      setEvData(prev => ({ ...prev, [orderId]: r.data }));
    }
    setEvOpen(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <h2>Pedidos</h2>
      {orders.map(o => (
        <div className="card" key={o.id} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <b>Pedido #{o.id}</b> - {o.User?.name} &lt;{o.User?.email}&gt; - Total: ${o.total}
              <div style={{ fontSize: 12, opacity: 0.8 }}>Estado: {o.status}</div>
            </div>
            <div>
              <select value={o.status} onChange={e => setStatus(o.id, e.target.value)}>
                {STATES.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ul>
            {o.OrderItems?.map(oi => (
              <li key={oi.id}>
                {oi.Product?.title ?? `Producto ${oi.productId}`} x {oi.quantity} - ${oi.unitPrice}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #eee" }}>
            <b>Envio</b>
            {o.Shipment ? (
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
                <span>Carrier: {o.Shipment.carrier}</span>
                <span>Guia: {o.Shipment.trackingNumber}</span>
                <span>Estado: {o.Shipment.status}</span>
                {o.Shipment.status !== "delivered" && (
                  <button onClick={() => setShipmentDelivered(o.Shipment.id, o.id)}>Marcar entregado</button>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <input
                  placeholder="Carrier (ej: Servientrega/DHL)"
                  value={shipForm.carrier}
                  onChange={e => setShipForm(f => ({ ...f, carrier: e.target.value }))}
                />
                <input
                  placeholder="Numero de guia"
                  value={shipForm.trackingNumber}
                  onChange={e => setShipForm(f => ({ ...f, trackingNumber: e.target.value }))}
                />
                <input
                  placeholder="Notas (opcional)"
                  value={shipForm.notes}
                  onChange={e => setShipForm(f => ({ ...f, notes: e.target.value }))}
                />
                <button onClick={() => createShipment(o.id)}>Crear envio</button>
              </div>
            )}
          </div>

          <button onClick={() => loadEvents(o.id)} style={{ marginTop: 6 }}>
            {evOpen[o.id] ? "Ocultar historial" : "Ver historial"}
          </button>

          {evOpen[o.id] && (
            <div style={{ marginTop: 8, fontSize: 13 }}>
              {(evData[o.id] || []).map(ev => (
                <div key={ev.id} style={{ padding: "6px 0", borderTop: "1px solid #eee" }}>
                  <b>{ev.type}</b> - {ev.note || "-"}{" "}
                  <span style={{ opacity: 0.7 }}>({new Date(ev.createdAt).toLocaleString()})</span>
                </div>
              ))}
              {(!evData[o.id] || evData[o.id].length === 0) && <div>No hay eventos.</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
