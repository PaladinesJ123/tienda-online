import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { listMine, createOne, updateOne, removeOne, setDefault } from "../controllers/addressController.js";

const r = Router();
r.use(auth()); // todas requieren usuario logueado

r.get("/mine", listMine);
r.post("/", createOne);
r.put("/:id", updateOne);
r.delete("/:id", removeOne);
r.post("/:id/default", setDefault);

export default r;
