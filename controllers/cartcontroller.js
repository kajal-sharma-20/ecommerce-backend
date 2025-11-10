import { db } from "../lib/db.js";

//addtocart
export const addtocart=async (req, res) => {
  const { userId, productId } = req.params;
 const quantity = req.body.quantity || 1;

  try {
    const [rows] = await db.execute(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    if (rows.length > 0) {
      return res.status(200).json({ message: "Product already in cart" });
    }

    await db.execute(
      "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
      [userId, productId, quantity]
    );

    res.status(201).json({ message: "Added to cart successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

//productcontroller
export const getcartitems = async (req, res) => {
  const { userId } = req.params;

  try {
    // Join cart table with products to get product details
    const [rows] = await db.execute(
      `SELECT c.product_id, c.quantity, p.name, p.price, p.main_image,p.stock
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    res.status(200).json({ cart: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


//quantity incerase decrease
export const updateCartQuantity = async (req, res) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;

  if (quantity < 1) return res.status(400).json({ message: "Quantity must be at least 1" });

  try {
    await db.execute(
      "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?",
      [quantity, userId, productId]
    );
    res.status(200).json({ message: "Quantity updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



// Remove an item from user's cart
export const removeFromCart = async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const [result] = await db.execute(
      "DELETE FROM cart WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    res.status(200).json({ message: "Item removed from cart successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

