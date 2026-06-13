import { handleUpload } from "@vercel/blob/client";
import {
  allowMethods,
  getErrorMessage,
  rateLimit,
  requireSameOrigin,
  setCommonHeaders,
} from "../../server/scanner/http.js";

const MAX_FILE_SIZE = 32 * 1024 * 1024;

export default async function handler(req, res) {
  setCommonHeaders(res);
  if (!allowMethods(req, res, ["POST"])) return;
  if (!requireSameOrigin(req, res)) return;
  if (!rateLimit(req, res, { key: "blob-upload-token", limit: 10, windowMs: 60_000 })) return;

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let payload = {};
        try {
          payload = clientPayload ? JSON.parse(clientPayload) : {};
        } catch {
          throw new Error("Payload upload tidak valid.");
        }

        if (!String(pathname).startsWith("scanner/")) {
          throw new Error("Path upload tidak valid.");
        }

        if (payload.purpose !== "virus-total-scan") {
          throw new Error("Tujuan upload tidak valid.");
        }

        const declaredSize = Number(payload.size || 0);
        if (!Number.isFinite(declaredSize) || declaredSize <= 0 || declaredSize > MAX_FILE_SIZE) {
          throw new Error("Ukuran file harus berada di antara 1 byte dan 32 MB.");
        }

        return {
          maximumSizeInBytes: MAX_FILE_SIZE,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            purpose: "virus-total-scan",
            declaredSize,
            issuedAt: Date.now(),
          }),
        };
      },
      onUploadCompleted: async () => {
        // The scan endpoint consumes and deletes the temporary private blob.
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    return res.status(400).json({
      error: getErrorMessage(error, "Gagal menyiapkan upload sementara."),
    });
  }
}
