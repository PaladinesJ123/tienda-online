import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { cloudinary } from "../lib/cloudinary.js";

const r = Router();

/**
 * Devuelve firma para subir directo a Cloudinary desde el browser.
 * Body opcional: { folder, public_id }
 */
r.post("/sign", auth("admin"), async (req, res) => {
  const folder = req.body?.folder || process.env.CLOUDINARY_FOLDER || "tienda/products";
  const public_id = req.body?.public_id || undefined;
  const timestamp = Math.floor(Date.now() / 1000);

  const paramsToSign = { timestamp, folder, ...(public_id ? { public_id } : {}) };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);

  res.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    timestamp,
    folder,
    signature
  });
});

r.post("/delete", auth("admin"), async (req,res)=>{
  const { public_id } = req.body || {};
  if (!public_id) return res.status(400).json({ error:"Falta public_id" });
  try {
    const result = await cloudinary.uploader.destroy(public_id, { invalidate: true });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default r;
