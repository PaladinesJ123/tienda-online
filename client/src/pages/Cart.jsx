import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import http from "../api/http";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { items, remove } = useCart();
  const nav = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState(null);
  const [coupon, setCoupon] = useState("");
  const [couponInfo, setCouponInfo] = useState(null); // { ok, discount, final, message }

  const subtotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const previewTotal = couponInfo?.ok ? couponInfo.final : subtotal;

  useEffect(() => {
    (async () => {
      try {
        const r = await http.get("/addresses/mine");
        setAddresses(r.data);
        const def = r.data.find(a => a.isDefault) || r.data[0];
        setAddressId(def?.id ?? null);
      } catch {
        // ignorar carga fallida de direcciones
      }
    })();
  }, []);

  const applyCoupon = async () => {
    const cleanCode = coupon.trim();
    if (!cleanCode) {
      setCouponInfo(null);
      return;
    }
    try {
      const r = await http.get("/coupons/validate", { params: { code: cleanCode, total: subtotal } });
      setCoupon(cleanCode);
      setCouponInfo(r.data);
    } catch {
      setCouponInfo({ ok: false, message: "Error al validar" });
    }
  };

  const checkout = async () => {
    if (items.length === 0) return;
    if (!addressId) {
      alert("Selecciona una direccion.");
      return;
    }
    const couponToSend = couponInfo?.ok ? (couponInfo.code || coupon.trim()) : undefined;
    const payload = {
      items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
      addressId,
      ...(couponToSend ? { couponCode: couponToSend } : {})
    };
    const r = await http.post("/orders", payload);
    // Si prefieres, limpia el carrito tras crear la orden antes de navegar
    nav(`/checkout/${r.data.id}`);
  };

  return (
    <div>
      <h2>Carrito</h2>
      {items.length === 0 ? (
        <p>Vacio</p>
      ) : (
        <>
          {items.map(i => (
            <div key={i.product.id} className="row">
              <span>
                {i.product.title} x {i.quantity}
              </span>
              <button type="button" onClick={() => remove(i.product.id)}>
                Quitar
              </button>
            </div>
          ))}

          <div className="card" style={{ margin: "12px 0", padding: 12 }}>
            <b>Direccion de envio</b>
            <br />
            {addresses.length === 0 ? (
              <p>
                No tienes direcciones. <Link to="/addresses">Crear direccion</Link>
              </p>
            ) : (
              <select value={addressId ?? ""} onChange={e => setAddressId(Number(e.target.value) || null)}>
                <option value="" disabled>
                  Selecciona una direccion
                </option>
                {addresses.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} - {a.line1}, {a.city} {a.postalCode ?? ""} ({a.country})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="card" style={{ margin: "12px 0", padding: 12 }}>
            <b>Cupon</b>
            <br />
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                placeholder="CODIGO10"
                style={{ flex: "0 0 160px" }}
              />
              <button type="button" onClick={applyCoupon}>
                Aplicar
              </button>
              {couponInfo && (
                <span style={{ marginLeft: 8 }}>
                  {couponInfo.ok
                    ? `[OK] Descuento $${Number(couponInfo.discount ?? 0).toFixed(2)}`
                    : `[X] ${couponInfo.message || "Invalido"}`}
                </span>
              )}
            </div>
          </div>

          <h4>Subtotal: ${subtotal.toFixed(2)}</h4>
          <h3>Total a pagar: ${previewTotal.toFixed(2)}</h3>

          <button type="button" onClick={checkout} disabled={!addressId}>
            Pagar / Confirmar
          </button>
        </>
      )}
    </div>
  );
}
