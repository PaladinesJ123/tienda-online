import { sequelize } from "../db.js";
import { Op } from "sequelize";
import { Product, Category, ProductCategory } from "../models/associations.js";

export const list = async (req,res) => {
  const {
    q = "",
    minPrice,
    maxPrice,
    categories,
    sort = "newest",
    page = 1,
    pageSize = 12
  } = req.query;

  const where = {};
  if (q) {
    where[Op.or] = [
      { title: { [Op.like]: `%${q}%` } },
      { description: { [Op.like]: `%${q}%` } }
    ];
  }
  if (minPrice !== undefined) {
    where.price = { ...(where.price || {}), [Op.gte]: Number(minPrice) };
  }
  if (maxPrice !== undefined) {
    where.price = { ...(where.price || {}), [Op.lte]: Number(maxPrice) };
  }

  const include = [];
  let categoryIds = [];
  if (categories) {
    categoryIds = Array.isArray(categories)
      ? categories.map(Number)
      : String(categories)
          .split(",")
          .map((x) => Number(x.trim()))
          .filter(Boolean);

    if (categoryIds.length) {
      include.push({
        model: Category,
        through: { attributes: [] },
        where: { id: { [Op.in]: categoryIds } }
      });
    }
  } else {
    include.push({ model: Category, through: { attributes: [] } });
  }

  const order =
    sort === "price_asc"
      ? [["price", "ASC"]]
      : sort === "price_desc"
      ? [["price", "DESC"]]
      : [["id", "DESC"]];

  const limit = Math.max(1, Math.min(60, Number(pageSize)));
  const currentPage = Math.max(1, Number(page));
  const offset = (currentPage - 1) * limit;

  const { rows, count } = await Product.findAndCountAll({
    where,
    include,
    order,
    limit,
    offset,
    distinct: true
  });

  res.json({
    items: rows,
    total: count,
    page: currentPage,
    pageSize: limit,
    pages: Math.ceil(count / limit) || 1
  });
};
export const get = async (req,res)=> {
  const p = await Product.findByPk(req.params.id);
  if (!p) return res.status(404).json({ error:"No encontrado" });
  res.json(p);
};
export const create = async (req,res)=>{
  const { title, description, price, stock, imageUrl, categoryIds = [] } = req.body;
  const result = await sequelize.transaction(async (t)=>{
    const product = await Product.create({ title, description, price, stock, imageUrl }, { transaction:t });
    if (Array.isArray(categoryIds) && categoryIds.length) {
      await product.setCategories(categoryIds, { transaction:t });
    }
    return product;
  });
  res.status(201).json(result);
};
export const update = async (req,res)=> {
  const { title, description, price, stock, imageUrl, categoryIds } = req.body;
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ error:"No encontrado" });

  await sequelize.transaction(async (t)=>{
    await product.update({ title, description, price, stock, imageUrl }, { transaction:t });
    if (Array.isArray(categoryIds)) {
      await product.setCategories(categoryIds, { transaction:t });
    }
  });

  const withCats = await Product.findByPk(product.id, { include: [{ model: Category, through:{attributes:[]} }]});
  res.json(withCats);
};
export const remove = async (req,res)=> {
  const p = await Product.findByPk(req.params.id);
  if (!p) return res.status(404).json({ error:"No encontrado" });
  await p.destroy();
  res.json({ ok:true });
};
