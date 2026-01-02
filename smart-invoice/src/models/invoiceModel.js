import pool from "../config/db.js";

export const createInvoiceWithItems = async (userId, clientId, items, dueDate) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Spustíme transakciu

    // 1. Vypočítame celkovú sumu
    const totalAmount = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

    // 2. Vložíme faktúru
    const invoiceRes = await client.query(
      "INSERT INTO invoices (user_id, client_id, total_amount, due_date) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, clientId, totalAmount, dueDate]
    );
    const invoice = invoiceRes.rows[0];

    // 3. Vložíme všetky položky
    for (const item of items) {
      await client.query(
        "INSERT INTO document_items (parent_id, parent_type, description, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4, $5, $6)",
        [invoice.id, 'invoice', item.description, item.quantity, item.unit_price, item.unit_price * item.quantity]
      );
    }

    await client.query('COMMIT');
    return invoice;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};