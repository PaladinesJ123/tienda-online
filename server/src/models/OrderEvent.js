import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db.js";
import { Order } from "./Order.js";

export class OrderEvent extends Model {}

OrderEvent.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  orderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  type: { 
    type: DataTypes.ENUM("created","paid","shipped","delivered","cancelled","status_changed"),
    allowNull: false
  },
  note: { type: DataTypes.STRING(255), allowNull: true },
  actorType: { type: DataTypes.ENUM("system","user","admin","webhook"), allowNull: false, defaultValue: "system" },
  actorId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }
}, { sequelize, modelName: "OrderEvent", tableName: "order_events" });

OrderEvent.belongsTo(Order, { foreignKey: { name: "orderId", allowNull: false }, onDelete: "CASCADE", onUpdate: "CASCADE" });
Order.hasMany(OrderEvent, { foreignKey: { name: "orderId", allowNull: false }, onDelete: "CASCADE", onUpdate: "CASCADE" });
