import { db } from "../lib/db.js";

//adduser
export const adduser = async (req, res) => {
  try {
    const { name, email, role = 0 } = req.body;
    const [result] = await db.execute(
      "INSERT INTO users(name,email, role) VALUES(?,?,?)",
      [name, email, role]
    );
    return res
      .status(201)
      .json({ message: "user added successfully", userId: result.insertId });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "database error" });
  }
};

//update user
//hloooooooooooooooooooooo
//nnnnnn

export const updateuser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phone, gender } = req.body;
    const profile = req.file ? req.file.path : null;

    const [rows] = await db.execute("select * from users where id=?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "user not found" });
    }
    const user = rows[0];

    const updatename = name || user.name;
    const updateemail = email || user.email;
    const updatephone = phone || user.phone;
    const updategender = gender || user.gender;
    const updateprofile = profile || user.profile;

    const [result] = await db.execute(
      "update users set name=?,email=?,phone=?,gender=?,profile=? where id=?",
      [
        updatename,
        updateemail,
        updatephone,
        updategender,
        updateprofile,
        userId,
      ]
    );

    return res.status(200).json({ message: "user updated successfuly" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "server error" });
  }
};

//userdetails
export const userdetails = async (req, res) => {
  try {
    const userId = req.params.id;
    const [rows] = await db.execute("select * from users where id=?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "user not found" });
    }
    const user = rows[0];
    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "server error" });
  }
};

//get all users
export const allusers = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.phone, 
        u.gender, 
        u.profile,
        IFNULL(us.status, 'Inactive') AS status
      FROM users u
      LEFT JOIN user_subscriptions us ON u.id = us.user_id
      WHERE u.role = 0
    `);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json({ users: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


//delete user by id
export const deleteuser = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute("DELETE FROM users WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};