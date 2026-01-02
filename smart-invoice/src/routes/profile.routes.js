import express from 'express';
import db from '../config/db.js'; // Uisti sa, že importuješ db.js

const router = express.Router();

router.put('/', async (req, res) => {
  const { name, address, ico, dic, bank_account, email } = req.body;
  
  try {
    // Používame db.query, ktorú sme definovali v db.js
    await db.query(
      `UPDATE profile SET 
        name = ?, address = ?, ico = ?, dic = ?, bank_account = ?, email = ? 
       WHERE id = 1`,
      [name, address, ico, dic, bank_account, email]
    );
    
    // Ak toto chýba, frontend vypíše chybu!
    res.json({ success: true, message: "Uložené" });
    
  } catch (err) {
    console.error("DETAL CHYBY V KONZOLE:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;