import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { list, create, remove } from "../controllers/categoryController.js";

const r = Router();
r.get("/", list);                 // público
r.post("/", auth("admin"), create);
r.delete("/:id", auth("admin"), remove);
export default r;
