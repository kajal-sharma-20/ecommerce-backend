import { db } from "../lib/db.js";

//addtowishlist
export const addToWishlist = async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const [rows] = await db.execute(
      "SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    if (rows.length > 0) {
      return res.status(200).json({ message: "Already in wishlist" });
    }

    await db.execute(
      "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)",
      [userId, productId]
    );

    res.status(201).json({ message: "Added to wishlist successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


//getwishlist
export const getWishlistItems = async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.execute(
      `SELECT w.product_id, p.name, p.price, p.main_image, p.stock
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ?`,
      [userId]
    );

    res.status(200).json({ wishlist: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


//removefromwishlist
export const removeFromWishlist = async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const [result] = await db.execute(
      "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found in wishlist" });
    }

    res.status(200).json({ message: "Item removed from wishlist" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


