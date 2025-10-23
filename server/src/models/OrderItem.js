import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db.js";
import { Order } from "./Order.js";
import { Product } from "./Product.js";

export class OrderItem extends Model {}

OrderItem.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  quantity: { type: DataTypes.INTEGER, allowNull:false },
  unitPrice: { type: DataTypes.DECIMAL(10,2), allowNull:false },
  orderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
}, { sequelize, modelName: "OrderItem", tableName: "order_items" });

// Si se borra un pedido, borramos sus ítems
OrderItem.belongsTo(Order, {
  foreignKey: { name: "orderId", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});
Order.hasMany(OrderItem, {
  foreignKey: { name: "orderId", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});

// No permitimos borrar producto si tiene ventas (histórico)
OrderItem.belongsTo(Product, {
  foreignKey: { name: "productId", allowNull: false },
  onDelete: "RESTRICT",
  onUpdate: "CASCADE"
});
Product.hasMany(OrderItem, {
  foreignKey: { name: "productId", allowNull: false },
  onDelete: "RESTRICT",
  onUpdate: "CASCADE"
});
