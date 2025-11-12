import Stripe from "stripe";
import { db } from "../lib/db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// createplan
export const createplans = async (req, res) => {
  try {
    const plans = [
      {
        name: "Premium",
        price: 500, // INR
        currency: "inr",
        description:"10 % discount"
      },
      {
        name: "Pro",
        price: 1000, // INR
        currency: "inr",
        description:"10 % discount + Free Deleivery"
      },
    ];

    const createdPlans = [];

    for (const plan of plans) {
      //  Create Stripe Product
      const stripeProduct = await stripe.products.create({ name: plan.name });

      // Create Stripe Price (recurring monthly)
      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: plan.price * 100, // smallest currency unit
        currency: plan.currency,
        recurring: { interval: "month" },
      });

      //  Save plan in DB
      const [result] = await db.execute(
        `INSERT INTO subscription 
         (plan_name, stripe_product_id, stripe_price_id, price, currency)
         VALUES (?, ?, ?, ?, ?)`,
        [plan.name, stripeProduct.id, stripePrice.id, plan.price, plan.currency]
      );

      createdPlans.push({
        id: result.insertId,
        planName: plan.name,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
        price: plan.price,
        currency: plan.currency,
        description:plan.description
      });
    }

    res.status(200).json({
      message: "Plans created successfully",
      plans: createdPlans,
    });
  } catch (err) {
    console.error("Plan creation failed:", err);
    res.status(500).json({ message: "Failed to create plans" });
  }
};

// Get all plans 
export const getplans = async (req, res) => {
  try {
    const { userId } = req.params; // <-- get userId from URL params
    const planDescriptions = {
  "Premium": "10 % discount",
  "Pro": "10 % discount + Free Delivery"
};


    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const [plans] = await db.execute(
      `SELECT s.*,
              us.status AS subscription_status,
              us.stripe_subscription_id
       FROM subscription s
       LEFT JOIN user_subscriptions us
       ON s.stripe_price_id = us.price_id AND us.user_id = ?
      `,
      [userId]
    );

    // Replace null status with 'inactive' for frontend ease
    const formattedPlans = plans.map(plan => ({
  ...plan,
  subscription_status: plan.subscription_status || "inactive",
  description: planDescriptions[plan.plan_name] || ""
}));

    res.status(200).json({ plans: formattedPlans });
  } catch (err) {
    console.error("Fetching plans failed:", err);
    res.status(500).json({ message: "Failed to fetch plans" });
  }
};

