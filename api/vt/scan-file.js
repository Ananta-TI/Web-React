import axios from "axios";
import FormData from "form-data";
import { IncomingForm } from "formidable";
import fs from "fs";

// Kita harus mematikan body parser bawaan Next.js/Vercel agar bisa baca file stream
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const VT_KEY = process.env.VT_API_KEY;

  try {
    // 1. Parse file yang diupload menggunakan formidable
    const data = await new Promise((resolve, reject) => {
      const form = new IncomingForm();
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    // Ambil file (formidable mungkin mengembalikan array)
    const file = Array.isArray(data.files.file) ? data.files.file[0] : data.files.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 2. Buat FormData untuk dikirim ke VirusTotal
    const formData = new FormData();
    // Baca file dari path temporary formidable
    formData.append("file", fs.createReadStream(file.filepath), file.originalFilename);

    // 3. Kirim ke VirusTotal
    const response = await axios.post(
      "https://www.virustotal.com/api/v3/files",
      formData,
      {
        headers: {
          "x-apikey": VT_KEY,
          ...formData.getHeaders(), // Header multipart boundary
        },
        maxBodyLength: Infinity,
      }
    );

    return res.status(200).json(response.data);

  } catch (err) {
    console.error("Upload Error:", err);
    return res.status(500).json({ error: err.message || "Upload failed" });
  }
}