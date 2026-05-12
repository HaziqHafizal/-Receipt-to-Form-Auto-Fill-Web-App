# Receipt to Form Auto-Fill Web App
A web app that extracts information from receipt images and PDFs using generative AI and auto-fills a form with the results.
Live Vercel URL: https://receipt-to-form-auto-fill-web-app-silk.vercel.app/
## Features

- Upload a receipt via drag & drop or file picker (JPG, PNG, WEBP, PDF)
- AI extracts merchant name, date, total amount, currency, and all line items
- Pre-filled editable form with receipt preview for easy review
- Submit to save extracted data to MongoDB
- Supports both image receipts (vision model) and PDF receipts (text extraction)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI | Groq API — Llama 4 Scout (vision) + Llama 3.1 (text) |
| Database | MongoDB Atlas + Mongoose |
| Hosting | Vercel |

### Installation

```bash
git clone https://github.com/HaziqHafizal/-Receipt-to-Form-Auto-Fill-Web-App.git
cd -Receipt-to-Form-Auto-Fill-Web-App
npm install
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

```
Upload image/PDF
      ↓
Extract route (/api/extract)
  • Image → Groq Llama 4 Scout vision model
  • PDF   → pdf-parse extracts text → Groq Llama 3.1 text model
      ↓
Returns: merchant_name, date, total_amount, currency, items[]
      ↓
Pre-filled form displayed with receipt preview
      ↓
User reviews and edits fields
      ↓
Submit route (/api/submit) → saved to MongoDB
```

## Project Structure

```
app/
  page.tsx                 # Main page — upload → loading → form → success
  api/
    extract/route.ts       # AI extraction endpoint
    submit/route.ts        # MongoDB save endpoint
components/
  UploadArea.tsx           # Drag & drop file upload (4.5MB limit)
  ReceiptForm.tsx          # Editable form with receipt preview and items table
lib/
  mongodb.ts               # Singleton MongoDB connection for serverless
  models/receipt.ts        # Mongoose schema
```

| Field | Description |
|---|---|
| `merchant_name` | Store or business name |
| `date` | Transaction date |
| `total_amount` | Final total paid |
| `currency` | Currency code (e.g. MYR, USD) |
| `items` | Array of line items with name and amount |
