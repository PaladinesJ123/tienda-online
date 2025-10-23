import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import http from "../api/http";
import { useCart } from "../context/CartContext";

export default function ProductDetails(){
  const { id } = useParams();
  const [p,setP]=useState(null);
  const { add } = useCart();
  const placeholder = "/placeholder.png";
  useEffect(()=>{ (async()=>{ const r=await http.get(`/products/${id}`); setP(r.data); })(); },[id]);
  if(!p) return "Cargando...";
  return (
    <div className="product">
      <img
        src={p.imageUrl || placeholder}
        onError={(e)=>{ e.currentTarget.src = placeholder; }}
        alt={p.title}
      />
      <div>
        <h2>{p.title}</h2>
        <p>{p.description}</p>
        <h3>${p.price}</h3>
        <button onClick={()=>add(p,1)}>Agregar al carrito</button>
      </div>
    </div>
  );
}
