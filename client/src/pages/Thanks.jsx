import { Link, useParams } from "react-router-dom";
export default function Thanks(){
  const { orderId } = useParams();
  return (
    <div className="card" style={{padding:16}}>
      <h2>¡Gracias por tu compra!</h2>
      <p>Pedido #{orderId} — en minutos se confirmará como <b>paid</b>.</p>
      <Link to="/orders">Ver mis pedidos</Link>
    </div>
  );
}
