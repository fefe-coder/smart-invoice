import express from "express";
import cors from "cors";

// 1. Importy routovacích súborov
import authRoutes from "./routes/auth.routes.js";
import clientRoutes from "./routes/client.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";

const app = express();

// 2. Globálne middleware
app.use(cors());
app.use(express.json()); // Dôležité pre čítanie body v POST requestoch

// 3. Definícia API trás (Routes)
app.use("/api/auth", authRoutes);      // Registrácia a Login
app.use("/api/clients", clientRoutes);   // Správa klientov
app.use("/api/invoices", invoiceRoutes); // Správa faktúr a položiek

// 4. Health check - overenie funkčnosti servera
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    message: "Smart Invoice API je plne funkčné." 
  });
});

// 5. Základný Error Handler
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.stack);
  res.status(500).json({ 
    error: "Vyskytla sa neočakávaná chyba na serveri.",
    details: err.message 
  });
});

export default app;