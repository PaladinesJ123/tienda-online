import { sequelize } from "./db.js";
import "./models/User.js";
import "./models/Product.js";
import "./models/Order.js";
import "./models/OrderItem.js";
import "./models/Address.js";
import "./models/Coupon.js";
import "./models/CouponUsage.js";
import "./models/Shipment.js";
import "./models/OrderEvent.js";
import "./models/Category.js";
import "./models/ProductCategory.js";
import "./models/associations.js";


(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // en prod usa migrations
    console.log("DB sincronizada");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
