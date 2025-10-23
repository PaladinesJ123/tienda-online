import { useState } from "react";
import http from "../api/http";
import { useNavigate } from "react-router-dom";

export default function Signup(){
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const nav = useNavigate();
  const onSubmit = async (e)=>{
    e.preventDefault();
    await http.post("/auth/register", { name, email, password });
    alert("Cuenta creada. Ya puedes entrar.");
    nav("/login");
  };
  return (
    <form onSubmit={onSubmit} className="form">
      <h2>Crear cuenta</h2>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre"/>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"/>
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Contraseña"/>
      <button>Registrarme</button>
    </form>
  );
}
