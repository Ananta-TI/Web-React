import { del, get, head } from "@vercel/blob";
import {
  allowMethods,
  rateLimit,
  requireSameOrigin,
  setCommonHeaders,
} from "../../server/scanner/http.js";
import {
  sendVtError,
  vtRequest,
} from "../../server/scanner/virustotal.js";

const MAX_FILE_SIZE = 32 * 1024 * 1024;

function requireBlobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN belum tersedia pada environment Production.",
    );
  }

  return token;
}

function validateBlobUrl(value) {
  const url = new URL(String(value || ""));

  const validHost = url.hostname.endsWith(
    ".private.blob.vercel-storage.com",
  );

  const validPath = url.pathname.includes("/scanner/");

  if (
    url.protocol !== "https:" ||
    !validHost ||
    !validPath
  ) {
    throw new Error("URL blob sementara tidak valid.");
  }

  return url.toString();
}

function cleanFileName(value) {
  const name = String(value || "uploaded-file")
    .replace(/[\\/\0\r\n]/g, "_")
    .trim();

  return name.slice(0, 180) || "uploaded-file";
}

export default async function handler(req, res) {
  setCommonHeaders(res);

  if (!allowMethods(req, res, ["POST"])) {
    return;
  }

  if (!requireSameOrigin(req, res)) {
    return;
  }

  const allowed = rateLimit(req, res, {
    key: "vt-file-scan",
    limit: 10,
    windowMs: 60_000,
  });

  if (!allowed) {
    return;
  }

  let blobUrl = null;
  let blobToken = null;

  try {
    blobToken = requireBlobToken();

    blobUrl = validateBlobUrl(
      req.body?.blobUrl,
    );

    const fileName = cleanFileName(
      req.body?.fileName,
    );

    /*
     * Token diberikan secara eksplisit agar operasi
     * head, get, dan delete memakai Blob Store yang sama.
     */
    const details = await head(blobUrl, {
      token: blobToken,
    });

    if (!details?.size) {
      throw new Error(
        "File kosong atau informasi file tidak ditemukan.",
      );
    }

    if (details.size > MAX_FILE_SIZE) {
      throw new Error(
        "File melebihi batas maksimum 32 MB.",
      );
    }

    const blobResult = await get(blobUrl, {
      access: "private",
      token: blobToken,
      useCache: false,
    });

    if (!blobResult) {
      throw new Error(
        "File sementara tidak ditemukan.",
      );
    }

    if (blobResult.statusCode !== 200) {
      throw new Error(
        `Gagal membaca file sementara. Status: ${blobResult.statusCode}`,
      );
    }

    if (!blobResult.stream) {
      throw new Error(
        "Stream file sementara tidak tersedia.",
      );
    }

    const response = new Response(
      blobResult.stream,
    );

    const arrayBuffer =
      await response.arrayBuffer();

    if (arrayBuffer.byteLength <= 0) {
      throw new Error(
        "File yang diterima kosong.",
      );
    }

    if (
      arrayBuffer.byteLength !== details.size
    ) {
      throw new Error(
        "Ukuran file berubah saat diproses.",
      );
    }

    if (
      arrayBuffer.byteLength > MAX_FILE_SIZE
    ) {
      throw new Error(
        "File melebihi batas maksimum 32 MB.",
      );
    }

    const fileBlob = new Blob(
      [arrayBuffer],
      {
        type:
          details.contentType ||
          "application/octet-stream",
      },
    );

    const formData = new FormData();

    formData.append(
      "file",
      fileBlob,
      fileName,
    );

    const payload = await vtRequest(
      "/files",
      {
        method: "POST",
        body: formData,
      },
      55_000,
    );

    return res.status(200).json({
      data: payload.data,
    });
  } catch (error) {
    console.error(
      "VirusTotal file scan error:",
      error,
    );

    return sendVtError(
      res,
      error,
      400,
      "Upload file ke VirusTotal gagal.",
    );
  } finally {
    /*
     * File sementara tetap dicoba dihapus meskipun
     * proses VirusTotal gagal.
     */
    if (blobUrl && blobToken) {
      try {
        await del(blobUrl, {
          token: blobToken,
        });
      } catch (cleanupError) {
        console.warn(
          "Temporary blob cleanup failed:",
          cleanupError,
        );
      }
    }
  }
}