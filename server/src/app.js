import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import userRoutes from "./routes/users.js";
import paymentRoutes, { webhookHandler } from "./routes/payments.js";
import addressRoutes from "./routes/addresses.js";
import couponRoutes from "./routes/coupons.js";
import shipmentRoutes from "./routes/shipments.js";
import uploadRoutes from "./routes/uploads.js";
import categoryRoutes from "./routes/categories.js";
import "./models/associations.js";

dotenv.config();
const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.post("/api/payments/webhook", express.raw({ type: "application/json" }), webhookHandler);

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

app.get("/", (_, res) => res.json({ ok: true, service: "tienda-api" }));
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/categories", categoryRoutes);

const port = process.env.PORT || 4000;
(async () => {
  await sequelize.authenticate();
  console.log("DB conectada");
  app.listen(port, () => console.log(`API en http://localhost:${port}`));
})();
