import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { validateCoupon, listCoupons, createCoupon, updateCoupon, deleteCoupon } from "../controllers/couponsController.js";

const r = Router();

// validar (usuario puede/no estar logueado, pero si lo está, sirve para perUserLimit)
r.get("/validate", auth(), validateCoupon); // si prefieres público, duplica otra ruta sin auth()

// admin
r.get("/", auth("admin"), listCoupons);
r.post("/", auth("admin"), createCoupon);
r.put("/:id", auth("admin"), updateCoupon);
r.delete("/:id", auth("admin"), deleteCoupon);

export default r;
