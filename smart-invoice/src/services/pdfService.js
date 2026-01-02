import PDFDocument from "pdfkit";
import fs from "fs";

export const generateInvoicePDF = (invoice, items, client, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Jednoduchý obsah
    doc.fontSize(25).text("FAKTURA", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Odberatel: ${client.name}`);
    doc.text(`Suma: ${invoice.total_amount} EUR`);

    doc.end();

    stream.on('finish', () => resolve());
    stream.on('error', (err) => reject(err));
  });
};