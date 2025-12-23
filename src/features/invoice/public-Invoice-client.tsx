"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import axios from "axios";

type PublicInvoiceData = {
  invoice: { number: string };
  supplier: { name: string; address?: string; email?: string };
  customer: { name: string; address?: string };
  lines: Array<{
    description: string;
    quantity: number;
    unitPrice: string;
    lineTotal: string;
  }>;
  totals: {
    subtotal: string;
    tax: string;
    total: string;
    paid: string;
    balance: string;
  };
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

export default function PublicInvoiceClient({ token }: { token: string }) {
  const [data, setData] = React.useState<PublicInvoiceData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [downloading, setDownloading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await axios.get(
          `${BACKEND_URL}/api/invoices/public/${token}`
        );
        if (cancelled) return;

        // Assuming your backend wraps with { data: ... }
        setData(res.data.data);
      } catch (e: any) {
        if (cancelled) return;
        setErr(
          e?.response?.data?.message ?? e?.message ?? "Failed to load invoice"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const downloadPdf = async () => {
    try {
      setDownloading(true);
      setErr(null);

      const res = await axios.get(
        `${BACKEND_URL}/api/invoices/public/${token}/pdf`
      );
      const url = res.data?.data?.pdfUrl;

      if (!url) throw new Error("No PDF available");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      setErr(
        e?.response?.data?.message ?? e?.message ?? "Failed to download PDF"
      );
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="p-6">Loading invoice…</div>;
  if (err)
    return <div className="p-6">This invoice link is invalid or expired.</div>;
  if (!data) return <div className="p-6">No invoice data.</div>;

  const { invoice, supplier, customer, lines, totals } = data;

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl font-semibold">Invoice</div>
          <div className="text-sm opacity-70">#{invoice.number}</div>
        </div>
        <button
          className="rounded-lg border px-3 py-2 text-sm disabled:opacity-60"
          onClick={downloadPdf}
          disabled={downloading}
        >
          {downloading ? "Preparing…" : "Download PDF"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-4">
          <div className="text-sm font-medium">From</div>
          <div className="mt-2 text-sm whitespace-pre-wrap">
            {supplier.name}
            {"\n"}
            {supplier.address ?? ""}
            {"\n"}
            {supplier.email ?? ""}
          </div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm font-medium">To</div>
          <div className="mt-2 text-sm whitespace-pre-wrap">
            {customer.name}
            {"\n"}
            {customer.address ?? ""}
          </div>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/5">
            <tr>
              <th className="text-left p-3">Description</th>
              <th className="text-right p-3">Qty</th>
              <th className="text-right p-3">Unit</th>
              <th className="text-right p-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i} className="border-t">
                <td className="p-3">{l.description}</td>
                <td className="p-3 text-right">{l.quantity}</td>
                <td className="p-3 text-right">{l.unitPrice}</td>
                <td className="p-3 text-right">{l.lineTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto w-full max-w-sm rounded-xl border p-4 text-sm space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{totals.subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{totals.tax}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{totals.total}</span>
        </div>
        <div className="flex justify-between">
          <span>Paid</span>
          <span>{totals.paid}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Balance</span>
          <span>{totals.balance}</span>
        </div>
      </div>
    </div>
  );
}
