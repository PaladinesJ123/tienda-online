import { useEffect, useState } from "react";
import http from "../api/http";

const emptyForm = { id: null, title: "", description: "", price: "", stock: "", imageUrl: "", categoryIds: [] };

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [allCats, setAllCats] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);
  useEffect(()=>{
    (async ()=>{
      const r = await http.get("/categories");
      setAllCats(r.data);
    })();
  },[]);

  const loadProducts = async () => {
    setLoading(true);
    const r = await http.get("/products?limit=1000");
    setItems(r.data.items);
    setLoading(false);
  };

  const edit = (product) => {
    setForm({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl || "",
      categoryIds: (product.Categories || []).map(c=>c.id)
    });
  };

  const clean = () => {
    setForm(emptyForm);
    setFile(null);
  };

  const save = async (e) => {
    e.preventDefault();
    const body = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      imageUrl: form.imageUrl || null,
      categoryIds: form.categoryIds
    };
    if (form.id) {
      await http.put(`/products/${form.id}`, body);
    } else {
      await http.post("/products", body);
    }
    clean();
    loadProducts();
  };

  const remove = async (id) => {
    if (!confirm("Eliminar producto?")) return;
    await http.delete(`/products/${id}`);
    loadProducts();
  };

  const uploadImage = async () => {
    if (!file) return;
    try {
      setUploading(true);
      const sign = await http.post("/uploads/sign", { folder: "tienda/products" });
      const { cloudName, apiKey, timestamp, folder, signature } = sign.data;

      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", apiKey);
      fd.append("timestamp", String(timestamp));
      fd.append("signature", signature);
      fd.append("folder", folder);

      const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
      const resp = await fetch(url, { method: "POST", body: fd });
      if (!resp.ok) throw new Error("Error al subir imagen");
      const json = await resp.json();

      setForm((prev) => ({ ...prev, imageUrl: json.secure_url }));
      setFile(null);
      alert("Imagen subida.");
    } catch (err) {
      alert(err.message || "Fallo la subida");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
      <div>
        <h2>Productos</h2>
        <table width="100%" cellPadding={8}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Titulo</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Categorias</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.title}</td>
                <td>${product.price}</td>
                <td>{product.stock}</td>
                <td>{(product.Categories || []).map(c=>c.name).join(", ")}</td>
                <td>
                  <button type="button" onClick={() => edit(product)}>
                    Editar
                  </button>{" "}
                  <button type="button" onClick={() => remove(product.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>{form.id ? "Editar" : "Crear"} producto</h3>
        <form onSubmit={save} className="form">
          <input
            placeholder="Titulo"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Descripcion"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Precio"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            required
          />
          <input
            placeholder="URL de imagen (opcional)"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />

          <div style={{marginTop:8}}>
            <b>Categorias</b>
            <div style={{display:"grid", gridTemplateColumns:"repeat(2,minmax(0,1fr))", gap:4, marginTop:6}}>
              {allCats.map(c=>(
                <label key={c.id} style={{display:"flex", gap:6, alignItems:"center"}}>
                  <input
                    type="checkbox"
                    checked={form.categoryIds.includes(c.id)}
                    onChange={e=>{
                      const set = new Set(form.categoryIds);
                      e.target.checked ? set.add(c.id) : set.delete(c.id);
                      setForm(f=>({ ...f, categoryIds: Array.from(set) }));
                    }}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>

          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt="preview"
              style={{ maxWidth: "100%", borderRadius: 8, marginTop: 8, marginBottom: 8 }}
            />
          )}
          <button type="button" disabled={!file || uploading} onClick={uploadImage}>
            {uploading ? "Subiendo..." : "Subir imagen"}
          </button>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button type="submit">{form.id ? "Guardar" : "Crear"}</button>
            {form.id && (
              <button type="button" onClick={clean}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
