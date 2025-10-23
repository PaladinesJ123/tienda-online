import { useState } from "react";
import http from "../api/http";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom"; 

export default function Login(){
  const [email,setEmail]=useState(""); 
  const [password,setPassword]=useState("");
  const { login } = useAuth(); 
  const nav = useNavigate();

  const onSubmit = async (e)=>{
    e.preventDefault();
    const r = await http.post("/auth/login", { email, password });
    login(r.data);
    nav("/");
  };
  return (
    <form onSubmit={onSubmit} className="form">
      <h2>Iniciar sesión</h2>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"/>
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Contraseña"/>
      <button>Entrar</button>
      <p style={{marginTop:8}}>
        ¿No tienes cuenta? <Link to="/signup">Crear cuenta</Link>
      </p>

    </form>
  );
}
