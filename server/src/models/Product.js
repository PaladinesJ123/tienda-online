import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db.js";

export class Product extends Model {}
Product.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(160), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  imageUrl: { type: DataTypes.STRING(512) }
}, { sequelize, modelName: "Product", tableName: "products" });
