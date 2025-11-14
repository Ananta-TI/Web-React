import React, { useState } from "react";

const Scanner = () => {
  const [url, setUrl] = useState("");
  const [scanId, setScanId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const backend = "/api/vt"; // otomatis ke Vercel serverless

  // Kirim URL untuk scan
  const handleScan = async () => {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(`${backend}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Scan failed.");
        setLoading(false);
        return;
      }

      setScanId(data.scan_id);
      fetchResult(data.scan_id);

    } catch (err) {
      setError("Network error.");
    }
  };

  // Fetch hasil analisis
  const fetchResult = async (id) => {
    try {
      const res = await fetch(`${backend}/result/${id}`);
      const data = await res.json();

      if (data.status === "queued" || data.status === "in-progress") {
        setTimeout(() => fetchResult(id), 1500);
        return;
      }

      setResult(data);
    } catch (err) {
      setError("Failed to fetch result.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-4">VirusTotal URL Scanner</h1>

      <div className="flex gap-2">
        <input
          className="flex-1 px-4 py-2 border rounded bg-neutral-900 text-white"
          placeholder="Masukkan URL di sini..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={handleScan}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Scan
        </button>
      </div>

      {loading && (
        <p className="mt-4 animate-pulse text-gray-300">Scanning...</p>
      )}

      {error && (
        <p className="mt-4 text-red-500">{error}</p>
      )}

      {scanId && !result && (
        <p className="mt-4 text-yellow-400">
          Scan ID: {scanId} — menunggu hasil...
        </p>
      )}

      {result && (
        <div className="mt-6 p-4 border rounded bg-neutral-800 text-white">
          <h2 className="text-xl font-semibold mb-3">Hasil Scan</h2>

          <p><strong>URL:</strong> {result.url}</p>
          <p><strong>Status:</strong> {result.status}</p>

          <div className="mt-4">
            <h3 className="font-bold">Vendor Results:</h3>
            <ul className="mt-2 space-y-1">
              {Object.keys(result.vendors || {}).map((vendor) => (
                <li key={vendor}>
                  {vendor}: {result.vendors[vendor]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;
