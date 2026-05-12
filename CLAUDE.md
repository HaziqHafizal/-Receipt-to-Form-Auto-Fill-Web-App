# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server at localhost:3000
npm run build        # production build
npm run lint         # run ESLint
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:
- `HUGGINGFACE_API_KEY` — from huggingface.co/settings/tokens (free, no credit card)
- `MONGODB_URI` — MongoDB Atlas connection string

## Architecture

Next.js 14 App Router app. Frontend and backend live in the same repo.

**Request flow:**
1. User uploads image → `POST /api/extract` → Claude vision API → returns 4 extracted fields as JSON
2. User reviews/edits form → `POST /api/submit` → saved to MongoDB

**Key files:**
- `app/page.tsx` — single-page client component managing state machine: `upload → loading → form → success`
- `app/api/extract/route.ts` — images go to `Qwen/Qwen2-VL-7B-Instruct` (HuggingFace vision); PDFs are parsed with `pdf-parse` then sent to `mistralai/Mistral-7B-Instruct-v0.3` as text
- `app/api/submit/route.ts` — saves form data to MongoDB via Mongoose
- `lib/mongodb.ts` — singleton connection pattern required for Next.js serverless (caches connection on `global._mongoose`)
- `lib/models/receipt.ts` — Mongoose schema for saved receipts
- `components/UploadArea.tsx` — drag-and-drop upload, enforces 4.5MB limit (Vercel serverless payload cap)
- `components/ReceiptForm.tsx` — pre-filled editable form, receives `initialData` from page state

**Extracted fields:** `merchant_name`, `date`, `total_amount`, `currency`

## Deployment (Vercel)

1. Push repo to GitHub
2. Import project in Vercel dashboard
3. Add `ANTHROPIC_API_KEY` and `MONGODB_URI` in Vercel environment variables
4. Deploy — `vercel.json` sets 30s timeout on the extract function for slow Claude responses
