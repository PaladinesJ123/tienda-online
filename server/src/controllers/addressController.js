import { Address } from "../models/Address.js";
import { Op } from "sequelize";

export const listMine = async (req,res)=>{
  const rows = await Address.findAll({
    where: { userId: req.user.id },
    order: [
      ["isDefault","DESC"],
      ["id","DESC"]
    ]
  });
  res.json(rows);
};

export const createOne = async (req,res)=>{
  const { name, phone, line1, line2, city, state, postalCode, country, isDefault } = req.body;
  const a = await Address.create({
    userId: req.user.id, name, phone, line1, line2, city, state, postalCode, country, isDefault: !!isDefault
  });
  if (isDefault) {
    await Address.update({ isDefault: false }, { where: { userId: req.user.id, id: { [Op.ne]: a.id } } });
  }
  res.status(201).json(a);
};

export const updateOne = async (req,res)=>{
  const a = await Address.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!a) return res.status(404).json({ error: "No encontrado" });
  const { name, phone, line1, line2, city, state, postalCode, country, isDefault } = req.body;
  await a.update({ name, phone, line1, line2, city, state, postalCode, country, isDefault: !!isDefault });
  if (isDefault) {
    await Address.update({ isDefault: false }, { where: { userId: req.user.id, id: { [Op.ne]: a.id } } });
  }
  res.json(a);
};

export const removeOne = async (req,res)=>{
  const a = await Address.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!a) return res.status(404).json({ error: "No encontrado" });
  await a.destroy();
  res.json({ ok: true });
};

export const setDefault = async (req,res)=>{
  const a = await Address.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!a) return res.status(404).json({ error: "No encontrado" });
  await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
  await a.update({ isDefault: true });
  res.json({ ok: true });
};
