import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db.js";

export class Category extends Model {}

Category.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  slug: { type: DataTypes.STRING(120), allowNull: false, unique: true }
}, { sequelize, modelName: "Category", tableName: "categories" });
