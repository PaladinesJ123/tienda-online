import { Sequelize } from "sequelize";
import "dotenv/config";

const {
  DB_HOST, DB_PORT=3306, DB_USER, DB_PASS, DB_NAME,
  DATABASE_URL,            // mysql://user:pass@host:port/dbname
  DB_SSL                   // "true" para forzar SSL
} = process.env;

const useUrl = !!DATABASE_URL;
const sequelize = useUrl
  ? new Sequelize(DATABASE_URL, {
      dialect: "mysql",
      logging: false,
      dialectOptions: (DB_SSL === "true") ? { ssl: { require: true } } : {}
    })
  : new Sequelize(DB_NAME, DB_USER, DB_PASS, {
      host: DB_HOST, port: DB_PORT, dialect: "mysql", logging: false,
      dialectOptions: (DB_SSL === "true") ? { ssl: { require: true } } : {}
    });

export { sequelize };
