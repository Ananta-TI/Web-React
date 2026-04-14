import express from "express";
import vtClient from "../utils/vtClient.js";

const router = express.Router();
app.post("/api/vt/scan", async (req, res) => {
  try {
    const { url } = req.body;

    const response = await vtClient.post(
      "/urls",
      new URLSearchParams({ url }),
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
});
// Dynamic Universal Proxy
// Menangkap semua method (GET, POST, PATCH, DELETE) ke semua sub-path
router.use(async (req, res) => {
  try {
    const targetPath = req.originalUrl.replace('/api/vt', '');

    const response = await vtClient({
      method: req.method,
      url: targetPath,
      data: req.method !== "GET" ? req.body : undefined,
      headers: {
        ...(req.headers["content-type"] && {
          "content-type": req.headers["content-type"],
        }),
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error(`[VT Proxy Error] ${req.method} ${req.originalUrl}`);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
});

export default router;