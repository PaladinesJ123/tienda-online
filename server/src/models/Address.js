import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db.js";
import { User } from "./User.js";

export class Address extends Model {}

Address.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false },           // Ej: "Casa", "Oficina" o nombre receptor
  phone: { type: DataTypes.STRING(30), allowNull: true },
  line1: { type: DataTypes.STRING(160), allowNull: false },          // calle y número
  line2: { type: DataTypes.STRING(160), allowNull: true },           // depto/piso
  city: { type: DataTypes.STRING(80), allowNull: false },
  state: { type: DataTypes.STRING(80), allowNull: true },
  postalCode: { type: DataTypes.STRING(20), allowNull: true },
  country: { type: DataTypes.STRING(2), allowNull: false, defaultValue: "US" },
  isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, { sequelize, modelName: "Address", tableName: "addresses" });

Address.belongsTo(User, {
  foreignKey: { name: "userId", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});
User.hasMany(Address, {
  foreignKey: { name: "userId", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});
