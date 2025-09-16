import oracledb from "oracledb";
import dotenv from "dotenv";

dotenv.config();

export async function getConnection() {
  return await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    connectString: process.env.DB_CONN 
  });
}