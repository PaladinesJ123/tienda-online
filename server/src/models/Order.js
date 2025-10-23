import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db.js";
import { User } from "./User.js";
import { Coupon } from "./Coupon.js";

export class Order extends Model {}

Order.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  status: { type: DataTypes.ENUM("pending","paid","shipped","delivered","cancelled"), defaultValue:"pending" },
  total: { type: DataTypes.DECIMAL(10,2), allowNull:false },
  userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },

  // Snapshot de envío
  shippingName: { type: DataTypes.STRING(100) },
  shippingPhone: { type: DataTypes.STRING(30) },
  shippingLine1: { type: DataTypes.STRING(160) },
  shippingLine2: { type: DataTypes.STRING(160) },
  shippingCity: { type: DataTypes.STRING(80) },
  shippingState: { type: DataTypes.STRING(80) },
  shippingPostalCode: { type: DataTypes.STRING(20) },
  shippingCountry: { type: DataTypes.STRING(2) },

  couponId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  couponCode: { type: DataTypes.STRING(40), allowNull: true },
  discountAmount: { type: DataTypes.DECIMAL(10,2), allowNull:false, defaultValue: 0 },

  
}, { sequelize, modelName: "Order", tableName: "orders" });

Order.belongsTo(User, {
  foreignKey: { name: "userId", allowNull: false },
  onDelete: "RESTRICT",
  onUpdate: "CASCADE"
});
User.hasMany(Order, {
  foreignKey: { name: "userId", allowNull: false },
  onDelete: "RESTRICT",
  onUpdate: "CASCADE"
});

Order.belongsTo(Coupon, { foreignKey: { name:"couponId", allowNull: true } });