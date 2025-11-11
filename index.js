import express from "express";
import cors from "cors"
import { router } from "./routes/userroute.js";
import { db } from "./lib/db.js";
import bodyParser from "body-parser";
import { stripeWebhook } from "./controllers/webhookcontroller.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

const app=express()

app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhook
);
 
app.use(cors({
  origin: ["https://ecommerce-next-eosin-tau.vercel.app", "https://ecommerce-react-three-psi.vercel.app"],
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json())
app.get("/",(req,res)=>{
    res.send("sever starts")
})
app.get("/users", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM users"); 
    res.json(rows); 
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Database error" });
  }
});


app.use("/api",router)
app.listen(5000,()=>{
    console.log("http://localhost:5000")
})