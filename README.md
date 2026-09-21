# CivicPulse (CivicPulse India DPI)
> **AI-Powered National Development Intelligence & Digital Public Infrastructure Platform**

[![Runtime](https://img.shields.io/badge/Runtime-Node.js%20v22-green.svg)](https://nodejs.org/)
[![Framework](https://img.shields.io/badge/Framework-React%2019%20%2B%20Express-blue.svg)](https://react.dev/)
[![Build System](https://img.shields.io/badge/Build-Vite%20%2B%20esbuild-orange.svg)](https://vitejs.dev/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38bdf8.svg)](https://tailwindcss.com/)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Google%20Gemini%203.6%2F3.8%20Flash-8e44ad.svg)](https://ai.google.dev/)
[![Districts](https://img.shields.io/badge/Registry-52%20Districts%20%7C%2018%20States-red.svg)](#-canonical-data-registry)

---

## 🏛️ Primary Purpose & Product North Star

**CivicPulse** aggregates citizen development requests via voice, text, and messaging apps across diverse linguistic regions of India. The system analyzes large datasets combining citizen feedback with national demographic data, infrastructure indices, and public investment plans, surfacing demand hotspots and recommending high-priority development projects to national policymakers.

---

## 🎯 Problem & Solution

### The Problem
Regional infrastructure planning across diverse, multilingual nations like India faces significant structural challenges:
1. **Linguistic & Communication Barriers**: Citizen grievances submitted in regional dialects or unstructured voice formats are frequently lost or mishandled.
2. **Fragmented Single-Issue Ticketing**: Traditional grievance portals act as static ticketing queues rather than aggregating individual reports into community problem clusters.
3. **Opaque & Subjective Resource Allocation**: Infrastructure investments often lack transparent, auditable prioritization formulas linking capital outlays directly to localized access deficits and citizen demand.

### The Solution
CivicPulse serves as a Digital Public Infrastructure (DPI) decision-support platform that:
- **Understands**: Transcribes, translates, and structures multimodal voice and text inputs across 8 Indian languages using Google Gemini AI.
- **Aggregates**: Group individual reports into micro-locality problem clusters and geospatial demand hotspots.
- **Scores**: Evaluates development priority using a transparent, deterministic 5-pillar mathematical formula.
- **Recommends**: Generates actionable infrastructure project briefs backed by an auditable, unbroken data lineage chain (`EvidenceBundle`).

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

## 📊 Priority Scoring Model

CivicPulse uses a deterministic, transparent 5-pillar mathematical scoring engine (`src/utils/scoring.ts`) to compute a 0–100 **Priority Score** for any district and infrastructure category. This ensures complete auditability, eliminates subjective bias, and decouples AI language processing from fiscal decision logic.

### Standardized 5-Pillar Formula

$$\text{Priority Score} = (\text{Citizen Demand} \times 0.30) + (\text{Infrastructure Gap} \times 0.25) + (\text{Population Impact} \times 0.20) + (\text{Urgency} \times 0.15) + (\text{Government Priority} \times 0.10)$$

### Formula Component Breakdown

| Pillar Factor | Weight | Math Calculation / Logic | Description |
| :--- | :---: | :--- | :--- |
| **Citizen Demand** | **30%** (`0.30`) | $\min(22 \cdot \ln(1 + \text{DemandCount}), 100)$ | Logarithmic volume scaling of validated citizen voice and text signals. |
| **Infrastructure Gap** | **25%** (`0.25`) | $100 - \text{Access Coverage \%}$ | Direct measure of physical infrastructure deficit in the sector. |
| **Population Impact** | **20%** (`0.20`) | $\min\left(\frac{\text{Population}}{2,500,000} \cdot 50 + \text{PovertyIndex} \cdot 50, 100\right)$ | Combined metric of target beneficiary population and poverty index. |
| **Urgency** | **15%** (`0.15`) | $\text{Clamped Severity (1–10)} \cdot 10$ | Extracted hazard severity and hazard urgency rating from citizen reports. |
| **Government Priority** | **10%** (`0.10`) | $95 \text{ pts (Active Capex)} \text{ vs } 45 \text{ pts (No Capex)}$ | Alignment proxy measuring existing planned public capital expenditure. |

---

## ⚙️ Current Prototype Capabilities

The current version of CivicPulse is a fully working, demonstrable prototype equipped with the following functional features:

- **Multilingual Diagnostic Ingestion**:
  - Full UI localization and diagnostic NLP processing across **8 Indian languages**: English (`en`), Hindi (`hi`), Telugu (`te`), Tamil (`ta`), Kannada (`kn`), Marathi (`mr`), Bengali (`bn`), and Odia (`or`).
  - Base64 multimodal audio recording & processing powered by Google GenAI SDK (`gemini-2.5-flash`).
  - Automatic extraction of sector category, subcategory, duration, location, severity (1–10), and target population.
- **Conversational Follow-Up Assistant**:
  - Interactive AI follow-up engine helping citizens complete vague complaints in their native language with suggested option pills.
- **Real-Time Prototype Persistence & Signal Aggregation**:
  - In-memory and local file persistence (`civicpulse_citizen_requests.json`) that saves new submissions and updates live demand counters.
- **Geospatial Demand Hotspot Explorer**:
  - Vector TopoJSON India map paired with an interactive Leaflet district layer highlighting high-priority demand clusters across 52 canonical districts.
- **Government Priority Register / Decision Queue**:
  - Public-sector decision support dashboard displaying ranked development priorities with responsive column grid layout.
- **AI Executive Policy Brief Generator**:
  - Automated generation of structured executive policy memos in the target regional language, complete with diagnostics, scheme alignment, 3-phase action plans, and expected ROI.
- **Natural Language Search & Gemini Tool Calling**:
  - Natural-language query parser mapped to structured function calls (`get_request_by_id`, `search_citizen_reports`, `search_community_issues`, `search_hotspots`, `search_recommendations`).
- **Closed-Loop Impact Simulator**:
  - Outcome evaluation module measuring pre-delivery demand signals against post-delivery complaint reduction.

---

## 💾 Prototype Persistence

CivicPulse currently uses local JSON file storage (`civicpulse_citizen_requests.json`) for prototype persistence of user-submitted citizen requests. This keeps the demonstration lightweight, highly responsive, and self-contained.

> **Production Note**: For production deployment, this local file storage layer would be replaced by a scalable relational/document database (e.g., PostgreSQL / Cloud SQL / Firestore) and an event streaming architecture (e.g., Apache Kafka / Pub/Sub) capable of managing concurrent national workloads.

---

## 🌐 Data Sources & Prototype Limitations

To deliver an immediate, realistic, and evaluation-ready experience:

> **Notice**: CivicPulse currently combines actual user-submitted prototype requests with curated benchmark data and synthetic demonstration signals. It is not connected to a production government database or live government data infrastructure.

- **Curated Benchmark Data**: Baseline statistics for 52 representative districts derived from public data sources (Census of India, Jal Jeevan Mission, National Health Mission, Pradhan Mantri Gram Sadak Yojana).
- **Prototype Persistence**: Live user submissions via the web interface are saved to the prototype store (`civicpulse_citizen_requests.json`).
- **Synthetic Signals**: Initial baseline request sets are seeded to demonstrate multi-sector hotspot clustering across regions before user submissions occur.

---

## 🔮 Future Production Architecture

When scaling CivicPulse from a functional prototype to a national production Digital Public Infrastructure (DPI) deployment, the system architecture would expand to include:

1. **Authenticated Government Data Connectors**:
   - Live integration with e-Governance portals, Centrally Sponsored Scheme dashboards (JJM, PMGSY, NHM), and municipal GIS databases.
2. **Enterprise Cloud Persistence & Event Pipelines**:
   - Cloud SQL / PostgreSQL cluster with Redis caching and distributed pub/sub event brokers for real-time signal processing.
3. **Verified Citizen Identity & Channels**:
   - Integration with WhatsApp Business API, IVR voice response gateways, SMS gateways, and Aadhaar-based/ABHA identity verification where appropriate.
4. **Role-Based Access Control (RBAC) & Security**:
   - Multi-tenant departmental access control for District Collectors, State Secretaries, and Central Ministry Directors.
5. **National Monitoring & SLA Automation**:
   - Automated routing of approved projects to departmental execution software with automatic SLA tracking and breach alerts.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript | High-performance component architecture. |
| **Build Tool & Bundler** | Vite 6 + esbuild | Fast development HMR and production CommonJS bundling. |
| **Styling** | Tailwind CSS v4 + Motion | Modern utility-first styling and smooth UI animations. |
| **Geospatial & Viz** | Leaflet, TopoJSON, D3, Recharts | District map rendering, vector topology, and analytics. |
| **Backend Server** | Express v4 on Node.js v22 | Lightweight REST API server with custom route handlers. |
| **AI SDK & Models** | Google GenAI SDK (`@google/genai`) | Utilizing `gemini-3.6-flash` and `gemini-3.8-flash`. |
| **Prototype Storage** | Local JSON File System | Thread-safe local file storage (`civicpulse_citizen_requests.json`). |
| **i18n & Localization** | Custom React i18n Context | Full support for 8 Indian regional languages. |

---

## 📁 Directory & Codebase Architecture

```
civicpulse/
├── server.ts                       # Express backend server with Gemini AI API & persistence
├── metadata.json                   # AI Studio applet capabilities and metadata
├── package.json                    # Project configuration and dependencies
├── vite.config.ts                  # Vite configuration with Tailwind plugin
├── tsconfig.json                   # TypeScript compiler configuration
├── civicpulse_citizen_requests.json # Local JSON storage for prototype citizen requests
├── src/
│   ├── main.tsx                    # React application entry point
│   ├── App.tsx                     # Main layout, view routing, and global state engine
│   ├── index.css                   # Global styles & Tailwind CSS imports
│   ├── types.ts                    # Canonical TypeScript interfaces (District, CitizenRequest, etc.)
│   ├── components/
│   │   ├── Overview.tsx            # Executive Dashboard & Top Recommendation Panel
│   │   ├── HotspotMap.tsx          # Geospatial Demand Hotspot Map (Leaflet + TopoJSON)
│   │   ├── CitizenIngestion.tsx    # Multilingual Voice/Text Ingestion Modal
│   │   ├── CitizenSubmissionView.tsx # Dedicated Citizen Submission Portal
│   │   ├── CitizenSignalsView.tsx  # Granular Citizen Signals Registry & Search
│   │   ├── CommunityIssuesView.tsx # Aggregated Problem Clusters View
│   │   ├── ProjectsView.tsx        # Government Priority Register / Decision Queue
│   │   ├── PriorityEngine.tsx      # Deterministic Priority Scoring Formula Inspector
│   │   ├── PolicyLab.tsx           # Policy Brief Generator & AI Executive Briefing
│   │   ├── GovernmentBriefing.tsx  # Executive Briefing Dossier
│   │   ├── ImpactSimulator.tsx     # Closed-Loop Impact Simulator & Outcome Metrics
│   │   ├── DemographicsView.tsx    # Demographics & Vulnerability Index Explorer
│   │   ├── InfrastructureView.tsx # Infrastructure Deficit & Asset Explorer
│   │   ├── InvestmentIntelligence.tsx # Public Capex & Scheme Alignment Explorer
│   │   ├── PatternIntelligence.tsx# Signal Pattern & Anomaly Detection
│   │   ├── GlobalSearchModal.tsx   # Gemini Search & Function Calling Interface
│   │   ├── GlobalHeader.tsx        # App Header with Search & Language Selector
│   │   ├── ScoreBreakdownModal.tsx # Priority Score 5-Pillar Formula Modal
│   │   ├── ArchitectureBlueprint.tsx # DPI System Architecture Diagram
│   │   ├── IndiaMapCanvas.tsx      # Custom TopoJSON Map Renderer
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
│       ├── scoring.ts              # Deterministic 5-Pillar Priority Scoring Engine
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
| `GET` | `/api/citizen-requests` | Retrieves all live user-submitted citizen requests from local JSON storage. |
| `POST` | `/api/citizen-requests` | Persists a new citizen request object to `civicpulse_citizen_requests.json`. |
| `POST` | `/api/process-feedback` | Multimodal (audio/text) diagnostic extraction using Gemini API. |
| `POST` | `/api/conversational-followup` | Multilingual conversational assistant follow-up handler. |
| `POST` | `/api/generate-policy-brief` | Generates structured policy brief in target language via Gemini. |
| `POST` | `/api/search/intent` | Parses natural language query intent and maps to Gemini tool declarations. |
| `POST` | `/api/search/summary` | Synthesizes grounded policymaker summary of search results. |

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js**: v20 or higher (v22 recommended)
- **npm**: v9 or higher

### Environment Setup
Create a `.env` file in the project root directory:

```env
# Server-side Gemini API Key (Required for AI processing features)
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

### Installation Commands

```bash
# 1. Install dependencies
npm install

# 2. Run local development server (Express + Vite on http://localhost:3000)
npm run dev

# 3. Type check & lint
npm run lint

# 4. Build for production (Vite client + esbuild CommonJS server)
npm run build

# 5. Start production server
npm run start
```

---

## 📄 License & Attribution

Developed as a Digital Public Infrastructure (DPI) prototype for National Development Intelligence. Powered by Google Gemini API, React 19, Express, and Tailwind CSS.
