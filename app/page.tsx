"use client";

import { useState } from "react";
import UploadArea from "@/components/UploadArea";
import ReceiptForm from "@/components/ReceiptForm";

export interface LineItem {
  name: string;
  amount: string;
}

export interface ReceiptData {
  merchant_name: string;
  date: string;
  total_amount: string;
  currency: string;
  items: LineItem[];
}

type AppState = "upload" | "loading" | "form" | "success";

export default function Home() {
  const [state, setState] = useState<AppState>("upload");
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleUpload = async (file: File) => {
    setState("loading");
    setError(null);
    setPreviewUrl(URL.createObjectURL(file));
    setFileName(file.name);

    const formData = new FormData();
    formData.append("receipt", file);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Extraction failed");

      const data = await response.json();
      setReceiptData(data);
      setState("form");
    } catch {
      setError("Failed to process receipt. Please try again.");
      setState("upload");
    }
  };

  const handleSubmit = async (data: ReceiptData) => {
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Submit failed");

      setState("success");
    } catch {
      setError("Failed to save receipt. Please try again.");
    }
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setState("upload");
    setReceiptData(null);
    setError(null);
    setPreviewUrl(null);
    setFileName("");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Receipt Extractor</h1>
          <p className="text-gray-500 mt-2">Upload a receipt to extract key information automatically</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {state === "upload" && <UploadArea onUpload={handleUpload} />}

          {state === "loading" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Extracting receipt data...</p>
              <p className="text-gray-400 text-sm mt-1">This may take a few seconds</p>
            </div>
          )}

          {state === "form" && receiptData && (
            <ReceiptForm
              initialData={receiptData}
              onSubmit={handleSubmit}
              onBack={handleReset}
              previewUrl={previewUrl}
              fileName={fileName}
            />
          )}

          {state === "success" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Receipt Saved!</h2>
              <p className="text-gray-500 mb-6">Your receipt data has been successfully saved.</p>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Upload Another
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
