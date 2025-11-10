// import mysql from "mysql2/promise";

// export const db = await mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",      
//   database: "ecommerce"
// });

// console.log("Connected to MySQL");


import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

console.log("Connected to Railway MySQL!");

