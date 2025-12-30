import { IncomingForm } from "formidable";
import fs from "fs";

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
  if (!VT_KEY) {
    return res.status(500).json({ error: "VT_API_KEY missing" });
  }

  try {
    const data = await new Promise((resolve, reject) => {
      const form = new IncomingForm();
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const file = Array.isArray(data.files.file) ? data.files.file[0] : data.files.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const FormData = require("form-data");
    const formData = new FormData();
    formData.append("file", fs.createReadStream(file.filepath), file.originalFilename);

    const axios = require("axios");
    const response = await axios.post(
      "https://www.virustotal.com/api/v3/files",
      formData,
      {
        headers: {
          "x-apikey": VT_KEY,
          ...formData.getHeaders(),
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