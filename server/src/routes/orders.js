import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { createOrder, myOrders, updateStatus, listAll, getEvents } from "../controllers/orderController.js";



const r = Router();
r.post("/", auth(), createOrder);              // cliente crea pedido
r.get("/mine", auth(), myOrders);              // cliente ve sus pedidos
r.get("/", auth("admin"), listAll);              // 👈 solo admin/superadmin
r.get("/:id/events", auth(), getEvents); // dueño o admin
r.patch("/:id/status", auth("admin"), updateStatus); // admin cambia estado
export default r;
