import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db.js";
import { Order } from "./Order.js";

export class Shipment extends Model {}

Shipment.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  orderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
  carrier: { type: DataTypes.STRING(40), allowNull: false },          // DHL/UPS/FedEx/Servientrega/Correos...
  trackingNumber: { type: DataTypes.STRING(80), allowNull: false },
  trackingUrl: { type: DataTypes.STRING(512) },
  status: { type: DataTypes.ENUM("ready","in_transit","delivered","returned"), allowNull: false, defaultValue: "in_transit" },
  shippedAt: { type: DataTypes.DATE, allowNull: true },
  deliveredAt: { type: DataTypes.DATE, allowNull: true },
  notes: { type: DataTypes.STRING(255), allowNull: true }
}, { sequelize, modelName: "Shipment", tableName: "shipments" });

Shipment.belongsTo(Order, { foreignKey: { name:"orderId", allowNull:false }, onDelete:"CASCADE", onUpdate:"CASCADE" });
Order.hasOne(Shipment, { foreignKey: { name:"orderId", allowNull:false }, onDelete:"CASCADE", onUpdate:"CASCADE" });
