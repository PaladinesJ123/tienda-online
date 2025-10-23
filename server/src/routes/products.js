import { Router } from "express";
import * as pc from "../controllers/productController.js";
import { auth } from "../middleware/auth.js";
const r = Router();

r.get("/", pc.list);
r.get("/:id", pc.get);
r.post("/", auth("admin"), pc.create);
r.put("/:id", auth("admin"), pc.update);
r.delete("/:id", auth("admin"), pc.remove);

export default r;
