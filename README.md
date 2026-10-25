# CivicPulse (CivicPulse India DPI)
> **AI-Powered National Development Intelligence & Digital Public Infrastructure Platform**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20Production-success.svg?style=flat&logo=vercel)](https://civic-pulse-zeta-seven.vercel.app/)
[![Runtime](https://img.shields.io/badge/Runtime-Node.js%20v22-green.svg)](https://nodejs.org/)
[![Framework](https://img.shields.io/badge/Framework-React%2019%20%2B%20Express-blue.svg)](https://react.dev/)
[![Build System](https://img.shields.io/badge/Build-Vite%20%2B%20esbuild-orange.svg)](https://vitejs.dev/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38bdf8.svg)](https://tailwindcss.com/)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Google%20Gemini%202.5%20Flash-8e44ad.svg)](https://ai.google.dev/)

> 🌐 **Canonical Live Deployed Application**: https://civic-pulse-zeta-seven.vercel.app/

---

## 🏛️ Primary Purpose & Product North Star

**CivicPulse** aggregates citizen development requests via voice, text, and messaging apps across diverse linguistic regions of India. The system analyzes large datasets combining citizen feedback with national demographic data, infrastructure indices, and public investment plans, surfacing demand hotspots and recommending high-priority development projects to national policymakers.

---

## 🚀 Recent Updates & Enhancements
- **Precision Geospatial Map Navigation & Coordinate Resolution**: After successful citizen complaint submission, the app automatically and smoothly navigates and zooms to the correct district and state without displaying "coordinates unavailable". Uses authoritative state + district composite matching against the master 70-district registry.
- **Complete Infrastructure Category Support**: Server-side payload validation (`requestValidator.ts`) updated to support all 14 official categories (`Water`, `Roads`, `Health`, `Healthcare`, `Electricity`, `Education`, `Drainage`, `Sanitation`, `Fire`, `Environment`, `Transport`, `Parks`, `Government`, `Other`).
- **Multilingual Diagnostic Engine**: Full support for 8 Indian languages (English, Hindi, Telugu, Tamil, Kannada, Marathi, Bengali, Odia) powered by Google Gemini AI.
- **Deterministic 5-Pillar Priority Scoring & Closed-Loop Impact Model**: Transparent mathematical weighting combining demand, infrastructure gap, population vulnerability, urgency, and capex alignment.

---

## 🎯 Core Decision Pipeline
1. **Citizen Input**: Multilingual voice, text, and photo submissions across 8 regional Indian languages.
2. **Multilingual Understanding**: Preserves original language and extracts structured representation (category, issue, location, language, severity, urgency).
3. **Aggregation of Citizen Requests**: Translates individual signals into community problem clusters.
4. **Demand Hotspots**: Geospatial concentrations across State → District → City → Locality.
5. **Public Data Integration**: Combines citizen signals with demographics, infrastructure baselines, and vulnerability indices.
6. **Development Need Measurement**: Deterministic, explainable scoring calculating where need is greatest.
7. **Government Investment Alignment**: Evaluates alignment with Centrally Sponsored Schemes.
8. **Actionable Recommendations**: High-priority development project briefs with full data lineage.
9. **Action Queue**: Tracking execution lifecycle across administrative departments.
10. **Impact Measurement**: Verifying real-world signal reduction and infrastructure improvements following project delivery.

---

## 📜 Full Data Lineage Mandate
Every recommendation is traceable:
`Recommendation → Priority Score → Evidence → Public Investment → Infrastructure → Population/Vulnerability → Location → Community Issue → Citizen Signals`

---

## 📊 Priority Scoring Model
CivicPulse uses a deterministic 5-pillar weighting model (`src/utils/scoring.ts`):
- **Citizen Demand (30%)**: Logarithmic volume transformation of submitted signals.
- **Infrastructure Gap (25%)**: Direct physical access deficit (`100 - Access Coverage %`).
- **Population Impact (20%)**: Beneficiary scale and multidimensional poverty weighting.
- **Urgency (15%)**: Extracted hazard severity (1–10).
- **Government Priority (10%)**: Planned capex allocation presence.

---

## 🛠️ Technology Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Leaflet, TopoJSON, Recharts.
- **Backend**: Express v4 on Node.js v22 with structured middleware (rate limiter, request ID tracking, centralized error handling).
- **AI Integration**: Google GenAI SDK (`@google/genai`) using `gemini-2.5-flash` with timeout, retry, and truthful fallback.
- **Persistence**: Repository pattern supporting JSON file storage (`civicpulse_citizen_requests.json`) and PostgreSQL.

---

## 📡 Backend API Endpoints Reference
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health, repository status, and cache telemetry. |
| `GET` | `/api/citizen-requests` | Retrieve authenticated citizen's saved requests. |
| `POST` | `/api/citizen-requests` | Submit a new verified citizen request. |
| `DELETE` | `/api/citizen-requests/:id` | Delete an owned citizen request. |
| `POST` | `/api/process-feedback` | Multimodal (audio/text) diagnostic extraction via Gemini. |
| `POST` | `/api/conversational-followup` | Multilingual conversational assistant follow-up. |
| `POST` | `/api/generate-policy-brief` | Structured executive policy memo generation. |
| `POST` | `/api/search/intent` | Natural language intent parsing and tool calling. |
| `POST` | `/api/search/summary` | Grounded policymaker summary synthesis. |

---

## 🚀 Setup & Commands
```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Run code linter
npm run lint

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```
