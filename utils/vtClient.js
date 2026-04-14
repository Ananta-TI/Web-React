import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// Instance Axios khusus untuk VirusTotal
const vtClient = axios.create({
  baseURL: "https://www.virustotal.com/api/v3",
  timeout: 15000,
  headers: {
    "x-apikey": process.env.VT_API_KEY,
    "Accept": "application/json"
  },
});

export default vtClient;