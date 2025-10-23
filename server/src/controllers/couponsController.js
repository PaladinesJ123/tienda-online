import { Op } from "sequelize";
import { Coupon } from "../models/Coupon.js";
import { CouponUsage } from "../models/CouponUsage.js";

function calcDiscount(subtotal, coupon) {
  let discount = 0;
  if (coupon.type === "percentage") {
    discount = Number(subtotal) * (Number(coupon.value) / 100);
    if (coupon.maxDiscount != null) discount = Math.min(discount, Number(coupon.maxDiscount));
  } else {
    discount = Math.min(Number(coupon.value), Number(subtotal));
  }
  return Number(discount.toFixed(2));
}

async function canUseCoupon({ coupon, userId }) {
  if (!coupon.isActive) return "Cupón inactivo";
  const now = new Date();
  if (coupon.startsAt && now < coupon.startsAt) return "Cupón aún no válido";
  if (coupon.expiresAt && now > coupon.expiresAt) return "Cupón expirado";
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) return "Cupón sin stock de usos";
  if (coupon.perUserLimit != null) {
    const count = await CouponUsage.count({ where: { couponId: coupon.id, userId } });
    if (count >= coupon.perUserLimit) return "Límite por usuario alcanzado";
  }
  return null;
}

export const validateCoupon = async (req,res)=>{
  const code = (req.query.code || "").toString().toUpperCase().trim();
  const subtotal = Number(req.query.total || 0);
  if (!code) return res.status(400).json({ ok:false, message:"Falta code" });

  const coupon = await Coupon.findOne({ where: { code } });
  if (!coupon) return res.json({ ok:false, message:"Cupón no existe" });

  const validationMsg = await canUseCoupon({ coupon, userId: req.user?.id || 0 });
  if (validationMsg) return res.json({ ok:false, message: validationMsg });

  if (subtotal < Number(coupon.minOrderTotal || 0))
    return res.json({ ok:false, message:`Subtotal mínimo ${coupon.minOrderTotal}` });

  const discount = calcDiscount(subtotal, coupon);
  return res.json({ ok:true, code: coupon.code, discount, final: Number((subtotal - discount).toFixed(2)) });
};

// --- Admin CRUD ---
export const listCoupons = async (_req,res)=>{
  const rows = await Coupon.findAll({ order:[["id","DESC"]] });
  res.json(rows);
};

export const createCoupon = async (req,res)=>{
  const body = req.body;
  body.code = (body.code || "").toUpperCase().trim();
  const c = await Coupon.create(body);
  res.status(201).json(c);
};

export const updateCoupon = async (req,res)=>{
  const c = await Coupon.findByPk(req.params.id);
  if (!c) return res.status(404).json({ error:"No encontrado" });
  const body = req.body;
  if (body.code) body.code = body.code.toUpperCase().trim();
  await c.update(body);
  res.json(c);
};

export const deleteCoupon = async (req,res)=>{
  const c = await Coupon.findByPk(req.params.id);
  if (!c) return res.status(404).json({ error:"No encontrado" });
  await c.destroy();
  res.json({ ok:true });
};
