import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { sendWelcomeEmail } from "../lib/mailer.js";

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ error: "Email ya registrado" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    try { await sendWelcomeEmail(user); } catch (e) { console.warn("Email welcome falló:", e.message); }
    res.json({ id:user.id, name:user.name, email:user.email });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: "Credenciales" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: "Credenciales" });
    const token = jwt.sign({ id:user.id, role:user.role, email:user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id:user.id, name:user.name, email:user.email, role:user.role } });
  } catch (e) { res.status(500).json({ error: e.message }); }
}
