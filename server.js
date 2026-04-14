import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

// Import Routers
import fileRoutes from "./routes/files.js";
import proxyRoutes from "./routes/proxy.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Parsing application/json
app.use(express.urlencoded({ extended: true })); // Parsing URL-encoded

// ==========================================
// ROUTES REGISTRATION
// ==========================================

// 1. Endpoint khusus File (Prioritas karena pakai Multer/FormData)
app.use("/api/vt/files", fileRoutes);

// 2. Fallback Proxy untuk SEMUA endpoint VT lainnya
// Meng-cover IPs, Domains, URLs, Intelligence, Graphs, MITRE, Analyses, dll.
app.use("/api/vt", proxyRoutes);

// ==========================================
// SERVER START
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Complex VT API Gateway running at http://localhost:${PORT}`);
  console.log(`✅ Handled Endpoints: IPs, Domains, URLs, Files, Intel, Graphs, Mitre Attack`);
});