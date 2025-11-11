import Stripe from "stripe";
import { db } from "../lib/db.js";
import dotenv from "dotenv";
import { Resend } from 'resend';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// Reusable Resend email function
const sendEmail = async (to, subject, html, text = "") => {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL, // must be a verified sender in Resend
      to: to,
      subject: subject,
      html: html,
      text: text || html,
    });
  } catch (err) {
    console.error("Resend email error:", err);
  }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    //  For normal product checkout
    case "checkout.session.completed": {
  const session = event.data.object;

  if (session.mode === "payment") {
    try {
      const orderId = session.metadata?.orderId;
      if (!orderId) break;

      //  Get final amounts from Stripe session
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      let total = 0;
      lineItems.data.forEach(item => {
        total += item.amount_total; // already multiplied by quantity
      });

      //  Check if discount applied via Stripe
      let discount = 0;
      if (session.total_details && session.total_details.amount_discount) {
        discount = session.total_details.amount_discount / 100; // convert to INR
      }

      const payableAmount = total / 100; // convert to INR

      //  Update DB with final amounts
      await db.execute(
        "UPDATE orders SET status = 'paid', discount = ?, payable_amount = ?, payment_intent_id = ? WHERE id = ?",
        [discount, payableAmount, session.payment_intent, orderId]
      );

      //  Clear cart
      const [orders] = await db.execute("SELECT user_id FROM orders WHERE id = ?", [orderId]);
      if (!orders.length) break;
      const userId = orders[0].user_id;
      await db.execute("DELETE FROM cart WHERE user_id = ?", [userId]);

      //  Send email
      const [users] = await db.execute("SELECT email, name FROM users WHERE id = ?", [userId]);
      if (users.length) {
        const user = users[0];
        await sendEmail(
              user.email,
              `Payment Successful - Order #${orderId}`,
              `<h2>Hi ${user.name},</h2><p>Your payment for Order #${orderId} was successful!</p>`
            );
      }

      console.log(`Payment success for order ${orderId}, discount: ${discount}, payable: ${payableAmount}`);
    } catch (err) {
      console.error("Error processing checkout.session.completed:", err);
    }
  }

      //  For subscription checkout sessions
      else if (session.mode === "subscription") {
        try {
          const subscriptionId = session.subscription;
          const customerId = session.customer;

          // Find user by Stripe customer ID
          const [users] = await db.execute(
            "SELECT id, email, name FROM users WHERE stripe_customer_id = ?",
            [customerId]
          );

          if (users.length) {
            const user = users[0];

            // Update user_subscriptions table
            await db.execute(
              `UPDATE user_subscriptions 
               SET stripe_subscription_id = ?, status = ? 
               WHERE user_id = ? AND status = 'pending'`,
              [subscriptionId, "active", user.id]
            );

            // Send confirmation email
            await sendEmail(
              user.email,
              "Subscription Activated",
              `<h2>Hi ${user.name},</h2><p>Your subscription is now active!</p>`
            );
            
            console.log(`Subscription ${subscriptionId} activated for user ${user.id}`);
          }
        } catch (err) {
          console.error("Error processing subscription:", err);
        }
      }
      break;
    }

    //  Subscription canceled event
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const subscriptionId = subscription.id;

      await db.execute(
        `UPDATE user_subscriptions 
         SET status = ? 
         WHERE stripe_subscription_id = ?`,
        ["canceled", subscriptionId]
      );
      console.log(`Subscription ${subscriptionId} canceled.`);
      break;
    }

    case "charge.refunded":
    case "refund.succeeded": {
      try {
        const refund = event.data.object;
        const paymentIntentId = refund.payment_intent;

        if (!paymentIntentId) break;

        const [orders] = await db.execute(
          "SELECT * FROM orders WHERE payment_intent_id = ?",
          [paymentIntentId]
        );

        if (!orders.length) break;

        const order = orders[0];

        await db.execute(
          `UPDATE orders SET refund_id=?, refund_status=?, refund_date=NOW(), status='Refunded', delivery_status='Cancelled' WHERE payment_intent_id=?`,
          [refund.id, refund.status, paymentIntentId]
        );

        await sendEmail(
          order.email,
          "Order Cancelled & Refunded",
          `<h2>Hi ${order.name},</h2>
           <p>Your order #${order.id} has been cancelled successfully.</p>
           <p>The refund of ₹${order.payable_amount} has been processed to your original payment method.</p>`
        );

        console.log(`Refund processed successfully for order ${order.id}`);
      } catch (err) {
        console.error("Error handling refund webhook:", err);
      }
      break;
    }

    case "customer.subscription.updated": {
  const subscription = event.data.object;
  const subscriptionId = subscription.id;
  const cancelAtPeriodEnd = subscription.cancel_at_period_end;
  const status = cancelAtPeriodEnd ? "active" : subscription.status;

  await db.execute(
    `UPDATE user_subscriptions 
     SET status = ?, cancel_at_period_end = ? 
     WHERE stripe_subscription_id = ?`,
    [status, cancelAtPeriodEnd, subscriptionId]
  );
  console.log(`Subscription ${subscriptionId} updated. Cancel at period end: ${cancelAtPeriodEnd}`);
  break;
}

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};
