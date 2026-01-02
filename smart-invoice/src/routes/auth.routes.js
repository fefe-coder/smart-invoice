import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ message: "Používateľ neexistuje" });

    // Kontrola hesla (textové aj hashované kvôli tvojim ručným zmenám v DB)
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (e) { isMatch = false; }

    if (!isMatch && password === user.password) isMatch = true;

    if (!isMatch) return res.status(400).json({ message: "Nesprávne heslo" });

    const secret = process.env.JWT_SECRET || 'super-tajny-kluc';
    // Dôležité: Do tokenu ukladáme ID používateľa
    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: "24h" });

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;