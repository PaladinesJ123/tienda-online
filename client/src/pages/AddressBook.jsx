import { useEffect, useState } from "react";
import http from "../api/http";

const EMPTY = { id:null, name:"", phone:"", line1:"", line2:"", city:"", state:"", postalCode:"", country:"US", isDefault:false };

export default function AddressBook(){
  const [rows,setRows]=useState([]);
  const [form,setForm]=useState(EMPTY);
  const [loading,setLoading]=useState(true);

  const load = async ()=>{
    setLoading(true);
    const r = await http.get("/addresses/mine");
    setRows(r.data);
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const edit = (a)=> setForm({ ...a });
  const clean = ()=> setForm(EMPTY);

  const save = async (e)=>{
    e.preventDefault();
    const body = { ...form };
    if (form.id) await http.put(`/addresses/${form.id}`, body);
    else await http.post(`/addresses`, body);
    clean(); load();
  };

  const remove = async (id)=>{
    if (!confirm("¿Eliminar dirección?")) return;
    await http.delete(`/addresses/${id}`);
    load();
  };

  const makeDefault = async (id)=>{
    await http.post(`/addresses/${id}/default`);
    load();
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:16}}>
      <div>
        <h2>Mis direcciones</h2>
        {rows.length===0 && <p>No tienes direcciones.</p>}
        {rows.map(a=>(
          <div className="card" key={a.id} style={{marginBottom:12}}>
            <b>{a.name}</b> {a.isDefault && <span style={{fontSize:12, marginLeft:6}}>(principal)</span>}
            <div>{a.line1}{a.line2 ? `, ${a.line2}` : ""}</div>
            <div>{a.city}{a.state ? `, ${a.state}`:""} {a.postalCode ? ` ${a.postalCode}`:""} — {a.country}</div>
            {a.phone && <div>Tel: {a.phone}</div>}
            <div style={{marginTop:8, display:"flex", gap:8}}>
              <button onClick={()=>edit(a)}>Editar</button>
              <button onClick={()=>remove(a.id)}>Eliminar</button>
              {!a.isDefault && <button onClick={()=>makeDefault(a.id)}>Hacer principal</button>}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>{form.id ? "Editar dirección" : "Nueva dirección"}</h3>
        <form onSubmit={save} className="form">
          <input placeholder="Nombre / etiqueta" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
          <input placeholder="Teléfono (opcional)" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
          <input placeholder="Calle y número" value={form.line1} onChange={e=>setForm({...form, line1:e.target.value})} required />
          <input placeholder="Depto / piso (opcional)" value={form.line2||""} onChange={e=>setForm({...form, line2:e.target.value})} />
          <input placeholder="Ciudad" value={form.city} onChange={e=>setForm({...form, city:e.target.value})} required />
          <input placeholder="Provincia/Estado (opcional)" value={form.state||""} onChange={e=>setForm({...form, state:e.target.value})} />
          <input placeholder="Código Postal (opcional)" value={form.postalCode||""} onChange={e=>setForm({...form, postalCode:e.target.value})} />
          <input placeholder="País (ISO-2, ej US/EC/ES)" value={form.country} onChange={e=>setForm({...form, country:e.target.value.toUpperCase()})} maxLength={2} required />
          <label><input type="checkbox" checked={!!form.isDefault} onChange={e=>setForm({...form, isDefault:e.target.checked})}/> Hacer principal</label>
          <div style={{display:"flex", gap:8}}>
            <button type="submit">{form.id ? "Guardar" : "Crear"}</button>
            {form.id && <button type="button" onClick={clean}>Cancelar</button>}
          </div>
        </form>
      </div>
    </div>
  );
}
