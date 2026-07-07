<div align="center">

# GrowEasy — AI-Powered CSV Importer for Real Estate CRM

**Drop any CSV. AI maps it. Your leads land perfectly.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3-F55036?style=for-the-badge)](https://groq.com/)

![GrowEasy Banner](https://placehold.co/1200x400/0f172a/38bdf8?text=GrowEasy+%E2%80%94+AI-Powered+CSV+Importer)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [CRM Schema](#crm-schema)
- [Sample CSV Files](#sample-csv-files)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

GrowEasy is a fullstack web application that solves a real pain point for real estate sales teams: **importing leads from dozens of different CSV formats into one unified CRM schema** — without manual column mapping.

You upload a CSV (from Facebook Ads, Google Ads, a manual spreadsheet, or any other source). The AI reads the headers and data, intelligently maps every column to the correct CRM field, normalises phone numbers, deduplicates emails, and delivers clean, structured lead records — all in seconds.

> Built for teams that deal with messy, inconsistent lead exports every single day.

---

## Key Features

### AI-Powered Column Mapping
Upload any CSV with any column names. GrowEasy's AI (Google Gemini 2.5 Flash with Groq LLaMA 3.3 as fallback) automatically understands the intent of each column and maps it to the correct CRM field — no manual configuration needed.

### Dual-Provider AI with Graceful Fallback
- **Primary:** Google Gemini 2.5 Flash (fast, structured JSON output)
- **Fallback:** Groq LLaMA 3.3 70B (activates automatically if Gemini fails)
- **Row-level fallback:** If a batch fails after retries, it falls back to row-by-row processing — so you never lose data

### Batch Processing with Concurrency Control
Processes up to **20 records per AI call** and runs **2 batches concurrently**. Exponential backoff with 3 retry attempts ensures reliability under rate limits.

### Live Import Preview
Before the AI runs, you see a raw preview of your uploaded CSV. After processing, you get a split view of **imported records** vs. **skipped records**, with reasons for any skips.

### Experts / Leads Directory
Browse all imported leads in a responsive **grid or table view** with search, filter, and pagination. User cards show name, company, city, status badge, and lead source at a glance.

### Toast Notification System
Real-time feedback on every action — file upload, processing start, success, and errors — through a built-in notification centre.

### Data Integrity Guarantees
- Phone numbers are stored as digits-only (no country code mixing)
- Emails are lowercased and deduplicated
- Records missing both email and mobile are automatically skipped
- All enum values are validated against a strict Zod schema

---

## Screenshots

> Place screenshots in a `/docs/screenshots/` folder and update paths below.

| Import Flow | Results View |
|:-----------:|:------------:|
| ![Upload Screen](https://placehold.co/580x360/0f172a/38bdf8?text=Drop+Zone+%26+CSV+Upload) | ![Results Screen](https://placehold.co/580x360/0f172a/38bdf8?text=Import+Results+%26+Summary) |

| Experts Directory (Grid) | Experts Directory (Table) |
|:------------------------:|:-------------------------:|
| ![Grid View](https://placehold.co/580x360/0f172a/38bdf8?text=Lead+Cards+Grid+View) | ![Table View](https://placehold.co/580x360/0f172a/38bdf8?text=Lead+Table+View) |

| Lead Detail | Search & Filter |
|:-----------:|:---------------:|
| ![Lead Detail](https://placehold.co/580x360/0f172a/38bdf8?text=Lead+Detail+Page) | ![Search](https://placehold.co/580x360/0f172a/38bdf8?text=Search+%26+Filter+UI) |

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| **Next.js** | 16.2.10 | React framework with App Router |
| **React** | 19.2.4 | UI rendering |
| **TypeScript** | 5 | Type safety |
| **Tailwind CSS** | 4.3.2 | Utility-first styling |
| **Zustand** | 5.0.14 | Import flow state management |
| **Framer Motion** | 12.42.2 | Page and component animations |
| **Axios** | 1.18.1 | HTTP client |
| **PapaParse** | 5.5.4 | Client-side CSV parsing & preview |
| **Lucide React** | 1.23.0 | Icon library |

### Backend

| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| **Node.js** | 20+ | Runtime |
| **Express.js** | 4.19.2 | HTTP server & routing |
| **TypeScript** | 5.4.5 | Type safety |
| **Google Generative AI** | 0.21.0 | Gemini 2.5 Flash — primary AI |
| **Groq SDK** | 1.3.0 | LLaMA 3.3 70B — fallback AI |
| **PapaParse** | 5.4.1 | Server-side CSV parsing |
| **Multer** | 1.4.5 | Multipart file upload handling |
| **Zod** | 3.23.8 | Schema validation |

---

## How It Works

```
┌─────────────┐     ┌───────────────────────────────────────────────────────┐
│   Browser   │     │                     Backend                           │
│             │     │                                                       │
│  Drop CSV   │────▶│  1. Parse CSV with PapaParse                          │
│             │     │  2. Chunk rows into batches of 20                     │
│  Preview    │     │  3. Send 2 batches concurrently to AI                 │
│  raw data   │     │                                                       │
│             │     │  ┌─────────────────────────────────────────────────┐  │
│  AI maps    │◀────│  │  AI Processing Pipeline                         │  │
│  & imports  │     │  │                                                 │  │
│             │     │  │  Gemini 2.5 Flash (primary, structured JSON)    │  │
│  See stats  │     │  │       │ fails?                                  │  │
│  & records  │     │  │       ▼                                         │  │
│             │     │  │  Groq LLaMA 3.3 70B (provider fallback)         │  │
│             │     │  │       │ fails after 3 retries?                  │  │
│             │     │  │       ▼                                         │  │
│             │     │  │  Row-by-row fallback (never loses data)         │  │
│             │     │  └─────────────────────────────────────────────────┘  │
│             │     │                                                       │
│             │     │  4. Validate each record against Zod CRM schema       │
│             │     │  5. Skip records with no email AND no mobile          │
│             │     │  6. Return imported + skipped records + stats         │
└─────────────┘     └───────────────────────────────────────────────────────┘
```

### The AI Mapping Step in Detail

The AI receives:
- A batch of raw CSV rows (up to 20)
- A system prompt describing all 15 CRM fields, their types, and transformation rules
- A strict JSON schema that Gemini must conform to

The AI returns structured objects with fields like `name`, `email`, `mobile_without_country_code`, `country_code`, `crm_status`, `data_source`, etc. — regardless of what the original column headers were.

---

## Project Structure

```
groweasy/
│
├── backend/                        # Express + TypeScript API
│   └── src/
│       ├── config/
│       │   └── env.ts              # Zod-validated environment config
│       ├── controllers/
│       │   └── import.controller.ts
│       ├── routes/
│       │   └── import.ts           # POST /api/import
│       ├── services/
│       │   ├── ai.service.ts       # Gemini / Groq batching + fallback
│       │   ├── csv.service.ts      # CSV parsing
│       │   └── mapping.service.ts  # Row transformation to CRM schema
│       ├── schema/
│       │   ├── crm.schema.ts       # Zod schema (source of truth)
│       │   └── crm.gemini-schema.ts# Gemini response schema
│       ├── prompts/
│       │   └── extract.prompt.ts   # AI system prompt
│       └── utils/
│           ├── backoff.ts          # Exponential backoff
│           └── logger.ts           # Structured logger
│
├── frontend/                       # Next.js 16 App Router
│   ├── app/
│   │   ├── page.tsx                # Experts directory (home)
│   │   ├── import/page.tsx         # CSV import flow
│   │   ├── leads/page.tsx          # Leads list
│   │   └── users/[id]/page.tsx     # User detail
│   ├── components/
│   │   ├── import/                 # DropZone, PreviewTable, ResultTable, SummaryCards
│   │   ├── users/                  # UserCard, UserTable, SearchBar, StatsBar
│   │   ├── leads/                  # LeadCard, LeadTable
│   │   └── ui/                     # Skeleton, EmptyState, ErrorState, Pagination
│   ├── store/
│   │   └── importStore.ts          # Zustand: upload → preview → processing → results
│   ├── hooks/                      # useUsers, useUser, useDebounce, useLocalStorage
│   ├── services/
│   │   └── api.ts                  # Axios HTTP client
│   └── lib/
│       ├── api.ts                  # Import API call
│       ├── csv.ts                  # Client-side CSV parser
│       └── types.ts                # Shared TypeScript types
│
└── samples/                        # Example CSVs for testing
    ├── groweasy_leads_150.csv      # 150 real estate leads
    ├── agency_messy.csv            # Inconsistent column naming
    ├── facebook_leads.csv          # Facebook Ads export format
    ├── google_ads.csv              # Google Ads export format
    ├── realestate_crm.csv          # Real estate CRM export
    └── manual_sheet.csv            # Manual entry spreadsheet
```

---

## Getting Started

### Prerequisites

- **Node.js** v20 or higher
- **npm** v9 or higher
- A **Google Gemini API key** (get one at [ai.google.dev](https://ai.google.dev/))
- A **Groq API key** for fallback (get one at [console.groq.com](https://console.groq.com/)) _(optional but recommended)_

### 1. Clone the repository

```bash
git clone https://github.com/your-username/groweasy.git
cd groweasy
```

### 2. Set up the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in your API keys (see [Environment Variables](#environment-variables)).

```bash
# Development (hot reload)
npm run dev

# Production
npm run build
npm start
```

The backend starts on **http://localhost:3001**.

### 3. Set up the Frontend

```bash
cd ../frontend
npm install
cp .env.local.example .env.local
```

Edit `.env.local` and set `NEXT_PUBLIC_API_URL=http://localhost:3001`.

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

The frontend starts on **http://localhost:3000**.

### 4. Open the app

Visit [http://localhost:3000](http://localhost:3000) and try uploading one of the sample CSVs from the `/samples` folder.

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Required | Default | Description |
|:---------|:--------:|:--------|:------------|
| `PORT` | No | `3001` | Port the Express server listens on |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `GEMINI_API_KEY` | **Yes** | — | Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Gemini model identifier |
| `GROQ_API_KEY` | No | — | Groq API key (enables fallback provider) |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` | Groq model identifier |
| `AI_BATCH_SIZE` | No | `20` | Max records per AI request |
| `AI_MAX_CONCURRENCY` | No | `2` | Parallel batch limit |
| `AI_MAX_RETRIES` | No | `3` | Retry attempts per batch before fallback |
| `ALLOWED_ORIGINS` | No | `http://localhost:3000` | Comma-separated list of allowed CORS origins |

Example `backend/.env`:

```env
PORT=3001
NODE_ENV=development

GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.5-flash

GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile

AI_BATCH_SIZE=20
AI_MAX_CONCURRENCY=2
AI_MAX_RETRIES=3

ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
```

### Frontend — `frontend/.env.local`

| Variable | Required | Description |
|:---------|:--------:|:------------|
| `NEXT_PUBLIC_API_URL` | **Yes** | Base URL of the backend API |

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## API Reference

### Health Check

```
GET /api/health
```

**Response:**
```json
{
  "ok": true,
  "timestamp": "2026-07-07T12:00:00.000Z"
}
```

---

### Import CSV

```
POST /api/import
```

**Content-Type:** `multipart/form-data` (file upload) **or** `application/json` (pre-parsed rows)

**Multipart Request:**

| Field | Type | Description |
|:------|:-----|:------------|
| `file` | File | CSV file, max 10 MB |

**JSON Request Body:**

```json
{
  "rows": [
    { "Name": "John Doe", "Email": "john@example.com", "Phone": "+91 9876543210" }
  ]
}
```

**Response:**

```json
{
  "imported": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "country_code": "+91",
      "mobile_without_country_code": "9876543210",
      "company": "",
      "city": "",
      "state": "",
      "country": "India",
      "lead_owner": "",
      "crm_status": "GOOD_LEAD_FOLLOW_UP",
      "crm_note": "",
      "data_source": "leads_on_demand",
      "possession_time": "",
      "description": "",
      "created_at": "2026-07-07"
    }
  ],
  "skipped": [],
  "stats": {
    "total": 1,
    "imported": 1,
    "skipped": 0
  }
}
```

**Errors:**

| Status | Meaning |
|:-------|:--------|
| `400` | No file uploaded or invalid CSV |
| `500` | AI processing failed for all batches |

---

## CRM Schema

Every imported record conforms to the following schema, validated with **Zod**:

| Field | Type | Notes |
|:------|:-----|:------|
| `created_at` | `string` | Date the record was created |
| `name` | `string` | Full name of the lead |
| `email` | `string` | Lowercased; duplicates go into `crm_note` |
| `country_code` | `string` | e.g. `+91` |
| `mobile_without_country_code` | `string` | Digits only, no spaces or dashes |
| `company` | `string` | Company or organisation |
| `city` | `string` | City |
| `state` | `string` | State or province |
| `country` | `string` | Country |
| `lead_owner` | `string` | Assigned sales representative |
| `crm_status` | `enum` | See below |
| `crm_note` | `string` | Internal notes, alt contacts, etc. |
| `data_source` | `enum` | See below |
| `possession_time` | `string` | Expected possession timeline |
| `description` | `string` | Extra details |

### `crm_status` values

| Value | Meaning |
|:------|:--------|
| `GOOD_LEAD_FOLLOW_UP` | Active lead, needs follow-up |
| `DID_NOT_CONNECT` | Could not reach the lead |
| `BAD_LEAD` | Unqualified or invalid lead |
| `SALE_DONE` | Conversion complete |

### `data_source` values

| Value | Project |
|:------|:--------|
| `leads_on_demand` | General / unspecified lead source |
| `meridian_tower` | Meridian Tower project |
| `eden_park` | Eden Park project |
| `varah_swamy` | Varah Swamy project |
| `sarjapur_plots` | Sarjapur Plots project |

> Records with **no email AND no mobile** are automatically skipped and returned in the `skipped` array.

---

## Sample CSV Files

The `/samples` directory contains ready-to-use test files that cover the most common real-world formats:

| File | Description | Rows |
|:-----|:------------|:----:|
| `groweasy_leads_150.csv` | Native GrowEasy export format | 150 |
| `facebook_leads.csv` | Facebook Ads lead form export | varies |
| `google_ads.csv` | Google Ads conversion export | varies |
| `agency_messy.csv` | Agency export with inconsistent headers | varies |
| `realestate_crm.csv` | Third-party real estate CRM export | varies |
| `manual_sheet.csv` | Manually maintained spreadsheet | varies |

Upload any of these through the UI to see the AI mapping in action.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

### Development Tips

- Run `npm run dev` in both `backend/` and `frontend/` simultaneously
- Use the files in `/samples` to test various CSV formats
- The AI system prompt is in `backend/src/prompts/extract.prompt.ts` — tweak it to support new field mappings or data sources
- Zod schema in `backend/src/schema/crm.schema.ts` is the single source of truth for all field constraints

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with care for real estate sales teams who deserve better tooling.

[![GitHub stars](https://img.shields.io/github/stars/your-username/groweasy?style=social)](https://github.com/your-username/groweasy)

</div>
