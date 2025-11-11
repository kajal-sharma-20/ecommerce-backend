import { db } from "../lib/db.js";
import { Resend } from 'resend';
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
 
const resend = new Resend(process.env.RESEND_API_KEY);

const sendCancelEmail = async (email, subject, message) => {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL, // verified sender in Resend
      to: email,                           // recipient email
      subject: subject,
      html: `<p>${message}</p>`,          // HTML version
      // optional: you can add plain text fallback
      text: message
    });
  } catch (err) {
    console.error("Resend email error:", err);
  }
};


//updatedeleivery status
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { delivery_status } = req.body;

    const validStatuses = [
      "Order Placed",
      "Processing",
      "Packed",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];
    if (!validStatuses.includes(delivery_status)) {
      return res.status(400).json({ message: "Invalid delivery status." });
    }

    // Fetch order info
    const [orders] = await db.execute("SELECT * FROM orders WHERE id = ?", [
      id,
    ]);
    if (!orders.length)
      return res.status(404).json({ message: "Order not found." });

    const order = orders[0];

    // If cancel requested
    if (delivery_status === "Cancelled") {
      if (order.payment_method === "COD") {
        // COD → only mark cancelled
        await db.execute(
          `UPDATE orders SET delivery_status=?, status='cancelled' WHERE id=?`,
          [delivery_status, id]
        );

        await sendCancelEmail(
          order.email,
          "Order Cancelled",
          `Hello ${order.name},\n\nYour COD order #${order.id} has been cancelled successfully.`
        );

        return res
          .status(200)
          .json({ message: "COD order cancelled successfully." });
      }

      if (order.payment_method === "CARD") {
        // Card → initiate refund via Stripe (webhook will handle DB + email)
        try {
          const refund = await stripe.refunds.create({
            payment_intent: order.payment_intent_id,
          });

          await db.execute(
            `UPDATE orders SET delivery_status=?, status='Refunded', refund_id=?, refund_status=? WHERE id=?`,
            [delivery_status, refund.id, refund.status, id]
          );

          return res.status(200).json({
            message:
              "Refund initiated successfully. Database will update after confirmation from Stripe webhook.",
          });
        } catch (error) {
          console.error("Refund initiation error:", error);
          await db.execute(
            `UPDATE orders 
   SET delivery_status = 'Cancelled',
       status='Refund Pending',
       refund_status = 'Failed'
   WHERE id = ?`,
            [id]
          );
          return res
            .status(500)
            .json({
              message: "Error initiating refund.",
              error: error.message,
            });
        }
      }
    }

    // For other status changes
    await db.execute("UPDATE orders SET delivery_status=? WHERE id=?", [
      delivery_status,
      id,
    ]);

    res.status(200).json({ message: "Delivery status updated successfully." });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get all cancel requests (Pending only)
export const getPendingCancelRequests = async (req, res) => {
  try {
    // Get all orders where cancel_request_status is 'Pending'
    const [orders] = await db.execute(
      `SELECT 
        o.id AS order_id,
        o.user_id,
        o.total_amount,
        o.payable_amount,
        o.payment_method,
        o.delivery_status,
        o.cancel_request_status,
        o.created_at,
        o.name AS customer_name,
        o.phone AS customer_phone,
        o.shipping_address,
        o.email AS customer_email,
        u.name AS user_name,
        u.email AS user_email,
        u.profile AS user_profile
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.cancel_request_status = 'Pending'
      ORDER BY o.created_at DESC`
    );

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No pending cancellation requests." });
    }

    // Fetch order items for each order
    const pendingRequests = [];
    for (const order of orders) {
      const [items] = await db.execute(
        `SELECT 
           oi.product_id,
           oi.quantity,
           oi.price,
           p.name AS product_name,
           p.main_image AS product_image
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.order_id]
      );

      pendingRequests.push({
        ...order,
        items,
      });
    }

    res.status(200).json({ requests: pendingRequests });
  } catch (err) {
    console.error("Error fetching pending cancel requests:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

//admin handle request
export const handleRequest = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { action } = req.body;

    const [orderRows] = await db.execute(
      `SELECT o.*, u.email, u.name 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       WHERE o.id = ?`,
      [orderId]
    );

    if (orderRows.length === 0)
      return res.status(404).json({ message: "Order not found." });

    const order = orderRows[0];

    if (order.payment_method === "COD") {
      if (action === "approve") {
        await db.execute(
          `UPDATE orders 
           SET cancel_request_status = 'Approved', delivery_status = 'Cancelled', 
           status='cancelled'
           WHERE id = ?`,
          [orderId]
        );

        await sendCancelEmail(
          order.email,
          "Order Cancellation Approved",
          `Hello ${order.name},\n\nYour order #${order.id} has been successfully cancelled.`
        );

        return res
          .status(200)
          .json({ message: "COD order cancelled and email sent." });
      }

      if (action === "reject") {
        await db.execute(
          `UPDATE orders 
           SET cancel_request_status = 'Rejected' 
           WHERE id = ?`,
          [orderId]
        );

        await sendCancelEmail(
          order.email,
          "Order Cancellation Rejected",
          `Hello ${order.name},\n\nYour cancellation request for order #${order.id} has been rejected.\nYour current delivery status is "${order.delivery_status}".`
        );

        return res
          .status(200)
          .json({ message: "COD order rejection processed." });
      }
    }

    // CARD Orders
    if (order.payment_method === "CARD") {
      if (action === "approve") {
        try {
          // Refund the payment via Stripe
          const refund = await stripe.refunds.create({
            payment_intent: order.payment_intent_id, // must be stored in your 'orders' table
          });

          // Update database after refund
          await db.execute(
            `UPDATE orders 
   SET cancel_request_status = 'Approved',
       delivery_status = 'Cancelled',
       status = 'Refunded',
       refund_id = ?, 
       refund_status = 'Success',
       refund_date = FROM_UNIXTIME(?)
   WHERE id = ?`,
            [refund.id, refund.created, orderId]
          );

          await sendCancelEmail(
            order.email,
            "Order Cancellation Approved & Refund Processed",
            `Hello ${order.name},\n\nYour order #${order.id} has been approved for cancellation.\nYour refund has been successfully processed.`
          );

          return res
            .status(200)
            .json({ message: "Card order cancelled and refund processed." });
        } catch (refundError) {
          console.error("Stripe refund error:", refundError);

          await db.execute(
            `UPDATE orders 
             SET cancel_request_status = 'Approved',
                 delivery_status = 'Cancelled',
                 status='Cancelled',
                 refund_status = 'Failed'
             WHERE id = ?`,
            [orderId]
          );

          return res
            .status(500)
            .json({ message: "Order cancelled but refund failed." });
        }
      }

      if (action === "reject") {
        await db.execute(
          `UPDATE orders 
           SET cancel_request_status = 'Rejected'
           WHERE id = ?`,
          [orderId]
        );

        await sendCancelEmail(
          order.email,
          "Order Cancellation Rejected",
          `Hello ${order.name},\n\nYour cancellation request for order #${order.id} has been rejected.\nYour current delivery status is "${order.delivery_status}".`
        );

        return res
          .status(200)
          .json({ message: "Card order rejection processed." });
      }
    }

    res.status(400).json({ message: "Invalid action or payment method." });
  } catch (err) {
    console.error("Error handling cancel request:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};


// get total cancel requests
export const getTotalCancelRequests = async (req, res) => {
  try {
    const [result] = await db.execute(
      `SELECT COUNT(*) AS totalRequests 
       FROM orders 
       WHERE cancel_request_status = 'Pending'`
    );

    const totalRequests = result[0].totalRequests;
    res.status(200).json({ totalRequests });
  } catch (err) {
    console.error("Error fetching total cancel requests:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Get total number of all orders (for dashboard)
export const getTotalOrders = async (req, res) => {
  try {
    const [result] = await db.execute(`SELECT COUNT(*) AS totalOrders FROM orders`);
    const totalOrders = result[0].totalOrders;

    res.status(200).json({
      totalOrders,
    });
  } catch (err) {
    console.error("Error getting total orders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

