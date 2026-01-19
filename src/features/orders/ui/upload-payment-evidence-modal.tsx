/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useMemo, useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { putToS3 } from "../helper/evidence";
import { Button } from "@/shared/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  paymentId: string;
  onUploaded?: () => void; // e.g. refetch order
};

type PresignResp = {
  data?: {
    upload?: { key: string; uploadUrl: string; url?: string };
  };
  upload?: { key: string; uploadUrl: string; url?: string };
};

export function UploadPaymentEvidenceModal({
  open,
  onClose,
  paymentId,
  onUploaded,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => !!file && !isSubmitting,
    [file, isSubmitting]
  );

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "application/pdf": [] },
    multiple: false,
  });

  const reset = () => {
    setFile(null);
    setNote("");
    setError(null);
    setIsSubmitting(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    if (!file) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const fileName = file.name || `evidence-${Date.now()}`;
      const mimeType = file.type || "application/octet-stream";

      // 1) presign (Next.js route)
      const presign = await axios.post<PresignResp>(
        "/api/payments/evidence/presign",
        { paymentId, fileName, mimeType }
      );

      const upload = presign.data?.data?.upload ?? presign.data.upload;

      if (!upload?.uploadUrl || !upload?.key) {
        throw new Error("No presigned upload returned");
      }

      // 2) PUT to S3
      await putToS3(upload.uploadUrl, file);

      // 3) finalize (Next.js route)
      await axios.post("/api/payments/evidence/finalize", {
        paymentId,
        key: upload.key,
        url: upload.url,
        fileName,
        mimeType,
        note: note?.trim() || undefined,
      });

      onUploaded?.();
      close();
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Upload proof of payment</h2>
            <p className="text-sm text-gray-500">
              Upload a screenshot or PDF receipt for your bank transfer.
            </p>
          </div>

          <button
            type="button"
            onClick={close}
            className="rounded-md px-2 py-1 text-sm hover:bg-gray-100"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div
            {...getRootProps()}
            className={[
              "rounded-xl border border-dashed p-5 cursor-pointer",
              isDragActive ? "border-black" : "border-gray-300",
            ].join(" ")}
          >
            <input {...getInputProps()} />
            <div className="text-sm">
              {file ? (
                <div className="space-y-1">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                    {file.type || "—"}
                  </p>
                  <p className="text-gray-500">Click to change file</p>
                </div>
              ) : (
                <p className="text-gray-600">
                  Drag & drop an image/PDF here, or click to select
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Note (optional)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="e.g. Sent from GTBank mobile app"
              disabled={isSubmitting}
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <Button
              variant={"clean"}
              type="button"
              onClick={close}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button type="button" onClick={submit} disabled={!canSubmit}>
              {isSubmitting ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
