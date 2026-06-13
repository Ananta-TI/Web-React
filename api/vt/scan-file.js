import { del, get, head } from "@vercel/blob";
import {
  allowMethods,
  rateLimit,
  requireSameOrigin,
  setCommonHeaders,
} from "../_lib/http.js";
import { sendVtError, vtRequest } from "../_lib/virustotal.js";

const MAX_FILE_SIZE = 32 * 1024 * 1024;

function validateBlobUrl(value) {
  const url = new URL(String(value || ""));
  const validHost = url.hostname.endsWith(".private.blob.vercel-storage.com");
  const validPath = url.pathname.includes("/scanner/");

  if (url.protocol !== "https:" || !validHost || !validPath) {
    throw new Error("URL blob sementara tidak valid.");
  }

  return url.toString();
}

function cleanFileName(value) {
  const name = String(value || "uploaded-file").replace(/[\\/\0\r\n]/g, "_").trim();
  return name.slice(0, 180) || "uploaded-file";
}

export default async function handler(req, res) {
  setCommonHeaders(res);
  if (!allowMethods(req, res, ["POST"])) return;
  if (!requireSameOrigin(req, res)) return;
  if (!rateLimit(req, res, { key: "vt-file-scan", limit: 10, windowMs: 60_000 })) return;

  let blobUrl = null;

  try {
    blobUrl = validateBlobUrl(req.body?.blobUrl);
    const fileName = cleanFileName(req.body?.fileName);

    const details = await head(blobUrl);
    if (!details?.size || details.size > MAX_FILE_SIZE) {
      throw new Error("File kosong atau melebihi batas 32 MB.");
    }

    const blobResult = await get(blobUrl, { access: "private" });
    if (!blobResult?.stream) {
      throw new Error("File sementara tidak dapat dibaca.");
    }

    const arrayBuffer = await new Response(blobResult.stream).arrayBuffer();
    if (arrayBuffer.byteLength !== details.size || arrayBuffer.byteLength > MAX_FILE_SIZE) {
      throw new Error("Ukuran file berubah atau tidak valid saat diproses.");
    }

    const form = new FormData();
    const fileBlob = new Blob([arrayBuffer], {
      type: details.contentType || "application/octet-stream",
    });
    form.append("file", fileBlob, fileName);

    const payload = await vtRequest("/files", {
      method: "POST",
      body: form,
    }, 55_000);

    return res.status(200).json({ data: payload.data });
  } catch (error) {
    return sendVtError(res, error, 400, "Upload file ke VirusTotal gagal.");
  } finally {
    if (blobUrl) {
      try {
        await del(blobUrl);
      } catch (cleanupError) {
        console.warn("Temporary blob cleanup failed:", cleanupError);
      }
    }
  }
}
