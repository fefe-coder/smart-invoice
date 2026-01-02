import express from 'express';
// Cesta je upravená podľa tvojho obrázka: ideme o úroveň vyššie a do configu
import pool from '../config/db.js';

const router = express.Router();

/**
 * 1. ZÍSKANIE VŠETKÝCH ODBERATEĽOV
 * URL: GET /api/clients
 */
router.get('/', async (req, res) => {
  try {
    console.log("🔍 Načítavam zoznam odberateľov z lokálnej DB...");
    
    // V SQLite query vracia objekt { rows: [...] }
    const result = await pool.query("SELECT * FROM clients ORDER BY name ASC");
    
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Chyba pri načítaní klientov:", err.message);
    res.status(500).json({ error: "Nepodarilo sa načítať lokálnu databázu." });
  }
});

/**
 * 2. PRIDANIE NOVÉHO ODBERATEĽA
 * URL: POST /api/clients
 */
router.post('/', async (req, res) => {
  const { name, address, ico, dic, ic_dph } = req.body;

  // Základná validácia
  if (!name) {
    return res.status(400).json({ error: "Meno odberateľa je povinné." });
  }

  try {
    // SQLite používa ? pre parametre
    const sql = `
      INSERT INTO clients (name, address, ico, dic, ic_dph) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await pool.query(sql, [name, address, ico, dic, ic_dph]);
    
    console.log(`✅ Odberateľ "${name}" bol úspešne uložený.`);
    
    // Keďže SQLite nepodporuje RETURNING *, pošleme úspešnú správu
    res.status(201).json({ 
      success: true, 
      message: "Odberateľ bol uložený do vášho počítača.",
      client: { name, address, ico, dic, ic_dph }
    });
  } catch (err) {
    console.error("❌ Chyba pri ukladaní odberateľa:", err.message);
    res.status(500).json({ error: "Chyba pri zápise do databázy." });
  }
});

/**
 * 3. VYMAZANIE ODBERATEĽA
 * URL: DELETE /api/clients/:id
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM clients WHERE id = ?", [id]);
    res.json({ success: true, message: "Odberateľ bol vymazaný." });
  } catch (err) {
    res.status(500).json({ error: "Nepodarilo sa vymazať odberateľa." });
  }
});

export default router;