import express from 'express';
import db from '../config/db.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- POMOCNÉ FUNKCIE ---
const formatDate = (d) => d ? new Date(d).toLocaleDateString('sk-SK') : '-';
const formatCurrency = (num) => parseFloat(num || 0).toFixed(2) + " €";

// --- 1. ZÍSKANIE FAKTÚR ---
router.get('/', async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM invoices ORDER BY created_at DESC");
    const formattedRows = result.rows.map(row => ({
      ...row,
      total_amount: row.amount 
    }));
    res.json(formattedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 2. SWITCH (Uhradené) ---
router.patch('/:id/toggle-paid', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT is_paid FROM invoices WHERE id = ?", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Nenašlo sa" });
    const newStatus = result.rows[0].is_paid === 1 ? 0 : 1;
    await db.query("UPDATE invoices SET is_paid = ? WHERE id = ?", [newStatus, id]);
    res.json({ is_paid: newStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 3. PROFESIONÁLNE PDF (S OPRAVOU FONTU) ---
router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    const invResult = await db.query("SELECT * FROM invoices WHERE id = ?", [id]);
    const profResult = await db.query("SELECT * FROM profile WHERE id = 1");

    if (invResult.rows.length === 0) return res.status(404).send("Faktúra neexistuje");

    const inv = invResult.rows[0];
    const prof = profResult.rows[0] || {};

    const doc = new jsPDF();

    // NAČÍTANIE FONTU (Podľa tvojho assets priečinka)
    try {
        const fontPath = path.join(__dirname, '..', 'assets', 'Roboto-VariableFont_wdth,wght.ttf');
        
        if (fs.existsSync(fontPath)) {
            const fontBase64 = fs.readFileSync(fontPath, { encoding: 'base64' });
            // Registrujeme font pre NORMAL aj BOLD, aby sme predišli chybe v konzole
            doc.addFileToVFS('Roboto-Regular.ttf', fontBase64);
            doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
            doc.addFont('Roboto-Regular.ttf', 'Roboto', 'bold');
            doc.setFont('Roboto', 'normal');
        } else {
            console.error("Font sa nenašiel na ceste:", fontPath);
            doc.setFont("helvetica");
        }
    } catch (fontErr) {
        console.error("Chyba pri načítaní fontu:", fontErr);
        doc.setFont("helvetica");
    }

    const colorPrimary = [26, 35, 126]; // Tmavomodrá
    const colorAccent = [245, 245, 245]; // Šedá

    // HLAVIČKA
    doc.setFillColor(...colorPrimary);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('Roboto', 'bold');
    doc.text("FAKTÚRA", 15, 20);
    doc.setFontSize(12);
    doc.text(`Číslo: ${inv.invoice_number || "-"}`, 195, 20, { align: 'right' });

    // DODÁVATEĽ A ODBERATEĽ
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('Roboto', 'normal');
    doc.text("DODÁVATEĽ", 15, 45);
    doc.text("ODBERATEĽ", 110, 45);

    doc.setFontSize(11);
    doc.setFont('Roboto', 'bold');
    doc.text(prof.name || "Meno firmy", 15, 52);
    doc.text(inv.client_name || "Meno klienta", 110, 52);

    doc.setFontSize(10);
    doc.setFont('Roboto', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(prof.address || "Adresa firmy", 15, 58);
    doc.text(`IČO: ${prof.ico || "-"}`, 15, 64);
    doc.text(`DIČ: ${prof.dic || "-"}`, 15, 70);

    doc.text(inv.client_address || "Adresa klienta", 110, 58);
    doc.text(`IČO: ${inv.client_ico || "-"}`, 110, 64);

    // PLATOBNÉ INFO (Šedý panel)
    doc.setFillColor(...colorAccent);
    doc.rect(15, 85, 180, 25, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text("Dátum vystavenia:", 20, 93);
    doc.text("Dátum splatnosti:", 20, 103);
    doc.text("IBAN:", 100, 93);
    doc.text("Variabilný symbol:", 100, 103);

    doc.setFontSize(10);
    doc.setFont('Roboto', 'bold');
    doc.text(formatDate(inv.created_at), 55, 93);
    const dueDate = new Date(inv.created_at || Date.now());
    dueDate.setDate(dueDate.getDate() + 14);
    doc.text(formatDate(dueDate), 55, 103);
    
    doc.text(prof.bank_account || "IBAN nevyplnený", 135, 93);
    doc.text(String(inv.invoice_number || "-"), 135, 103);

    // TABUĽKA
    // Ošetrenie undefined v item_name
    const safeItemName = inv.item_name && inv.item_name !== 'undefined' ? inv.item_name : "Služby / Tovar";

    autoTable(doc, {
        startY: 120,
        head: [['Popis položky', 'Množstvo', 'Cena', 'Spolu']],
        body: [[safeItemName, "1", formatCurrency(inv.amount), formatCurrency(inv.amount)]],
        theme: 'striped',
        headStyles: { 
            fillColor: colorPrimary, 
            font: 'Roboto', 
            fontStyle: 'bold' 
        },
        styles: { 
            font: 'Roboto', 
            fontSize: 10 
        },
        columnStyles: { 3: { halign: 'right' } }
    });

    // SUMA
    const finalY = (doc.lastAutoTable?.finalY || 140) + 15;
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(14);
    doc.text("Spolu k úhrade:", 130, finalY);
    doc.setFontSize(18);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(...colorPrimary);
    doc.text(formatCurrency(inv.amount), 195, finalY, { align: 'right' });

    // PÄTIČKA
    doc.setFontSize(8);
    doc.setFont('Roboto', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text("Ďakujeme za prejavenú dôveru. Faktúra slúži zároveň ako dodací list.", 105, 285, { align: 'center' });

    const pdfOutput = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Faktura_${inv.invoice_number}.pdf`);
    res.send(Buffer.from(pdfOutput));

  } catch (err) {
    console.error("PDF Error:", err);
    res.status(500).send("Chyba pri generovaní PDF.");
  }
});

export default router;