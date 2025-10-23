import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db.js";
import { Coupon } from "./Coupon.js";
import { User } from "./User.js";
import { Order } from "./Order.js";

export class CouponUsage extends Model {}

CouponUsage.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  couponId: { type: DataTypes.INTEGER.UNSIGNED, allowNull:false },
  userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull:false },
  orderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull:false },
  amount: { type: DataTypes.DECIMAL(10,2), allowNull:false } // descuento aplicado
}, { sequelize, modelName: "CouponUsage", tableName: "coupon_usages" });

CouponUsage.belongsTo(Coupon, { foreignKey: { name:"couponId", allowNull:false }, onDelete:"RESTRICT" });
Coupon.hasMany(CouponUsage, { foreignKey: { name:"couponId", allowNull:false } });

CouponUsage.belongsTo(User, { foreignKey: { name:"userId", allowNull:false }, onDelete:"CASCADE" });
User.hasMany(CouponUsage, { foreignKey: { name:"userId", allowNull:false } });

CouponUsage.belongsTo(Order, { foreignKey: { name:"orderId", allowNull:false }, onDelete:"CASCADE" });
Order.hasMany(CouponUsage, { foreignKey: { name:"orderId", allowNull:false } });
