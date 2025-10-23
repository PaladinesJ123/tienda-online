import { Product } from "./Product.js";
import { Category } from "./Category.js";
import { ProductCategory } from "./ProductCategory.js";

Product.belongsToMany(Category, { through: ProductCategory, foreignKey: "productId" });
Category.belongsToMany(Product, { through: ProductCategory, foreignKey: "categoryId" });

export { Product, Category, ProductCategory };
