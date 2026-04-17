// File: /api/vt/scan-file.js
// FIXED VERSION - Proper file handling dan CORS

import axios from 'axios';
import FormData from 'form-data';
import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
    maxDuration: 300 // 5 minutes for file upload
  }
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const VT_KEY = process.env.VT_API_KEY;
  if (!VT_KEY) {
    console.error('VT_API_KEY missing');
    return res.status(500).json({ 
      error: 'Server configuration error',
      details: 'VT_API_KEY not set'
    });
  }

  try {
    // Parse incoming form data
    const { files, fields } = await new Promise((resolve, reject) => {
      const form = new IncomingForm({
        maxFileSize: 650 * 1024 * 1024, // 650MB max
        maxFiles: 1
      });

      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ files, fields });
      });
    });

    // Get file
    const fileArray = Array.isArray(files.file) ? files.file : [files.file];
    const uploadedFile = fileArray?.[0];

    if (!uploadedFile) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        details: 'Please provide a file to scan'
      });
    }

    // Validate file exists
    if (!fs.existsSync(uploadedFile.filepath)) {
      console.error('File not found at:', uploadedFile.filepath);
      return res.status(400).json({ 
        error: 'File processing error' 
      });
    }

    // Get file size
    const fileStats = fs.statSync(uploadedFile.filepath);
    const fileSizeInMB = fileStats.size / (1024 * 1024);

    console.log(`[File Scan] Uploading: ${uploadedFile.originalFilename} (${fileSizeInMB.toFixed(2)}MB)`);

    // Create form data for VT
    const formData = new FormData();
    const fileStream = fs.createReadStream(uploadedFile.filepath);
    formData.append('file', fileStream, uploadedFile.originalFilename);

    // Submit to VirusTotal
    const response = await axios.post(
      'https://www.virustotal.com/api/v3/files',
      formData,
      {
        headers: {
          'x-apikey': VT_KEY,
          ...formData.getHeaders()
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 300000 // 5 minutes
      }
    );

    // Validate response
    if (!response.data?.data?.id) {
      console.error('Unexpected VT response:', response.data);
      return res.status(500).json({ 
        error: 'Unexpected response format from VirusTotal' 
      });
    }

    const analysisId = response.data.data.id;
    console.log(`[File Scan] Analysis ID: ${analysisId}`);

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        id: analysisId,
        type: 'file',
        filename: uploadedFile.originalFilename,
        size: fileStats.size,
        attributes: {
          status: response.data.data.attributes?.status || 'queued'
        }
      }
    });

  } catch (err) {
    console.error('[File Scan Error]:', err.message);

    // Handle axios errors
    if (err.response?.status === 401 || err.response?.status === 403) {
      return res.status(401).json({ 
        error: 'Invalid API key' 
      });
    }

    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({ 
        error: 'Upload timeout - file too large or slow connection' 
      });
    }

    return res.status(500).json({ 
      error: 'File upload failed',
      message: err.message 
    });
  }
}