import { stripecustomer } from "../utils/stripecustomer.js";
import Stripe from "stripe";
import { db } from "../lib/db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


//createsubscription
export const createsubscription = async (req, res) => {
  try {
    const { userId, priceId } = req.body;

    if (!userId || !priceId) {
      return res.status(400).json({ message: "userId and priceId are required" });
    }

    //  Create or get Stripe customer
    const stripeCustomerId = await stripecustomer(userId);

    // Create Stripe Checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `https://ecommerce-react-three-psi.vercel.app/success/${userId}`,
      cancel_url: `https://ecommerce-react-three-psi.vercel.app/plans/${userId}?status=cancel`,
    });

     // Check if user already has this plan
    const [existingSub] = await db.execute(
      "SELECT id, status FROM user_subscriptions WHERE user_id = ? AND price_id = ?",
      [userId, priceId]
    );

    if (existingSub.length > 0) {
      // If subscription exists, update its status to pending
      await db.execute(
        "UPDATE user_subscriptions SET status = ? WHERE user_id = ? AND price_id = ?",
        ["pending", userId, priceId]
      );
    } else {
      // Else, create new record
      await db.execute(
        `INSERT INTO user_subscriptions (user_id, price_id, status)
         VALUES (?, ?, ?)`,
        [userId, priceId, "pending"]
      );
    }

    res.status(200).json({
      message: "Checkout session created successfully",
      sessionUrl: session.url,
    });
  } catch (err) {
    console.error("Stripe subscription checkout failed:", err);
    res.status(500).json({
      message: "Error creating subscription checkout",
      error: err.message,
    });
  }
};



//cancelsubscription
export const cancelsubscription = async (req, res) => {
  try {
    const { subscriptionId, immediate } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ message: "subscriptionId is required" });
    }

    let canceledSubscription;

    if (immediate) {
      // Cancel immediately in Stripe
      canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
    } else {
      // Cancel at period end
      canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }

    // No need to update DB here – webhook will handle it
    res.status(200).json({
      message: immediate
        ? "Subscription cancellation requested immediately"
        : "Subscription will cancel at period end",
      canceledSubscription,
    });
  } catch (err) {
    console.error("Cancel subscription failed:", err);
    res.status(500).json({
      message: "Error canceling subscription",
      error: err.message,
    });
  }
};
