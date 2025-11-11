import { db } from "../lib/db.js";
import Stripe from "stripe";
import { stripecustomer } from "../utils/stripecustomer.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// CREATE ORDER
export const createorder = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, phone, shippingAddress, email, payment_method } = req.body;

    if (!name || !phone || !shippingAddress || !email || !payment_method) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1Get cart items
    const [cartItems] = await db.execute(
      `SELECT c.product_id, c.quantity, p.price, p.stock, p.name
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );

    if (!cartItems.length)
      return res.status(400).json({ message: "Cart is empty." });

    const validItems = cartItems.filter((item) => item.stock >= item.quantity);
    if (!validItems.length)
      return res.status(400).json({ message: "No items in stock." });

    // 2 Get active subscription
    const [subs] = await db.execute(
      `SELECT s.plan_name 
       FROM user_subscriptions us
       JOIN subscription s ON us.price_id = s.stripe_price_id
       WHERE us.user_id = ? AND us.status = 'active'`,
      [userId]
    );

    const plan = subs[0]?.plan_name || null;

    // 3 Calculate totals
    const totalAmount = validItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );
    const deliveryFee = plan === "Pro" ? 0 : 50; // free delivery for Pro

    let discount = 0;
    if (!payment_method || payment_method === "COD") {
      if (plan === "Premium" || plan === "Pro") {
        discount = totalAmount * 0.1; // 10% discount
      }
    }

    const payableAmount = totalAmount + deliveryFee - discount;

    // 4 Insert order (pre-discount)
    const [orderResult] = await db.execute(
      `INSERT INTO orders
   (user_id, total_amount, delivery_fee, payable_amount, discount, payment_method, status, delivery_status, cancel_request_status, created_at, name, phone, shipping_address, email)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
      [
        userId,
        totalAmount,
        deliveryFee,
        payableAmount,
        discount,
        payment_method,
        payment_method === "COD" ? "pending" : "unpaid",
        "Order Placed",
        "none",
        name,
        phone,
        shippingAddress,
        email,
      ]
    );

    const orderId = orderResult.insertId;

    // 5 Insert order items and reduce stock
    for (const item of validItems) {
      await db.execute(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price]
      );
      await db.execute("UPDATE products SET stock = stock - ? WHERE id = ?", [
        item.quantity,
        item.product_id,
      ]);
    }

    // 6 CARD payment
    if (payment_method === "CARD") {
      const stripeCustomerId = await stripecustomer(userId, email);

      const lineItems = validItems.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: { name: item.name },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      }));

      if (deliveryFee > 0) {
        lineItems.push({
          price_data: {
            currency: "inr",
            product_data: { name: "Delivery Fee" },
            unit_amount: deliveryFee * 100,
          },
          quantity: 1,
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer: stripeCustomerId,
        line_items: lineItems,
        discounts:
          plan === "Premium" || plan === "Pro"
            ? [{ coupon: "premium_10" }]
            : [],
        mode: "payment",
        success_url: `https://ecommerce-react-three-psi.vercel.app/ordersuccess`,
        cancel_url: `https://ecommerce-react-three-psi.vercel.app/${userId}?status=failed`,
        metadata: { orderId: orderId.toString() },
      });

      return res
        .status(201)
        .json({
          message: "Checkout session created",
          sessionUrl: session.url,
          orderId,
        });
    }

    // 7 COD
    await db.execute("DELETE FROM cart WHERE user_id = ?", [userId]);
    res.status(201).json({
      message: "Order created successfully (COD)",
      orderId,
      totalAmount,
      deliveryFee,
      payableAmount,
      payment_method,
    });
  } catch (error) {
    console.error("Order creation failed:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//getorderdetails
export const getuserorders = async (req, res) => {
  try {
    const userId = req.params.id;

    //Step 1: Get all orders of that user
    const [orders] = await db.execute(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this user." });
    }

    // Step 2: For each order, get its items + product details
    const orderDetails = [];

    for (const order of orders) {
      const [items] = await db.execute(
        `SELECT oi.product_id, oi.quantity, oi.price, p.name, p.main_image
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );

      orderDetails.push({
        orderId: order.id,
        totalAmount: order.total_amount,
        paymentMethod: order.payment_method,
        status: order.status,
        deliveryStatus: order.delivery_status,
        CancelStatus: order.cancel_request_status,
        createdAt: order.created_at,
        name: order.name,
        phone: order.phone,
        shippingAddress: order.shipping_address,
        email: order.email,
        items,
      });
    }

    //Step 3: Send response
    res.status(200).json({ orders: orderDetails });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//getordersummary
export const getordersummary = async (req, res) => {
  try {
    const { userId } = req.params;

    const [cartItems] = await db.execute(
      `SELECT c.quantity, p.price, p.stock, p.name
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );

    if (!cartItems.length)
      return res.status(400).json({ message: "Cart is empty" });

    const validItems = cartItems.filter((item) => item.stock >= item.quantity);

    const [subs] = await db.execute(
      `SELECT s.plan_name 
       FROM user_subscriptions us
       JOIN subscription s ON us.price_id = s.stripe_price_id
       WHERE us.user_id = ? AND us.status = 'active'`,
      [userId]
    );

    const plan = subs[0]?.plan_name || null;
    const totalAmount = validItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    // Set delivery fee
    let deliveryFee = 0;
    if (!plan) {
      deliveryFee = 50; // no plan
    } else if (plan === "Pro") {
      deliveryFee = 0;
    } else {
      deliveryFee = 50; // Premium or other plans
    }

    // Calculate discount (10% on total + delivery fee for Premium or Pro)
    const discount =
      plan === "Premium" || plan === "Pro"
        ? (totalAmount + deliveryFee) * 0.1
        : 0;

    // Final payable amount
    const payableAmount = totalAmount + deliveryFee - discount;

    console.log({ totalAmount, deliveryFee, discount, payableAmount });

    res
      .status(200)
      .json({ plan, totalAmount, deliveryFee, discount, payableAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


//allorders
export const getallorders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await db.execute(`SELECT COUNT(*) AS total FROM orders`);
    const totalOrders = countResult[0].total;

    // Fetch paginated orders
    const [orders] = await db.execute(
      `SELECT 
         o.id AS order_id,
         o.user_id,
         o.total_amount,
         o.discount,
         o.delivery_fee,
         o.payable_amount,
         o.payment_method,
         o.status,
         o.delivery_status,
         o.cancel_request_status,
         o.created_at,
         o.name AS customer_name,
         o.phone AS customer_phone,
         o.shipping_address,
         o.email AS customer_email,
         u.name AS user_name,
         u.email AS user_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    // Add items for each order
    const allOrders = [];
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

      allOrders.push({
        orderId: order.order_id,
        userId: order.user_id,
        userName: order.user_name,
        userEmail: order.user_email,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        shippingAddress: order.shipping_address,
        totalAmount: order.total_amount,
        discount: order.discount,
        deliveryFee: order.delivery_fee,
        payableAmount: order.payable_amount,
        paymentMethod: order.payment_method,
        status: order.status,
        deliveryStatus: order.delivery_status,
        CancelStatus: order.cancel_request_status,
        createdAt: order.created_at,
        items,
      });
    }

    res.status(200).json({
      orders: allOrders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Admin Get All Orders Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};



//getorderdetailbyid
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params; // order id from route

    // Step 1: Fetch the main order info
    const [orderData] = await db.execute(
      `SELECT 
         o.id AS order_id,
         o.user_id,
         o.total_amount,
         o.discount,
         o.delivery_fee,
         o.payable_amount,
         o.payment_method,
         o.status,
         o.created_at,
         o.name AS customer_name,
         o.phone AS customer_phone,
         o.shipping_address,
         o.email AS customer_email
       FROM orders o
       WHERE o.id = ?`,
      [id]
    );

    // If no order found
    if (orderData.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderData[0];

    // Step 2: Fetch all products for that order
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

    // Step 3: Structure the final response
    const orderDetails = {
      orderId: order.order_id,
      userId: order.user_id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      shippingAddress: order.shipping_address,
      totalAmount: order.total_amount,
      discount: order.discount,
      deliveryFee: order.delivery_fee,
      payableAmount: order.payable_amount,
      paymentMethod: order.payment_method,
      status: order.status,
      createdAt: order.created_at,
      items, // all ordered products
    };

    res.status(200).json({ order: orderDetails });
  } catch (err) {
    console.error("Get Order By ID Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};



// update order status when paymentmethod is COD(admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["pending", "paid","cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    await db.execute("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);

    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


//request to admin
export const requestCancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if order exists
    const [orders] = await db.execute("SELECT * FROM orders WHERE id = ?", [orderId]);
    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found." });
    }

    const order = orders[0];

    // Prevent duplicate requests
    if (order.cancel_request_status === "Pending") {
      return res.status(400).json({ message: "Cancellation request already sent." });
   }

    // Update cancel request to Pending
    await db.execute(
      "UPDATE orders SET cancel_request_status = 'Pending' WHERE id = ?",
      [orderId]
    );

    return res.status(200).json({ message: "Cancellation request sent to admin." });
  } catch (err) {
    console.error("Cancel request error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};