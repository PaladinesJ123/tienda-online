import "dotenv/config";
import bcrypt from "bcryptjs";
import { sequelize } from "../src/db.js";
import { User } from "../src/models/User.js";

const email = process.argv[2] || "steevenpaladines@gmail.com";
const pass  = process.argv[3] || "Joelpaladines1";
const name  = process.argv[4] || "PaladinesJ";

(async () => {
  try {
    await sequelize.authenticate();
    const passwordHash = await bcrypt.hash(pass, 10);
    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({ name, email, passwordHash, role: "superadmin" });
      console.log("✅ Superadmin creado:", email);
    } else {
      user.passwordHash = passwordHash;
      user.role = "superadmin";
      await user.save();
      console.log("✅ Usuario promovido a superadmin:", email);
    }
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await sequelize.close();
  }
})();
