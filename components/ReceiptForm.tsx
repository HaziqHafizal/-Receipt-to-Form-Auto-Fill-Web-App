"use client";

import { useState } from "react";
import { ReceiptData } from "@/app/page";

interface ReceiptFormProps {
  initialData: ReceiptData;
  onSubmit: (data: ReceiptData) => Promise<void>;
  onBack: () => void;
  previewUrl?: string | null;
  fileName?: string;
}

const summaryFields: { key: "merchant_name" | "date" | "total_amount" | "currency"; label: string; placeholder: string }[] = [
  { key: "merchant_name", label: "Merchant Name", placeholder: "e.g. Starbucks" },
  { key: "date", label: "Date", placeholder: "e.g. 2024-01-15" },
  { key: "total_amount", label: "Total Amount", placeholder: "e.g. 25.50" },
  { key: "currency", label: "Currency", placeholder: "e.g. MYR, USD" },
];

export default function ReceiptForm({ initialData, onSubmit, onBack, previewUrl, fileName }: ReceiptFormProps) {
  const [data, setData] = useState<ReceiptData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: "merchant_name" | "date" | "total_amount" | "currency") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  const isPdf = fileName?.toLowerCase().endsWith(".pdf");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Receipt preview */}
      {previewUrl && (
        <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          {isPdf ? (
            <div className="flex items-center gap-3 px-4 py-3">
              <svg className="w-8 h-8 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 17.5v-5h1.25c.69 0 1.25.56 1.25 1.25v2.5c0 .69-.56 1.25-1.25 1.25H8.5zm1-.75h.25c.28 0 .5-.22.5-.5v-2.5c0-.28-.22-.5-.5-.5H9.5v3.5zm3-4.25h2v.75h-1.25v1h1.25v.75H12.5v.75H11.5v-3.25zm3.5 0h1c.55 0 1 .45 1 1v.25c0 .55-.45 1-1 1H15v1h-1v-3.25h1zm.75 1.5c.14 0 .25-.11.25-.25v-.25c0-.14-.11-.25-.25-.25H15v.75h.75z"/>
              </svg>
              <span className="text-sm text-gray-700 font-medium truncate">{fileName}</span>
            </div>
          ) : (
            <img src={previewUrl} alt="Uploaded receipt" className="w-full max-h-56 object-contain" />
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Extracted Data</h2>
        <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full font-medium">
          AI Extracted
        </span>
      </div>
      <p className="text-sm text-gray-500 -mt-2 pb-1">Review and edit the fields before saving.</p>

      {summaryFields.map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <input
            type="text"
            value={data[key]}
            onChange={handleChange(key)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      ))}

      {/* Line items */}
      {data.items && data.items.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Items ({data.items.length})
          </label>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Item</span>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</span>
            </div>
            {data.items.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center px-3 py-2 border-b border-gray-100 last:border-0 text-sm"
              >
                <span className="text-gray-700 flex-1 pr-4">{item.name}</span>
                <span className="text-gray-900 font-medium shrink-0">
                  {data.currency} {item.amount}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center px-3 py-2 bg-gray-50 border-t border-gray-200 text-sm font-semibold">
              <span className="text-gray-700">Total</span>
              <span className="text-gray-900">{data.currency} {data.total_amount}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save Receipt"}
        </button>
      </div>
    </form>
  );
}
