import { Category } from "../models/associations.js";
import { Op } from "sequelize";

export const list = async (_req,res)=>{
  const rows = await Category.findAll({ order:[["name","ASC"]] });
  res.json(rows);
};

export const create = async (req,res)=>{
  const { name } = req.body;
  if (!name) return res.status(400).json({ error:"Falta name" });
  const slug = name.toString().toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9\-]/g,"");
  const c = await Category.create({ name, slug });
  res.status(201).json(c);
};

export const remove = async (req,res)=>{
  const c = await Category.findByPk(req.params.id);
  if (!c) return res.status(404).json({ error:"No encontrado" });
  await c.destroy();
  res.json({ ok:true });
};
