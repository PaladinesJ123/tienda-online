import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { createPaymentIntent, stripeWebhook } from "../controllers/paymentsController.js";
import express from "express";

const r = Router();

// Crea PaymentIntent (necesita usuario logueado)
r.post("/intent", auth(), createPaymentIntent);

// El webhook necesita raw body y NO debe pasar por express.json()
// Defínelo en app.js directamente (ver abajo)
export default r;

// NOTA: el handler stripeWebhook se monta en app.js con express.raw()
export const webhookHandler = stripeWebhook;
