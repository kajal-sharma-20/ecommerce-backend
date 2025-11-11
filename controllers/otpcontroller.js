import { db } from "../lib/db.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

//generate otp
function generateotp(length = 6) {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

//transport agent
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,      
  port: process.env.SMTP_PORT,       
  secure: false,  
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

//send email
export const sendOtpEmail = async (email, otp) => {
  return await transporter.sendMail({
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}`,
  });
};

//send otp
export const sendotp = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateotp();

    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      await db.execute(
        `INSERT INTO users (email, otp, otp_created_at, otp_expires_at)
         VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 MINUTE))`,
        [email, otp]
      );
    } else {
      await db.execute(
        `UPDATE users
         SET otp = ?, otp_created_at = NOW(), otp_expires_at = DATE_ADD(NOW(), INTERVAL 1 MINUTE)
         WHERE email = ?`,
        [otp, email]
      );
    }
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error sending OTP" });
  }
};


//verify otp
export const verifyotp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check OTP in users table
    const [rows] = await db.execute(
      `SELECT * FROM users 
       WHERE email = ? AND otp = ? AND otp_expires_at > NOW()`,
      [email, otp]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    // Clear OTP after successful verification
    await db.execute(
      `UPDATE users 
       SET otp = NULL, otp_created_at = NULL, otp_expires_at = NULL `
    );

    // Set JWT as cookie
    res.cookie("token", token, {
      httpOnly: true,     // cannot be accessed by JS
      secure: true,       // only sent over HTTPS
      sameSite: "none",   // allows frontend-backend on different domains
      maxAge:  2*24*60*60 * 1000 // 2days
    });

    return res.status(200).json({
      message: "OTP verified successfully!",
      userId: user.id,
      role: user.role,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


//resend otp
export const resendotp = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateotp(); 

    // Update OTP in users table
    const [result] = await db.execute(
      `UPDATE users
       SET otp = ?, otp_created_at = NOW(), otp_expires_at = DATE_ADD(NOW(), INTERVAL 1 MINUTE)
       WHERE email = ?`,
      [otp, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "New OTP sent successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error resending OTP" });
  }
};

//logout controller
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

//checktoken for frontend
export const checktoken = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ valid: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ valid: true, user: decoded });
  } catch (error) {
    return res.status(401).json({ valid: false, message: "Invalid or expired token" });
  }
};


