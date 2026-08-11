import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/database.js";

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = bcrypt.hashSync(password, 10);
    const result = db
      .prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)")
      .run(name.trim(), email.toLowerCase().trim(), hashed);

    const user = {
      id: result.lastInsertRowid,
      name: name.trim(),
      email: email.toLowerCase().trim(),
    };

    const token = createToken(user);

    return res.status(201).json({
      message: "Registered successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error during registration" });
  }
}

export function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = db
      .prepare("SELECT id, name, email, password FROM users WHERE email = ?")
      .get(email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = bcrypt.compareSync(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const payload = { id: user.id, name: user.name, email: user.email };
    const token = createToken(payload);

    return res.json({
      message: "Login successful",
      token,
      user: payload,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
}

export function getProfile(req, res) {
  try {
    const user = db
      .prepare("SELECT id, name, email, created_at FROM users WHERE id = ?")
      .get(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Profile error:", error);
    return res.status(500).json({ message: "Server error fetching profile" });
  }
}
