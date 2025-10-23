import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db.js";

export class User extends Model {}
User.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM("customer","admin","superadmin"), defaultValue: "customer" }
}, { sequelize, modelName: "User", tableName: "users" });
