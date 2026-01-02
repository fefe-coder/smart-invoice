import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Importuj cesty (routes)
import clientRoutes from "./routes/client.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import profileRoutes from "./routes/profile.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// 1. NASTAVENIE CORS
// Povolíme všetko, aby tvoja Electron apka mohla komunikovať s backendom bez obmedzení
app.use(cors());

// 2. PARSOVANIE DÁT
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. LOGOVANIE (Uvidíš v termináli, čo apka robí)
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// 4. CESTY (ROUTES)
// Odstránili sme authRoutes, pretože prihlasovanie už nepoužívame
app.use("/api/clients", clientRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/profile", profileRoutes);

// Základná cesta pre test
app.get("/", (req, res) => {
  res.send("Smart Invoice OFFLINE API beží...");
});

// 5. OŠETRENIE CHÝB
app.use((err, req, res, next) => {
  console.error("🔴 Chyba servera:", err.message);
  res.status(500).json({ 
    success: false,
    error: "Chyba v lokálnom serveri." 
  });
});

// 6. ŠTART SERVERA
app.listen(PORT, () => {
  console.log(`🚀 Offline backend beží na: http://localhost:${PORT}`);
  console.log(`📂 Dáta sa ukladajú lokálne do SQLite súboru.`);
});

export default app;