import { db } from "../lib/db.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const addproduct = async (req, res) => {
  try {
    const { name, price, stock, description, category } = req.body;

    const mainImageFile = req.files.main_image ? req.files.main_image[0].path : null;
    const otherImages = req.files.image ? req.files.image.map((f) => f.path) : [];

    if (!name || !price || !stock) {
      return res
        .status(400)
        .json({ message: "Name, price, and stock are required" });
    }

    const [result] = await db.execute(
      `INSERT INTO products (name, price, stock, description, category, main_image, image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, price, stock, description, category, mainImageFile, JSON.stringify(otherImages)]
    );

    const productId = result.insertId;

    // 2 Create Stripe Product
    const stripeProduct = await stripe.products.create({
      name: name,
      description: description,
    });

    // 3 Create Stripe Price (one-time for now)
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: price * 100, // convert to smallest currency unit
      currency: "inr",
    });

   await db.execute(
      "UPDATE products SET stripe_product_id = ?, stripe_price_id = ? WHERE id = ?",
      [stripeProduct.id, stripePrice.id, productId]
    );

    return res.status(201).json({
      message: "Product added successfully",
      productId,
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
    });
  } catch (err) {
  console.error("Add Product Error:", err); // logs full error in console
  return res.status(500).json({ message: "Database error", error: err.message });
}
};


//getproducts

export const getproducts = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM products");

    if (rows.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    const products = rows.map((product) => {
      // Parse other images
      if (product.image) {
        try {
          product.image = JSON.parse(product.image);
        } catch {
          product.image = [product.image];
        }
      } else {
        product.image = [];
      }

      // Ensure main_image is included
      if (!product.main_image) {
        product.main_image = product.image[0] || null;
      }

      return product;
    });

    return res.status(200).json({ products });
  } catch (err) {
    console.error("Get Products Error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};


//getallproductbyid

export const getproduct = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = rows[0];

    //  Parse image array safely (same logic as getproducts)
    if (product.image) {
  try {
    // parse once, flatten if nested
    let parsed = JSON.parse(product.image);
    if (!Array.isArray(parsed)) parsed = [parsed];
    product.image = parsed.flat();
  } catch {
    product.image = [product.image];
  }
} else {
  product.image = [];
}

    
    if (!product.main_image) {
      product.main_image = product.image[0] || null;
    }

    return res.status(200).json({ product });
  } catch (err) {
    console.error("Get Product Error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};


//deleteproductbyid

export const deleteproduct = async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await db.execute("DELETE FROM products WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete Product Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//updateproductbyid

export const updateproduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, price, stock, description, category } = req.body;

    // Handle files
    const mainImageFile = req.files?.main_image?.[0];
    const otherImagesFiles = req.files?.image || [];

    const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = rows[0];

    // Update fields with fallback
    const updatename = name || product.name;
    const updateprice = price || product.price;
    const updatestock = stock || product.stock;
    const updatedescription = description || product.description;
    const updatecategory = category || product.category;

    // Update images
    const updateMainImage = mainImageFile ? mainImageFile.path : product.main_image;
    const updateOtherImages =
      otherImagesFiles.length > 0
        ? JSON.stringify(otherImagesFiles.map((f) => f.path))
        : product.image;

    // Execute update
    await db.execute(
      `UPDATE products 
       SET name = ?, price = ?, stock = ?, description = ?, category = ?, main_image = ?, image = ?
       WHERE id = ?`,
      [
        updatename,
        updateprice,
        updatestock,
        updatedescription,
        updatecategory,
        updateMainImage,
        updateOtherImages,
        id,
      ]
    );

    return res.status(200).json({ message: "Product updated successfully" });
  } catch (err) {
    console.error("Update Product Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
