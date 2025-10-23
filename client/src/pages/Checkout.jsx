import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import http from "../api/http";

const stripePromise = loadStripe("pk_test_XXXXXXXXXXXXXXXXXXXXXXXX"); // tu PK test

function CheckoutForm({ clientSecret, orderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e)=>{
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + `/order/${orderId}/thanks` }
    });
    if (error) setErrorMsg(error.message || "Error en el pago");
    setLoading(false);
  };

  return (
    <form onSubmit={onSubmit} className="form" style={{maxWidth:420}}>
      <PaymentElement />
      {errorMsg && <p style={{color:"crimson"}}>{errorMsg}</p>}
      <button disabled={!stripe || loading} style={{marginTop:12}}>
        {loading ? "Procesando..." : "Pagar"}
      </button>
    </form>
  );
}

export default function Checkout(){
  const { orderId } = useParams();
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(()=>{
    (async ()=>{
      const r = await http.post("/payments/intent", { orderId: Number(orderId) });
      setClientSecret(r.data.clientSecret);
    })();
  }, [orderId]);

  if (!clientSecret) return <p>Cargando pago...</p>;

  return (
    <Elements options={{ clientSecret }} stripe={stripePromise}>
      <h2>Pagar pedido #{orderId}</h2>
      <CheckoutForm clientSecret={clientSecret} orderId={orderId}/>
    </Elements>
  );
}
