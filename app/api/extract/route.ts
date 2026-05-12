import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// pdf-parse imported this way to avoid its test-file loading bug in Next.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
  buf: Buffer
) => Promise<{ text: string }>;

const PROMPT = `You are reading a receipt. Extract all information and return it as a single JSON object with these exact keys:

- merchant_name: business or store name printed on the receipt
- date: purchase date (YYYY-MM-DD format if possible)
- total_amount: final total amount paid (digits only, no currency symbol)
- currency: currency code (e.g. MYR, USD, EUR, SGD)
- items: array of every line item on the receipt, each object having:
    - name: item name or description
    - amount: item price (digits only, no currency symbol)

Output ONLY the raw JSON object. No markdown, no code blocks, no explanation.
Use empty string "" for fields not visible. Use empty array [] if no items are found.
Do not invent values.`;

function parseJson(raw: string) {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  const brace = text.match(/\{[\s\S]*\}/);
  if (brace) text = brace[0];
  return JSON.parse(text);
}

export async function POST(request: NextRequest) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const formData = await request.formData();
    const file = formData.get("receipt") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isImage = file.type.startsWith("image/");

    if (!isPdf && !isImage) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    let responseText: string;

    if (isPdf) {
      const pdfData = await pdfParse(Buffer.from(bytes));
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: `Here is text extracted from a receipt:\n\n${pdfData.text}\n\n${PROMPT}`,
          },
        ],
        max_tokens: 1024,
      });
      responseText = completion.choices[0].message.content ?? "";
    } else {
      const base64 = Buffer.from(bytes).toString("base64");
      const completion = await groq.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${file.type};base64,${base64}` },
              },
              { type: "text", text: PROMPT },
            ],
          },
        ],
        max_tokens: 1024,
      });
      responseText = completion.choices[0].message.content ?? "";
    }

    const extracted = parseJson(responseText);
    console.log("Extracted:", JSON.stringify(extracted, null, 2));
    return NextResponse.json(extracted);
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json({ error: "Failed to extract receipt data" }, { status: 500 });
  }
}
