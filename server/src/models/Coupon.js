import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db.js";

export class Coupon extends Model {}

Coupon.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING(40), allowNull:false, unique: true }, // usa MAYÚSCULAS
  type: { type: DataTypes.ENUM("percentage","fixed"), allowNull:false }, // % o monto fijo
  value: { type: DataTypes.DECIMAL(10,2), allowNull:false },            // ej 10 (%) o 5.00 (fijo)
  maxDiscount: { type: DataTypes.DECIMAL(10,2), allowNull: true },      // tope para % (opcional)
  minOrderTotal: { type: DataTypes.DECIMAL(10,2), allowNull:false, defaultValue: 0 },
  startsAt: { type: DataTypes.DATE, allowNull:true },
  expiresAt: { type: DataTypes.DATE, allowNull:true },
  usageLimit: { type: DataTypes.INTEGER, allowNull:true },              // límite global (opcional)
  usageCount: { type: DataTypes.INTEGER, allowNull:false, defaultValue: 0 },
  perUserLimit: { type: DataTypes.INTEGER, allowNull:true },            // límite por usuario (opcional)
  isActive: { type: DataTypes.BOOLEAN, allowNull:false, defaultValue: true }
}, { sequelize, modelName: "Coupon", tableName: "coupons" });
