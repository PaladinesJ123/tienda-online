import { useEffect, useState } from "react";
import http from "../api/http";
import { Link, useSearchParams } from "react-router-dom";

export default function Home(){
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [meta, setMeta] = useState({ total:0, page:1, pages:1, pageSize:12 });

  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") || "";
  const minPrice = sp.get("minPrice") || "";
  const maxPrice = sp.get("maxPrice") || "";
  const sort = sp.get("sort") || "newest";
  const page = Number(sp.get("page") || 1);
  const selected = (sp.get("categories") || "").split(",").filter(Boolean).map(Number);

  const updateParam = (k,v)=>{
    const next = new URLSearchParams(sp);
    if (v==="" || v==null) next.delete(k); else next.set(k, String(v));
    next.set("page","1");
    setSp(next);
  };

  const toggleCat = (id)=>{
    const set = new Set(selected);
    set.has(id) ? set.delete(id) : set.add(id);
    const value = Array.from(set).join(",");
    updateParam("categories", value);
  };

  const load = async ()=>{
    const params = { q, minPrice, maxPrice, sort, page, pageSize: 12 };
    if (selected.length) params.categories = selected.join(",");
    const r = await http.get("/products", { params });
    setItems(r.data.items);
    setMeta({ total:r.data.total, page:r.data.page, pages:r.data.pages, pageSize:r.data.pageSize });
  };

  useEffect(()=>{
    (async ()=>{
      const c = await http.get("/categories");
      setCats(c.data);
    })();
  },[]);
  useEffect(()=>{ load(); }, [q, minPrice, maxPrice, sort, page, sp.get("categories")]); // eslint-disable-line

  return (
    <div style={{display:"grid", gridTemplateColumns:"260px 1fr", gap:16}}>
      <aside className="card" style={{padding:12}}>
        <h3>Filtrar</h3>
        <input placeholder="Buscar..." value={q} onChange={e=>updateParam("q", e.target.value)} />

        <div style={{display:"flex", gap:8, marginTop:8}}>
          <input type="number" min="0" step="0.01" placeholder="Min $" value={minPrice}
                 onChange={e=>updateParam("minPrice", e.target.value)} />
          <input type="number" min="0" step="0.01" placeholder="Max $" value={maxPrice}
                 onChange={e=>updateParam("maxPrice", e.target.value)} />
        </div>

        <div style={{marginTop:10}}>
          <b>Categorías</b>
          <div style={{display:"grid", gap:6, marginTop:6}}>
            {cats.map(c=>(
              <label key={c.id} style={{display:"flex", gap:6, alignItems:"center"}}>
                <input type="checkbox" checked={selected.includes(c.id)} onChange={()=>toggleCat(c.id)} />
                {c.name}
              </label>
            ))}
          </div>
        </div>

        <div style={{marginTop:10}}>
          <b>Orden</b><br/>
          <select value={sort} onChange={e=>updateParam("sort", e.target.value)}>
            <option value="newest">Novedades</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
          </select>
        </div>

        <button style={{marginTop:10}} onClick={()=>{
          const reset = new URLSearchParams();
          setSp(reset);
        }}>Limpiar filtros</button>
      </aside>

      <main>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <h2>Productos</h2>
          <span>{meta.total} resultados</span>
        </div>

        {items.length===0 ? <p>Sin resultados.</p> : (
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12}}>
            {items.map(p=>(
              <Link key={p.id} to={`/product/${p.id}`} className="card" style={{padding:8, textDecoration:"none", color:"inherit"}}>
                <img src={p.imageUrl || "/placeholder.png"} onError={e=>{ e.currentTarget.src="/placeholder.png"; }}
                     alt={p.title} style={{width:"100%", aspectRatio:"4/3", objectFit:"cover", borderRadius:8}}/>
                <div style={{marginTop:6}}>
                  <div style={{fontWeight:600}}>{p.title}</div>
                  <div>${Number(p.price).toFixed(2)}</div>
                  {Array.isArray(p.Categories) && p.Categories.length>0 && (
                    <div style={{fontSize:12, opacity:0.7, marginTop:4}}>
                      {p.Categories.map(c=>c.name).join(", ")}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {meta.pages>1 && (
          <div style={{marginTop:12, display:"flex", gap:8, flexWrap:"wrap"}}>
            {Array.from({length: meta.pages}, (_,i)=> i+1).map(n=>(
              <button key={n} disabled={n===meta.page}
                onClick={()=>{
                  const next = new URLSearchParams(sp);
                  next.set("page", String(n));
                  setSp(next);
                }}>
                {n}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
