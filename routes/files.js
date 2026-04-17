import express from "express";
import multer from "multer";
import FormData from "form-data";
import vtClient from "../utils/vtClient.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 32 * 1024 * 1024 }, // 32MB
});

// ==========================================
// UPLOAD FILE
// ==========================================
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);

    const response = await vtClient.post("/files", formData, {
      headers: formData.getHeaders(),
    });

    res.json(response.data);
  } catch (err) {
    console.error("[VT File Upload Error]", err.message);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
});

// ==========================================
// GET UPLOAD URL (file besar)
// ==========================================
router.get("/upload_url", async (req, res) => {
  try {
    const response = await vtClient.get("/files/upload_url");
    res.json(response.data);
  } catch (err) {
    console.error("[VT Upload URL Error]", err.message);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
});

export default router;