import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db.js";

export class ProductCategory extends Model {}
ProductCategory.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  categoryId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
}, { sequelize, modelName: "ProductCategory", tableName: "product_categories", indexes:[
  { unique: true, fields: ["productId","categoryId"] }
]});
