import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { User } from "../models/User.js";

const r = Router();

// Listar usuarios (solo superadmin)
r.get("/", auth("superadmin"), async (req, res) => {
  const users = await User.findAll({ attributes: ["id","name","email","role","createdAt"] });
  res.json(users);
});

// Promover/demover rol (solo superadmin)
r.patch("/:id/role", auth("superadmin"), async (req, res) => {
  const { role } = req.body; // 'customer' | 'admin' | 'superadmin'
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: "No encontrado" });
  user.role = role;
  await user.save();
  res.json({ id: user.id, role: user.role });
});

export default r;
