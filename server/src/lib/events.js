import { OrderEvent } from "../models/OrderEvent.js";

export async function createEvent({ orderId, type, note = null, actorType = "system", actorId = null, transaction = null }) {
  return OrderEvent.create({ orderId, type, note, actorType, actorId }, { transaction });
}
