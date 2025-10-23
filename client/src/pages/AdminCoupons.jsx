import { useEffect, useState } from "react";
import http from "../api/http";

const EMPTY = {
  id:null, code:"", type:"percentage", value:"10",
  maxDiscount:"", minOrderTotal:"0",
  startsAt:"", expiresAt:"",
  usageLimit:"", perUserLimit:"",
  isActive:true
};

export default function AdminCoupons(){
  const [rows,setRows]=useState([]);
  const [f,setF]=useState(EMPTY);

  const load = async ()=>{
    const r = await http.get("/coupons");
    setRows(r.data);
  };
  useEffect(()=>{ load(); },[]);

  const edit = (c)=> setF({
    ...c,
    value: String(c.value),
    maxDiscount: c.maxDiscount ?? "",
    minOrderTotal: String(c.minOrderTotal ?? "0"),
    startsAt: c.startsAt ? c.startsAt.slice(0,16) : "",
    expiresAt: c.expiresAt ? c.expiresAt.slice(0,16) : "",
    usageLimit: c.usageLimit ?? "",
    perUserLimit: c.perUserLimit ?? ""
  });

  const clean = ()=> setF(EMPTY);

  const save = async (e)=>{
    e.preventDefault();
    const body = {
      code: f.code,
      type: f.type,
      value: Number(f.value),
      maxDiscount: f.maxDiscount!=="" ? Number(f.maxDiscount) : null,
      minOrderTotal: Number(f.minOrderTotal||0),
      startsAt: f.startsAt!=="" ? new Date(f.startsAt) : null,
      expiresAt: f.expiresAt!=="" ? new Date(f.expiresAt) : null,
      usageLimit: f.usageLimit!=="" ? Number(f.usageLimit) : null,
      perUserLimit: f.perUserLimit!=="" ? Number(f.perUserLimit) : null,
      isActive: !!f.isActive
    };
    if (f.id) await http.put(`/coupons/${f.id}`, body);
    else await http.post(`/coupons`, body);
    clean(); load();
  };

  const remove = async (id)=>{
    if (!confirm("¿Eliminar cupón?")) return;
    await http.delete(`/coupons/${id}`);
    load();
  };

  return (
    <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:16}}>
      <div>
        <h2>Cupones</h2>
        <table width="100%" cellPadding="6">
          <thead>
            <tr>
              <th>ID</th><th>Código</th><th>Tipo</th><th>Valor</th><th>Usos</th><th>Activo</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(c=>(
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.code}</td>
                <td>{c.type}</td>
                <td>{c.type==="percentage" ? `${c.value}%` : `$${c.value}`}</td>
                <td>{c.usageCount}{c.usageLimit?`/${c.usageLimit}`:""}</td>
                <td>{c.isActive ? "Sí" : "No"}</td>
                <td>
                  <button onClick={()=>edit(c)}>Editar</button>{" "}
                  <button onClick={()=>remove(c.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>{f.id ? "Editar" : "Crear"} cupón</h3>
        <form onSubmit={save} className="form">
          <input placeholder="CÓDIGO (MAYÚSCULAS)" value={f.code} onChange={e=>setF({...f, code:e.target.value.toUpperCase()})} required />
          <select value={f.type} onChange={e=>setF({...f, type:e.target.value})}>
            <option value="percentage">% (porcentaje)</option>
            <option value="fixed">Fijo ($)</option>
          </select>
          <input type="number" step="0.01" placeholder={f.type==="percentage"?"%":"$"} value={f.value} onChange={e=>setF({...f, value:e.target.value})} required />
          <input type="number" step="0.01" placeholder="Tope de descuento (opcional)" value={f.maxDiscount} onChange={e=>setF({...f, maxDiscount:e.target.value})} />
          <input type="number" step="0.01" placeholder="Subtotal mínimo" value={f.minOrderTotal} onChange={e=>setF({...f, minOrderTotal:e.target.value})} />
          <label>Inicio: <input type="datetime-local" value={f.startsAt} onChange={e=>setF({...f, startsAt:e.target.value})} /></label>
          <label>Fin: <input type="datetime-local" value={f.expiresAt} onChange={e=>setF({...f, expiresAt:e.target.value})} /></label>
          <input type="number" placeholder="Límite global usos (opcional)" value={f.usageLimit} onChange={e=>setF({...f, usageLimit:e.target.value})} />
          <input type="number" placeholder="Límite por usuario (opcional)" value={f.perUserLimit} onChange={e=>setF({...f, perUserLimit:e.target.value})} />
          <label><input type="checkbox" checked={!!f.isActive} onChange={e=>setF({...f, isActive:e.target.checked})}/> Activo</label>
          <div style={{display:"flex", gap:8}}>
            <button type="submit">{f.id ? "Guardar" : "Crear"}</button>
            {f.id && <button type="button" onClick={clean}>Cancelar</button>}
          </div>
        </form>
      </div>
    </div>
  );
}
