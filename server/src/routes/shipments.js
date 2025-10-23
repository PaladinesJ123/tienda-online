import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { createOrUpdate, updateStatus, listAll, byOrder } from "../controllers/shipmentsController.js";

const r = Router();
r.use(auth("admin"));               // solo admin/superadmin

r.get("/", listAll);
r.get("/by-order/:orderId", byOrder);
r.post("/", createOrUpdate);
r.patch("/:id", updateStatus);

export default r;
