# CivicPulse (CivicPulse India DPI)
> **AI-Powered National Development Intelligence & Digital Public Infrastructure Platform**

[![Runtime](https://img.shields.io/badge/Runtime-Node.js%20v22-green.svg)](https://nodejs.org/)
[![Framework](https://img.shields.io/badge/Framework-React%2019%20%2B%20Express-blue.svg)](https://react.dev/)
[![Build System](https://img.shields.io/badge/Build-Vite%20%2B%20esbuild-orange.svg)](https://vitejs.dev/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38bdf8.svg)](https://tailwindcss.com/)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Google%20Gemini%203.6%2F3.8%20Flash-8e44ad.svg)](https://ai.google.dev/)
[![Districts](https://img.shields.io/badge/Registry-52%20Districts%20%7C%2018%20States-red.svg)](#canonical-data-registry)

---

## 🏛️ Primary Purpose & Product North Star

**CivicPulse** aggregates citizen development requests via voice, text, and messaging apps across diverse linguistic regions of India. The system analyzes large datasets combining citizen feedback with national demographic data, infrastructure indices, and public investment plans, surfacing demand hotspots and recommending high-priority development projects to national policymakers.

---

## 🔄 Core Decision Pipeline

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 1. Multilingual Citizen Input (Voice, Text, Messaging in 8 Indian Languages)     │
└─────────────────────────┬────────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 2. Multilingual AI Diagnostic Engine (Preserves language, extracts structured)  │
└─────────────────────────┬────────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 3. Signal Aggregation & Community Issue Clustering                               │
└─────────────────────────┬────────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 4. Geospatial Demand Hotspots Mapping (Interactive TopoJSON & Leaflet)           │
└─────────────────────────┬────────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 5. Public Data Fusion (Demographics, Infrastructure Deficit, Poverty Index)      │
└─────────────────────────┬────────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 6. Deterministic Priority Score Engine (Explainable 0–100 Weighted Score)        │
└─────────────────────────┬────────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 7. Centrally Sponsored Scheme Alignment (JJM, NHM, PMGSY, RDSS)                  │
└─────────────────────────┬────────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 8. Actionable Policy Briefs & Traceable EvidenceBundle Dossier                   │
└─────────────────────────┬────────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 9. Government Priority Register / Action Queue (Proposed → Delivered)            │
└─────────────────────────┬────────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 10. Modeled Closed-Loop Impact Evaluation & Signal Reduction Verification        │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📜 Full Data Lineage Mandate

Every development recommendation generated or analyzed by CivicPulse maintains an unbroken, audit-ready data lineage chain:

$$\text{Recommendation} \longrightarrow \text{Priority Score} \longrightarrow \text{Evidence} \longrightarrow \text{Public Investment} \longrightarrow \text{Infrastructure} \longrightarrow \text{Population/Vulnerability} \longrightarrow \text{Location} \longrightarrow \text{Community Issue} \longrightarrow \text{Citizen Signals}$$

---

## Key Features

### 1. Multilingual Citizen Ingestion & Diagnostic AI
- **8 Supported Regional Languages**: Full UI localization and diagnostic NLP support for English (`en`), Hindi (`hi`), Telugu (`te`), Tamil (`ta`), Kannada (`kn`), Marathi (`mr`), Bengali (`bn`), and Odia (`or`).
- **Multimodal Voice Input**: Native audio recording and base64 audio processing via Gemini `gemini-3.6-flash`.
- **Structured Extraction**: Transcribes audio, preserves original text, translates to English, and categorizes category, subcategory, duration, location, severity (1–10), urgency, and affected population.
- **Truthful Fallback Engine**: If Gemini is offline or rate-limited, a deterministic diagnostic fallback engine processes inputs using language patterns and geographical rules.

### 2. Conversational AI Assistant
- Interactive follow-up conversational agent helping citizens refine vague complaints (e.g., asking targeted questions and generating quick option pills in their native language).
- Live state machine determining when a complaint is complete and ready for persistent submission.

### 3. Persistent Local Store & Dynamic Submission
- All new citizen submissions submitted via the app interface are saved to a local JSON database (`civicpulse_citizen_requests.json`).
- Immediate aggregation updates feed into live demand counters, community problem clusters, and district priority score calculations.

### 4. Interactive Geospatial Demand Hotspots
- **Custom TopoJSON Canvas**: High-resolution vector map of India with 52 canonical districts highlighted.
- **Leaflet GeoJSON Overlay**: District boundaries colored dynamically based on demand signal intensity and infrastructure access deficits.
- **Micro-Level Filtering**: Drill-down from State level to District, City/Taluk, and Locality.

### 5. Deterministic Priority Engine & Math Model
Calculates a transparent, explainable 0–100 Priority Score for every district and infrastructure sector:

$$S = (0.35 \cdot D_{\text{norm}}) + (0.35 \cdot G_{\text{norm}}) + (0.15 \cdot V_{\text{norm}}) + (0.15 \cdot I_{\text{norm}})$$

Where:
- $D_{\text{norm}}$: Normalized Citizen Demand Density (volume and urgency of signals relative to population)
- $G_{\text{norm}}$: Infrastructure Gap Deficit ($100 - \text{Access Coverage \%}$)
- $V_{\text{norm}}$: Multidimensional Poverty & Vulnerability Index
- $I_{\text{norm}}$: Investment Under-Allocation Ratio ($\text{Target Cost} / \max(1, \text{Planned Outlay})$)

### 6. Government Priority Register / Decision Queue
- Public-sector decision support interface listing interventions ranked by priority score.
- Clean column grid: `Rank & Project` (42%), `Priority Score` (14%), `Estimated Outlay` (14%), `Progress & Stage` (15%), `Status` (15%).
- Complete evidence modal detailing key reasoning, target beneficiaries, scheme alignment, and full `EvidenceBundle` dossier.

### 7. AI Executive Policy Brief Generator
- Generates formal, data-grounded infrastructure policy briefs in the selected target language using `gemini-3.6-flash`.
- Includes Executive Diagnostics, Strategic Priority Justification, 3-Phase Actionable Intervention Plan, and Target ROI Metrics.

### 8. Natural-Language Search & Gemini Function Calling
- Natural-language query parsing mapped to structured Gemini tool declarations (`get_request_by_id`, `search_citizen_reports`, `search_community_issues`, `search_hotspots`, `search_recommendations`, `search_locations`).
- Grounded AI summary generation synthesizing search results strictly from verified system data.

### 9. Modeled Closed-Loop Impact Simulator
- Measures post-intervention outcomes for completed projects.
- Compares pre-intervention demand signals against post-delivery complaint reduction and access coverage expansion.

---

## 📊 Canonical Data Registry

CivicPulse operates on a curated, benchmarked registry representing Indian administrative divisions:

- **52 Representative Districts** across **18 States and Union Territories**
- **3 Governance Levels**:
  - **Level 1 (Deep Baseline)**: Guntur (Andhra Pradesh), Patna (Bihar), Nashik (Maharashtra), Khordha (Odisha), Kamrup Metropolitan (Assam)
  - **Level 2 (Expanded Baseline)**: 10 Districts (Madhubani, Gaya, Solapur, Varanasi, Cuttack, Krishna, Nalgonda, Bellary, Tiruchirappalli, Kanpur Nagar)
  - **Level 3 (National Regional Coverage)**: 37 Additional Districts
- **7 Infrastructure Sectors**: Water, Roads, Healthcare, Power/Electricity, Drainage & Flood Control, Education, Sanitation.
- **Centrally Sponsored Schemes**: Jal Jeevan Mission (JJM), Pradhan Mantri Gram Sadak Yojana (PMGSY), National Health Mission (NHM), Revamped Distribution Sector Scheme (RDSS), PM-POSHAN, Swachh Bharat Mission (SBM).

---

## 🛠️ Tech Stack & System Architecture

### Frontend
- **Framework**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS v4 + `@tailwindcss/vite`
- **Icons**: Lucide React
- **Maps & Data Viz**: Leaflet, `react-leaflet`, `d3-geo`, `topojson-client`, Recharts
- **Animations**: Motion (`motion/react`)

### Backend Server
- **Server**: Express v4 running on Node.js v22
- **Compiler / Runtime**: `tsx` in development, `esbuild` CommonJS bundling for production (`dist/server.cjs`)
- **AI SDK**: Google GenAI SDK (`@google/genai`) accessing models `gemini-3.6-flash` and `gemini-3.8-flash`
- **Persistence**: Local JSON file storage (`civicpulse_citizen_requests.json`) with thread-safe file I/O and in-memory caches

---

## 📁 Directory & Codebase Architecture

```
/
├── server.ts                       # Express backend server with Gemini AI API & persistence
├── metadata.json                   # AI Studio applet capabilities and metadata
├── package.json                    # Project dependencies and scripts
├── vite.config.ts                  # Vite configuration with Tailwind plugin
├── tsconfig.json                   # TypeScript compiler configuration
├── civicpulse_citizen_requests.json # Local JSON storage for user-submitted citizen requests
├── src/
│   ├── main.tsx                    # React application entry point
│   ├── App.tsx                     # Main layout, router, global view switcher, and state engine
│   ├── index.css                   # Global styles & Tailwind CSS imports
│   ├── types.ts                    # Canonical TypeScript interfaces (District, CitizenRequest, etc.)
│   ├── components/
│   │   ├── Overview.tsx            # Executive Dashboard & Top Recommendation Panel
│   │   ├── HotspotMap.tsx          # Geospatial Demand Hotspot Map with Leaflet & TopoJSON
│   │   ├── CitizenIngestion.tsx    # Multilingual Voice/Text Submission Modal
│   │   ├── CitizenSubmissionView.tsx # Dedicated Citizen Submission Hub
│   │   ├── CitizenSignalsView.tsx  # Granular Citizen Signals Registry & Filters
│   │   ├── CommunityIssuesView.tsx # Aggregated Problem Clusters View
│   │   ├── ProjectsView.tsx        # Government Priority Register / Action Queue
│   │   ├── PriorityEngine.tsx      # Deterministic Priority Scoring Model Inspector
│   │   ├── PolicyLab.tsx           # Policy Brief Generator & AI Executive Briefing
│   │   ├── GovernmentBriefing.tsx  # Executive Briefing Dossier
│   │   ├── ImpactSimulator.tsx     # Closed-Loop Impact Simulator & Outcome Metrics
│   │   ├── DemographicsView.tsx    # Demographics & Vulnerability Index Explorer
│   │   ├── InfrastructureView.tsx # Infrastructure Asset & Service Deficit Explorer
│   │   ├── InvestmentIntelligence.tsx # Public Capex & Scheme Alignment Explorer
│   │   ├── PatternIntelligence.tsx# Signal Pattern & Anomaly Detection
│   │   ├── GlobalSearchModal.tsx   # Gemini Search & Function Calling Interface
│   │   ├── GlobalHeader.tsx        # Unified App Header with Search & Language Selector
│   │   ├── Navbar.tsx              # Primary System Navigation Bar
│   │   ├── Sidebar.tsx             # System Navigation Sidebar
│   │   ├── ScoreBreakdownModal.tsx # Priority Score Formula Explanation Modal
│   │   ├── ArchitectureBlueprint.tsx # DPI System Architecture Diagram
│   │   ├── IndiaMapCanvas.tsx      # Custom SVG/Canvas TopoJSON Map Renderer
│   │   ├── AtlasLanding.tsx        # Atlas Landing Portal
│   │   ├── PortalHub.tsx           # Departmental Portal Switcher
│   │   ├── SettingsView.tsx        # Platform Settings & Configuration
│   │   └── ...
│   ├── context/
│   │   └── LanguageContext.tsx     # Global i18n Provider (8 Languages)
│   ├── data/
│   │   ├── districts.ts            # Canonical 52-District Registry Data
│   │   ├── initialRequests.ts      # Prototype Seed Signals
│   │   ├── initialProjects.ts      # Recommended Government Projects Baseline
│   │   ├── governmentBaselineData.ts # Benchmark Infrastructure & Demographic Data
│   │   ├── infrastructureAssets.ts # Facilities & Grid Assets
│   │   ├── investmentData.ts       # Centrally Sponsored Scheme Budgets
│   │   └── publicDataService.ts    # Public Dataset Integration Layer
│   ├── services/
│   │   └── humanSearchService.ts   # Natural Language Search Intent Engine
│   ├── translations/
│   │   └── index.ts                # Translations for 8 Indian Languages
│   └── utils/
│       ├── scoring.ts              # Deterministic Priority Scoring Engine
│       ├── demandAggregation.ts    # Signal Aggregation & Problem Clustering
│       ├── evidenceBundleService.ts # Traceable EvidenceBundle Generator
│       ├── impactEvidence.ts       # Impact Verification Helpers
│       ├── districtMatcher.ts      # Location & Text Extraction Matcher
│       └── geography.ts            # Coordinates & Map Utilities
```

---

## 📡 Backend API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health check and total persisted requests count. |
| `GET` | `/api/citizen-requests` | Retrieves all live user-submitted citizen requests. |
| `POST` | `/api/citizen-requests` | Persists a new citizen request object to local JSON store. |
| `POST` | `/api/process-feedback` | Multimodal (audio/text) diagnostic extraction using Gemini. |
| `POST` | `/api/conversational-followup` | Multilingual conversational assistant follow-up. |
| `POST` | `/api/generate-policy-brief` | Generates structured policy brief in target language. |
| `POST` | `/api/search/intent` | Parses query intent and maps to Gemini function calls. |
| `POST` | `/api/search/summary` | Synthesizes grounded policymaker summary of search results. |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20 or higher (v22 recommended)
- **npm**: v9 or higher

### Environment Setup
Create a `.env` file in the root directory (or declare in `.env.example`):

```env
# Server-side Gemini API Key (Required for AI features)
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

### Installation

```bash
# Install dependencies
npm install
```

### Development Server
Runs Express + Vite dev server on `http://localhost:3000`:

```bash
npm run dev
```

### Type Checking & Linting

```bash
npm run lint
```

### Production Build & Execution

```bash
# 1. Compile Vite bundle and esbuild server.ts into dist/server.cjs
npm run build

# 2. Launch production server
npm run start
```

---

## 🔒 Terminology Compliance Guidelines

When describing or presenting CivicPulse, adhere strictly to these canonical terminology standards:

- **Synthetic demonstration signals**: Synthetic baseline seed data generated for initial system demonstration.
- **Actual user-submitted CivicPulse signals**: Live requests submitted by users through the voice/text interface.
- **Government public-data benchmark**: Verified public datasets (Census, Jal Jeevan Mission, NHM, PMGSY).
- **Deterministic priority score**: Transparent 0–100 score calculated by the scoring formula.
- **Traceable EvidenceBundle**: Unbroken data lineage linking citizen signals to recommended outlays.

---

## 📄 License & Attribution

Developed as a Digital Public Infrastructure (DPI) solution for National Development Intelligence. Built with Google Gemini API, React, Express, and Tailwind CSS.
