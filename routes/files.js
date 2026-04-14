import express from "express";
import multer from "multer";
import FormData from "form-data";
import vtClient from "../utils/vtClient.js";

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 32 * 1024 * 1024 } // Limit 32MB VT standard
});

// POST /api/vt/files -> Upload File ke VT
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);

    const response = await vtClient.post("/files", formData, {
      headers: { ...formData.getHeaders() },
    });

    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// GET /api/vt/files/upload_url -> Dapatkan URL untuk upload file besar (>32MB)
router.get("/upload_url", async (req, res) => {
  try {
    const response = await vtClient.get("/files/upload_url");
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

export default router;