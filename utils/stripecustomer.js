import { db } from "../lib/db.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripecustomer = async (userId) => {
  try {
    const [rows] = await db.execute(
      "SELECT stripe_customer_id, email FROM users WHERE id = ?",
      [userId]
    );

    let stripeCustomerId = rows[0]?.stripe_customer_id;
    const email = rows[0]?.email;

    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email, // fetched from DB
        metadata: { userId: userId.toString() },
      });
      stripeCustomerId = stripeCustomer.id;

      await db.execute(
        "UPDATE users SET stripe_customer_id = ? WHERE id = ?",
        [stripeCustomerId, userId]
      );
    }

    return stripeCustomerId;
  } catch (error) {
    console.error("Stripe customer creation failed:", error);
    throw new Error("Failed to get or create Stripe customer");
  }
};
