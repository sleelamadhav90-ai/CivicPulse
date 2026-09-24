# CivicPulse (CivicPulse India DPI)
> **AI-Powered National Development Intelligence & Digital Public Infrastructure Platform**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20Production-success.svg?style=flat&logo=vercel)](https://civic-pulse-5mmcf0dbm-slm15.vercel.app/)
[![Runtime](https://img.shields.io/badge/Runtime-Node.js%20v22-green.svg)](https://nodejs.org/)
[![Framework](https://img.shields.io/badge/Framework-React%2019%20%2B%20Express-blue.svg)](https://react.dev/)
[![Build System](https://img.shields.io/badge/Build-Vite%20%2B%20esbuild-orange.svg)](https://vitejs.dev/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38bdf8.svg)](https://tailwindcss.com/)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Google%20Gemini%202.5%20Flash-8e44ad.svg)](https://ai.google.dev/)
[![Districts](https://img.shields.io/badge/Registry-70%20Districts%20%7C%2036%20States%20%26%20UTs-blue.svg)](#-canonical-data-registry)

> 🌐 **Live Deployed Application**: [https://civic-pulse-5mmcf0dbm-slm15.vercel.app/](https://civic-pulse-5mmcf0dbm-slm15.vercel.app/)

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
│ 3. Signal Validation & Normalization Layer (Deterministic Input Verification)    │
└─────────────────────────┬────────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 4. Signal Aggregation & Community Issue Clustering                               │
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

CivicPulse uses an **explainable deterministic prototype prioritization model** (`src/utils/scoring.ts`) to compute a 0–100 **Priority Score** for any district and infrastructure category. The model is transparent by design and intentionally exposes its parameters and assumptions. This ensures complete auditability, makes modeling assumptions explicit and auditable (without eliminating human or institutional modeling assumptions), and decouples AI language processing from fiscal decision logic.

### Standardized 5-Pillar Formula

$$\text{Priority Score} = (\text{Citizen Demand} \times 0.30) + (\text{Infrastructure Gap} \times 0.25) + (\text{Population Impact} \times 0.20) + (\text{Urgency} \times 0.15) + (\text{Government Priority} \times 0.10)$$

### Centralized Parameter Store (`SCORING_CONFIG`) & Pillar Formula Breakdown

All model parameters, weights, and normalization bounds are centralized in `SCORING_CONFIG` in `src/utils/scoring.ts`:

| Pillar Factor | Weight | Formula / Normalization Logic | Model Assumption & Technical Rationale |
| :--- | :---: | :--- | :--- |
| **Citizen Demand** | **30%** (`0.30`) | $\min(22 \cdot \ln(1 + \text{DemandCount}), 100)$ | Logarithmic volume transformation reduces the dominance of sudden signal surges. |
| **Infrastructure Gap** | **25%** (`0.25`) | $100 - \text{Access Coverage \%}$ | Direct measure of physical access deficit derived from public indicators or baseline heuristics. |
| **Population Impact** | **20%** (`0.20`) | $\min\left(\frac{\text{Population}}{2.5\text{M}} \cdot 50 + \text{PovertyIndex} \cdot 50, 100\right)$ | Scales beneficiary count relative to a 2.5M population benchmark district plus Multidimensional Poverty Index weighting. |
| **Urgency** | **15%** (`0.15`) | $\text{Clamped Severity (1–10)} \cdot 10$ | Extracted hazard severity bounded between 1–10 to prevent extreme values from dominating. |
| **Government Priority** | **10%** (`0.10`) | $95 \text{ pts (Planned Capex)} \text{ vs } 45 \text{ pts (Unbudgeted Gap)}$ | Proxy signal indicating presence of existing planned capital expenditure allocations rather than political ranking. |

### Model Transparency & Calibration Methodology

- **Configurable Parameters**: All weights, logarithmic coefficients, and benchmark bounds are defined in a single centralized parameter object (`SCORING_CONFIG`), enabling straightforward tuning without codebase modification.
- **Derived Benchmarks & Prototype Heuristics**: Sector indicators without direct census coverage (e.g., electricity grid stability baseline at 58%, sanitation derived via a 0.75 multiplier on water and road averages) utilize explicit benchmark assumptions clearly identified in data lineage metadata.
- **Score Trace & Sensitivity Analysis**: Every score calculation generates an audit trace (`ScoreTrace`) and relative influence breakdown (`calculateScoreSensitivity`) identifying the dominant score-driving factor.
- **Future Calibration Requirements**: The current prototype parameters represent logical decision-support heuristics designed for transparent demonstration. Production deployment would require domain validation, historical backtesting against past project outcomes, and stakeholder calibration.

---

## 🔁 Closed-Loop Impact Evaluation Model

CivicPulse implements a **deterministic, closed-loop impact evaluation engine** (`src/utils/impactModel.ts`) that links citizen grievances, public capital expenditure, and post-delivery outcome verification.

> ⚠️ **Important Evaluation Notice**: Modeled impact values are calculated prototype projections based on explicit assumptions and do not represent observed government outcomes or verified real-world results. Production validation requires post-intervention physical and grievance telemetry measurement.

### The 8-Stage Closed-Loop Architecture

The platform models public works through an end-to-end decision and verification lifecycle:

$$\begin{aligned}
\text{1. Citizen Signals} &\longrightarrow \text{2. Baseline Measurement} \longrightarrow \text{3. Priority Scoring} \longrightarrow \text{4. Recommended Intervention} \\
&\longrightarrow \text{5. Modeled Impact Projection} \longrightarrow \text{6. Real-World Implementation} \longrightarrow \text{7. Post-Intervention Measurement} \longrightarrow \text{8. Actual Evaluation}
\end{aligned}$$

| Stage | Purpose | Data Nature / Provenance |
| :--- | :--- | :--- |
| **1. Citizen Signals** | Ingestion of raw multilingual citizen distress reports. | Observed / Prototype Ingestion |
| **2. Baseline Measurement** | Grounding against district demographics and access deficits. | Grounded Public Datasets (JJM, PMGSY, NHM) |
| **3. Priority Scoring** | Deterministic 5-pillar prioritization index (0–100). | Deterministic Algorithm |
| **4. Recommended Intervention** | Alignment with Centrally Sponsored Schemes (JJM, PMGSY, SBM). | Scheme Alignment Blueprint |
| **5. Modeled Impact Projection** | What-if simulation using explicit elasticity assumptions. | **Modeled Impact — Not Observed Outcome** |
| **6. Real-World Implementation** | Tracking administrative handoff and departmental execution. | Action Queue Lifecycle |
| **7. Post-Intervention Measurement** | Verification protocol using field sensors & third-party audits. | **Proposed Measurement Plan** |
| **8. Actual Evaluation** | Comparison of baseline vs. observed post-delivery telemetry. | Observed Evaluation (Future) |

### Deterministic Modeling Parameters (`IMPACT_MODEL_CONFIG`)

The impact engine calculates projected changes using explicit, transparent elasticity formulas:

- **Intervention Gain Factors**:
  - `FIX` (Targeted Remediation): `25%` baseline gap reduction factor.
  - `UPGRADE` (Capacity Augmentation): `40%` baseline gap reduction factor.
  - `BUILD` (Capital Commissioning): `65%` baseline gap reduction factor.
  - `POLICY` (Operational Reform): `20%` baseline gap reduction factor.
- **Intensity Multipliers**: Low (`0.8x`), Medium (`1.0x`), High (`1.25x`).
- **Elasticity Bounds**: Effective gap reduction is capped at `85%` to prevent unrealistic 100% resolution claims.
- **Demand Response Elasticity**: Grievance reduction tracks infrastructure access gains with a configurable demand elasticity factor (`0.90x`).

### Side-by-Side Comparison Framework

Every scenario in the **What-If Simulator** (`src/components/ImpactSimulator.tsx`) and **Evidence Explanation Card** (`src/components/EvidenceExplanationCard.tsx`) clearly delineates:

1. **Baseline (Observed / Grounded)**: Current infrastructure access, grievance signal volume, priority score, and affected population.
2. **Modeled Projection (Prototype Model)**: Projected coverage gain, estimated complaint reduction, and priority score de-escalation.
3. **Modeled Delta (Calculated Variance)**: Exact projected percentage and absolute changes.

### Proposed Post-Intervention Measurement Plan

To transition from prototype modeling to production evaluation, CivicPulse establishes a standardized **5-dimension measurement plan** required for real-world verification:

1. **Infrastructure Access Rate**: Third-party physical sample survey & municipal telemetry (Quarterly audit by State Evaluation Authority).
2. **Grievance Signal Volume**: Ingested citizen reports via WhatsApp, IVR, and Web over a 12–24 month post-commissioning horizon.
3. **Mean Time to Resolution (MTTR)**: Municipal departmental SLA tracking across administrative tiers.
4. **Service Continuity & Uptime**: IoT pressure sensors, grid stability monitors, and water quality telemetry.
5. **Vulnerable Population Protection**: Targeted saturation survey in low-income and minority habitations.

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
  - Vector TopoJSON India map paired with an interactive Leaflet district layer highlighting high-priority demand clusters across 70 registered districts covering all 36 Indian States & Union Territories.
- **Government Priority Register / Decision Queue**:
  - Public-sector decision support dashboard displaying ranked development priorities with responsive column grid layout.
- **AI Executive Policy Brief Generator**:
  - Automated generation of structured executive policy memos in the target regional language, complete with diagnostics, scheme alignment, 3-phase action plans, and expected ROI.
- **Natural Language Search & Gemini Tool Calling**:
  - Natural-language query parser mapped to structured function calls (`get_request_by_id`, `search_citizen_reports`, `search_community_issues`, `search_hotspots`, `search_recommendations`).
- **Closed-Loop Impact Simulator**:
  - Outcome evaluation module measuring pre-delivery demand signals against post-delivery complaint reduction.

---

## 🏗️ Production Scalability Architecture (Proposed)

CivicPulse is engineered with **clean architectural boundaries** that separate domain intelligence, deterministic scoring, and multimodal AI diagnostics from physical storage and deployment topology.

> ℹ️ **Architecture Notice**: The current demonstration runs as a self-contained prototype using **`JsonCitizenRequestRepository`** (`civicpulse_citizen_requests.json`), bounded in-memory LRU/TTL caching, and application-level sliding-window rate limiting. The design below illustrates the verified production evolution path required for national-scale Digital Public Infrastructure (DPI).

### Scalability Data Flow Diagram (Proposed)

```mermaid
flowchart TD
    subgraph Ingestion["1. Multimodal Citizen Ingestion Tier"]
        C1[WhatsApp Business API] --> GW[API Gateway / Cloud Armor]
        C2[IVR Telephony Audio Stream] --> GW
        C3[Web Portal & Mobile PWA] --> GW
        GW --> RL[Distributed Rate Limiter & WAF]
    end

    subgraph ApiTier["2. Horizontally Scaled API Tier"]
        RL --> APINodes[Node.js API Cluster Instances]
        APINodes --> V[Input Validation Boundary]
        V --> RID[Request ID & Trace Context]
    end

    subgraph EventStream["3. Asynchronous Event Pipeline"]
        APINodes -.->|High-volume async events| PubSub[(Google Cloud Pub/Sub / Kafka)]
        PubSub --> W1[Worker: Multimodal Audio Transcription]
        PubSub --> W2[Worker: NLP Structuring & Translation]
        PubSub --> W3[Worker: Geospatial Demand Clustering]
    end

    subgraph PersistenceTier["4. Persistence & Storage Abstraction"]
        APINodes --> Repo[CitizenRequestRepository Interface]
        Repo -->|Prototype Mode| JSONRepo[JsonCitizenRequestRepository]
        JSONRepo --> JSONFile[(civicpulse_citizen_requests.json)]
        Repo -->|Production Mode| PGRepo[PostgresCitizenRequestRepository]
        PGRepo --> CloudSQL[(Managed PostgreSQL + PostGIS)]
        W1 --> GCS[(Cloud Storage: Audio & Evidence Dossiers)]
    end

    subgraph CachingTier["5. Caching & Acceleration"]
        APINodes <--> Cache[Cache Abstraction Layer]
        Cache -->|Prototype| MemCache[Bounded MemoryCache LRU/TTL]
        Cache -->|Production| Redis[(Managed Redis / Memorystore)]
    end

    subgraph DecisionEngine["6. Core Deterministic Decision Pipeline"]
        CloudSQL --> HotspotEngine[Geospatial Hotspot Aggregation]
        HotspotEngine --> ScoringEngine[Deterministic 5-Pillar Priority Engine]
        ScoringEngine --> ImpactEngine[Closed-Loop Impact Model]
        ImpactEngine --> Policymakers[National Decision Dashboard & Policy Briefs]
    end
```

### Prototype vs. Production Architecture Comparison

| Architectural Dimension | Current Prototype Implementation (Verified) | Proposed National Production Path |
| :--- | :--- | :--- |
| **Persistence Layer** | `JsonCitizenRequestRepository` implementing full CRUD lifecycle (`create`, `getById`, `delete`, `list`, `getStatistics`, `checkHealth`) reading/writing to `civicpulse_citizen_requests.json` via atomic temporary-file swaps. | `PostgresCitizenRequestRepository` connecting to managed PostgreSQL (Cloud SQL) with PostGIS geospatial indexes and connection pooling. |
| **API Boundary & Lifecycle** | Single Express/Node.js instance binding on `0.0.0.0:3000` with graceful `SIGTERM`/`SIGINT` teardown and connection draining. | Horizontally scaled container instances behind Google Cloud Load Balancer / Envoy with autoscaling (HPA). |
| **Input Validation** | Centralized `requestValidator.ts` enforcing enum schemas, text limits, coordinate ranges (-90..90, -180..180), and numeric bounds. | Gateway-level OpenAPI/JSON schema validation plus defense-in-depth domain validation in API services. |
| **Error Handling & Traceability** | Centralized `errorHandler.ts` returning normalized JSON errors and redacting API keys, secrets, and internal paths; `requestId.ts` ensuring unique `X-Request-Id` and `X-Response-Time` headers. | Distributed OpenTelemetry tracing (Cloud Trace) with end-to-end trace propagation and structured JSON log sinks. |
| **Rate Limiting & Abuse** | Sliding-window in-memory rate limiter (`generalApiLimiter`: 120 req/min, `expensiveAiLimiter`: 30 req/min) with standard (`RateLimit-*`) and legacy (`X-RateLimit-*`) headers, toggleable via `RATE_LIMIT_ENABLED` (default: `false`). | Distributed token-bucket rate limiting at API Gateway / Cloud Armor to protect Gemini API quotas and withstand DDoS attacks. |
| **AI Processing & Resilience** | Synchronous Gemini 2.5 Flash inference with exponential backoff, retry logic, timeout guards (`callGeminiWithTimeoutAndRetry`), and truthful deterministic fallbacks. | Asynchronous Celery / PubSub worker queues for batch processing of high-volume voice/IVR streams. |
| **Caching System** | 5 active bounded LRU & TTL `MemoryCache` instances for policy briefs (1 hr), feedback diagnostics (30 min), search intents (15 min), search summaries (30 min), and conversational follow-ups (30 min) with telemetry exposed via `/api/health`. | Clustered Redis (Google Cloud Memorystore) with distributed key invalidation and read replicas. |
| **Audio & File Evidence** | In-memory base64 payloads with 25MB Express limit for immediate interactive multimodal diagnostics. | Cloud Storage (GCS / S3) signed URLs with dedicated media compression and retention lifecycle policies. |
| **Geospatial & Hotspot Analytics** | In-memory client/server geospatial aggregation across 70 registered districts covering all 36 States & UTs with TopoJSON topology. | PostGIS spatial queries (`ST_DWithin`, spatial clustering) and pre-aggregated materialized views for sub-second macro analytics. |

---

CivicPulse is a decision-support Digital Public Infrastructure (DPI) prototype. To maintain complete transparency regarding data provenance and depth across its expanded national scope:
- **100% Geographic Representation (36 States & UTs)**: Every state (28) and Union Territory (8) in India is represented in the source-of-truth district registry (`DISTRICTS_REGISTRY`).
- **3-Tier Data Provenance Classification**:
  - **Tier 1: Deep Baseline (5 Districts)**: `vijayawada`, `guntur`, `visakhapatnam`, `kurnool`, `solapur` — Complete multi-sector infrastructure metrics, historical capex allocations, and curated representative citizen signal clusters.
  - **Tier 2: Expanded Baseline (10 Districts)**: `warangal`, `hyderabad`, `nashik`, `patna`, `gaya`, `jaipur`, `bengaluru`, `chennai`, `kolkata`, `lucknow` — Comprehensive baseline public dataset metrics (JJM, PMGSY, NHM) and seeded issue clusters.
  - **Tier 3: Regional Coverage (55 Districts)**: Representative regional districts covering all remaining Indian States and Union Territories with explicit regional provenance metadata.
- **100 Multilingual Citizen Signals**: Seeded multilingual reports across 8 Indian languages (Telugu, Hindi, Tamil, Kannada, Marathi, Bengali, Odia, English).
- **73 Public Open-Data Indicators**: Benchmark infrastructure and demographic metrics compiled from public datasets (Census of India, Jal Jeevan Mission, PMGSY, NHM, data.gov.in).
- **8 Scheme Alignment Blueprints**: Prototype Centrally Sponsored Scheme budget and project templates (JJM, PMGSY, SBM, NHM, RDSS).

> **Production Note**: Production deployment requires authenticated government portal connectors, strict role-based access controls (RBAC), data governance, privacy controls, and enterprise cloud infrastructure.

---

## 🌐 Data Sources & Prototype Limitations

To deliver an immediate, realistic, and evaluation-ready experience:

> **Notice**: CivicPulse currently combines actual user-submitted prototype requests with curated benchmark data and synthetic demonstration signals. It is not connected to a production government database or live government data infrastructure.

- **Curated Benchmark Data**: Baseline statistics for 70 registered districts across all 36 Indian States & UTs derived from public data sources (Census of India, Jal Jeevan Mission, National Health Mission, Pradhan Mantri Gram Sadak Yojana).
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
| **Build Tool & Bundler** | Vite 6 + esbuild | Fast development HMR and production CommonJS server bundling. |
| **Styling** | Tailwind CSS v4 + Motion | Modern utility-first styling and smooth UI animations. |
| **Geospatial & Viz** | Leaflet, TopoJSON, D3, Recharts | District map rendering, vector topology, and analytics. |
| **Backend Server** | Express v4 on Node.js v22 | REST API with repository abstraction, validation, and middleware. |
| **AI SDK & Models** | Google GenAI SDK (`@google/genai`) | Utilizing `gemini-2.5-flash` with timeout, retry, and truthful fallback. |
| **Persistence Engine** | Repository Pattern (`CitizenRequestRepository`) | Default: `JsonCitizenRequestRepository` (`civicpulse_citizen_requests.json`) with atomic temporary file commits; Production path: `PostgresCitizenRequestRepository`. |
| **Caching Engine** | Bounded LRU & TTL `MemoryCache` | 5 active bounded caches with hit/miss/eviction telemetry. |
| **i18n & Localization** | Custom React i18n Context | Full support for 8 Indian regional languages. |

---

## 📁 Directory & Codebase Architecture

```
civicpulse/
├── server.ts                         # Express server: routes, Gemini AI services, graceful shutdown
├── metadata.json                     # AI Studio applet capabilities and frame permissions
├── package.json                      # Project dependencies, scripts (dev, build, start, lint, test)
├── vite.config.ts                    # Vite configuration with Tailwind CSS plugin
├── tsconfig.json                     # TypeScript compiler configuration
├── civicpulse_citizen_requests.json   # Prototype persistence file for citizen submissions
├── src/
│   ├── main.tsx                      # React client entry point
│   ├── App.tsx                       # Main layout, view routing, and global state engine
│   ├── index.css                     # Global styles & Tailwind CSS imports
│   ├── types.ts                      # Canonical TypeScript interfaces (District, CitizenRequest, etc.)
│   ├── components/
│   │   ├── Overview.tsx              # Executive Dashboard & Top Recommendation Panel
│   │   ├── HotspotMap.tsx            # Geospatial Demand Hotspot Map (Leaflet + TopoJSON)
│   │   ├── CitizenIngestion.tsx      # Multilingual Voice/Text Ingestion Modal
│   │   ├── CitizenSubmissionView.tsx # Dedicated Citizen Submission Portal
│   │   ├── CitizenSignalsView.tsx    # Granular Citizen Signals Registry & Search
│   │   ├── CommunityIssuesView.tsx   # Aggregated Problem Clusters View
│   │   ├── ProjectsView.tsx          # Government Priority Register / Decision Queue
│   │   ├── PriorityEngine.tsx        # Deterministic Priority Scoring Formula Inspector
│   │   ├── PolicyLab.tsx             # Policy Brief Generator & AI Executive Briefing
│   │   ├── GovernmentBriefing.tsx    # Executive Briefing Dossier
│   │   ├── ImpactSimulator.tsx       # Closed-Loop Impact Simulator & Outcome Metrics
│   │   ├── DemographicsView.tsx      # Demographics & Vulnerability Index Explorer
│   │   ├── InfrastructureView.tsx   # Infrastructure Deficit & Asset Explorer
│   │   ├── InvestmentIntelligence.tsx # Public Capex & Scheme Alignment Explorer
│   │   ├── PatternIntelligence.tsx  # Signal Pattern & Anomaly Detection
│   │   ├── GlobalSearchModal.tsx     # Gemini Search & Function Calling Interface
│   │   ├── GlobalHeader.tsx          # App Header with Search & Language Selector
│   │   ├── ScoreBreakdownModal.tsx   # Priority Score 5-Pillar Formula Modal
│   │   ├── ArchitectureBlueprint.tsx # DPI System Architecture Diagram
│   │   └── IndiaMapCanvas.tsx        # Custom TopoJSON Map Renderer
│   ├── context/
│   │   └── LanguageContext.tsx       # Global i18n Provider (8 Languages)
│   ├── data/
│   │   ├── districts.ts              # Canonical 70-District Registry Data (36 States & UTs)
│   │   ├── initialRequests.ts        # Prototype Seed Signals
│   │   ├── initialProjects.ts        # Recommended Government Projects Baseline
│   │   ├── governmentBaselineData.ts # Benchmark Infrastructure & Demographic Data
│   │   ├── infrastructureAssets.ts   # Facilities & Grid Assets
│   │   ├── investmentData.ts         # Centrally Sponsored Scheme Budgets
│   │   └── publicDataService.ts      # Public Dataset Integration Layer
│   ├── server/                       # Backend architecture & deployability layer
│   │   ├── config.ts                 # Centralized configuration schema & validation
│   │   ├── cache/
│   │   │   └── memoryCache.ts        # Bounded LRU & TTL cache with telemetry
│   │   ├── middleware/
│   │   │   ├── requestId.ts          # X-Request-Id sanitization & X-Response-Time
│   │   │   ├── rateLimiter.ts        # Sliding-window rate limiter & RFC headers
│   │   │   └── errorHandler.ts       # Structured JSON error handling & secret redaction
│   │   ├── repositories/
│   │   │   ├── CitizenRequestRepository.ts     # Data access interface
│   │   │   ├── JsonCitizenRequestRepository.ts # Active atomic JSON storage
│   │   │   ├── PostgresCitizenRequestRepository.ts # PostgreSQL migration adapter
│   │   │   └── index.ts              # Repository factory
│   │   ├── validation/
│   │   │   └── requestValidator.ts   # Boundary payload schemas & coordinate checks
│   │   └── tests/
│   │       └── scalability.test.ts   # 11 unit tests for deployability & architecture
│   ├── services/
│   │   └── humanSearchService.ts     # Natural Language Search Intent Engine
│   ├── translations/
│   │   └── index.ts                  # Translations for 8 Indian Languages
│   └── utils/
│       ├── scoring.ts                # Deterministic 5-Pillar Priority Scoring Engine
│       ├── scoring.test.ts           # Priority scoring unit tests
│       ├── impactModel.ts            # Deterministic Closed-Loop Impact Model
│       ├── impactModel.test.ts       # Impact model unit tests
│       ├── signalValidator.ts        # Deterministic Signal Validation Engine
│       ├── demandAggregation.ts      # Signal Aggregation & Problem Clustering
│       ├── evidenceBundleService.ts   # Traceable EvidenceBundle Generator
│       ├── impactEvidence.ts         # Impact Verification Helpers
│       ├── impactEvidence.test.ts    # Evidence validation tests
│       ├── districtMatcher.ts        # Location & Text Extraction Matcher
│       ├── geography.ts              # Coordinates & Map Utilities
│       └── geographyCoverage.test.ts # 36 States/UTs coverage tests
```

---

## 📡 Backend API Endpoints Reference

All endpoints return uniform structured JSON responses with `X-Request-Id` and `X-Response-Time` headers:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Comprehensive system health: repository status, persistence type, rate limiting status, memory usage, and telemetry across all 5 bounded caches. |
| `GET` | `/api/citizen-requests` | Retrieves stored citizen requests with pagination (`page`, `limit`) and filtering (`category`, `district`, `state`). |
| `GET` | `/api/citizen-requests/:id` | Retrieves an individual citizen request by its unique ID. Returns HTTP 404 if not found. |
| `POST` | `/api/citizen-requests` | Validates input payload schema and persists a new citizen request via `CitizenRequestRepository`. |
| `DELETE` | `/api/citizen-requests/:id` | Removes an individual citizen request by ID. Returns HTTP 404 if not found. |
| `POST` | `/api/process-feedback` | Multimodal (audio/text) diagnostic extraction using Gemini API with timeout, retry, and truthful fallback. |
| `POST` | `/api/conversational-followup` | Multilingual conversational assistant follow-up with response caching. |
| `POST` | `/api/generate-policy-brief` | Generates structured policy brief in target language via Gemini with 1-hour bounded cache. |
| `POST` | `/api/search/intent` | Parses natural language query intent and maps to Gemini tool declarations with 15-minute cache. |
| `POST` | `/api/search/summary` | Synthesizes grounded policymaker summary of search results with 30-minute cache. |

---

## 🧪 Testing & Verification

The primary automated test suite (`npm test`) executes 11 verification checks for the backend deployability and scalability architecture (`src/server/tests/scalability.test.ts`):

```bash
# Run the 11 Deployability & Scalability Architecture unit tests
npm test
```

### Checks Executed by `npm test`:
1. **Persistence Abstraction**: Repository lifecycle, record creation, retrieval, deletion, and health telemetry.
2. **Pagination & Filtering**: Structured slicing (`page`, `limit`, `category`).
3. **Telemetry & Health Reporting**: System status, uptime, cache metrics, and error rates.
4. **PostgreSQL Migration Adapter**: Interface compliance and graceful fallback handling.
5. **Input Boundary Validation**: Schema enforcement, coordinate ranges (-90..90, -180..180), severity bounds (1..10), and string limits.
6. **Rate Limiter Protection**: Bypass when disabled, threshold enforcement, and HTTP 429 generation when enabled.
7. **Bounded Memory Cache**: LRU eviction order, TTL expiration, capacity bounds, and hit/miss accounting.
8. **Configuration Validation**: Default JSON persistence, optional `DATABASE_URL`, and PostgreSQL enforcement.
9. **Request Traceability**: `X-Request-Id` generation, header sanitization, and `X-Response-Time` timing.
10. **Error Handling & Secret Redaction**: Centralized JSON error format, API key redaction, and internal path stripping.
11. **Rate Limiting Headers**: Standard (`RateLimit-*`) and legacy (`X-RateLimit-*`) compliance.

---

## 🚀 Live Demo

**Live Application:** https://civic-pulse-5mmcf0dbm-slm15.vercel.app/

The live application URL is the main link judges should use to access CivicPulse.

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js**: v20 or higher (v22 recommended)
- **npm**: v9 or higher

### Environment Configuration
Configure environment variables using `.env.example` as a baseline:

```env
# Server-side Gemini API Key (Required for AI processing features)
GEMINI_API_KEY=your_gemini_api_key_here

# App URL (Injected automatically in Cloud Run)
APP_URL=http://localhost:3000

# Persistence Strategy: 'json' (default for prototype) or 'postgres' (for production)
PERSISTENCE_TYPE=json

# Managed PostgreSQL connection string (ONLY required when PERSISTENCE_TYPE=postgres; optional for json)
# DATABASE_URL=postgresql://user:password@host:5432/civicpulse_db

# Operational Rate Limiting: 'false' (default) or 'true'
RATE_LIMIT_ENABLED=false

# Runtime Profile
NODE_ENV=development
```

### Commands

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npm test

# 3. Type check & lint
npm run lint

# 4. Run local development server (Express + Vite on http://localhost:3000)
npm run dev

# 5. Build for production (Vite client + esbuild CommonJS server)
npm run build

# 6. Start production server
npm run start
```

---

## 🔐 Firebase Authentication & Firestore Setup

CivicPulse supports **Account-Authenticated Submissions** via Firebase Authentication (Google Sign-In) and cloud document persistence via Cloud Firestore.

> ⚠️ **Verification Notice**: Firebase Authentication provides verified account ownership to associate grievances with an authenticated user account and mitigate automated spam. It does **NOT** represent government identity verification, residency verification, or an Aadhaar integration.

### Step-by-Step Setup Guide

1. **Create or Select a Firebase Project**:
   - Visit the [Firebase Console](https://console.firebase.google.com/) and create a new project (or select an existing project).

2. **Enable Firebase Authentication**:
   - In the Firebase Console, navigate to **Build** → **Authentication** → **Get Started**.

3. **Enable Google Sign-In Provider**:
   - Under the **Sign-in method** tab, select **Google** from the provider list and enable it.
   - Configure the public-facing project support email and save.

4. **Create Cloud Firestore Database**:
   - Navigate to **Build** → **Firestore Database** → **Create Database**.
   - Select your preferred cloud region (e.g., `asia-south1` or `us-central1`).
   - Start in **production mode** (rules are deployed in Step 6).

5. **Configure Required Environment Variables**:
   - Register a Web App in Firebase Project Settings to obtain client credentials.
   - Set the following variables in `.env` (or your local environment):
     ```env
     # Frontend Client Configuration (Vite)
     VITE_FIREBASE_API_KEY="AIzaSyYourFirebaseWebApiKey"
     VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
     VITE_FIREBASE_PROJECT_ID="your-project-id"
     VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
     VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
     VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef123456"

     # Backend Admin SDK Configuration (Server-Side)
     FIREBASE_PROJECT_ID="your-project-id"
     FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"
     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

     # Set Persistence Mode to Firestore
     PERSISTENCE_TYPE="firestore"
     ```

6. **Configure Firestore Security Rules**:
   - Apply the audited `firestore.rules` included in the root directory:
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /{document=**} {
           allow read, write: if false;
         }
         match /citizenRequests/{requestId} {
           allow get, list: if request.auth != null && resource.data.userId == request.auth.uid;
           allow write: if false; // Authoritative mutations processed exclusively by verified backend API
         }
       }
     }
     ```

7. **Configure Vercel Environment Variables**:
   - In the Vercel Dashboard for your CivicPulse project:
   - Navigate to **Settings** → **Environment Variables**.
   - Add all `VITE_FIREBASE_*` variables for browser execution.
   - Add `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, and `PERSISTENCE_TYPE=firestore` for serverless execution.

8. **Redeploy Project**:
   - Trigger a new deployment via git push or Vercel CLI:
     ```bash
     git push origin main
     ```

9. **Test Authenticated Citizen Submission**:
   - Open the deployed application URL.
   - Navigate to **Report an Issue** (`/submit`).
   - Log an issue via voice or text input, proceed to AI Review, and authenticate with Google.
   - Verify that your submission receives an authoritative tracking ID (`CP-2026-XXXXXX`) tagged as an **Account-Authenticated submission** backed by your verified user account.

---

## 📄 License & Attribution

Developed as a Digital Public Infrastructure (DPI) prototype for National Development Intelligence. Powered by Google Gemini API, React 19, Express, and Tailwind CSS.
