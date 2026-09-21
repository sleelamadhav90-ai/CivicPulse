/**
 * CIVICPULSE DATA ADAPTER & NORMALIZATION LAYER
 *
 * Conceptual Architecture:
 *   Data Sources (Files / APIs / DBs)
 *        │
 *        ▼
 *   Data Adapter / Normalization Layer (dataAdapter.ts)
 *        │
 *        ▼
 *   Common CivicPulse Data Model (types.ts)
 *        │
 *        ▼
 *   Analytics + Scoring + Recommendations + UI
 *
 * This layer decouples heterogeneous upstream data formats (synthetic prototype files,
 * open data CSVs, local JSON persistence, or live e-Gov REST/GraphQL APIs)
 * from the deterministic scoring engine and recommendation pipeline.
 *
 * Future production integrations can introduce new Data Adapters (e.g. PostgresAdapter,
 * GatiShaktiGISAdapter) without modifying scoring algorithms or frontend components.
 */

import { District, CitizenRequest, GovernmentProject, ScoreBreakdown, EvidenceBundle, InfrastructureCategory } from '../types';
import { DISTRICTS_REGISTRY } from './districts';
import { getPublicContextSummary } from './publicDataService';
import { STATE_GRIEVANCE_BASELINES } from './governmentBaselineData';
import { calculatePriorityScore } from '../utils/scoring';
import { buildEvidenceBundle } from '../utils/evidenceBundleService';

/**
 * Normalized District Model returned by Data Adapters
 */
export interface NormalizedDistrictRecord {
  district: District;
  provenance: {
    sourceName: string;
    datasetYear: string;
    isSynthetic: boolean;
    isCuratedBenchmark: boolean;
  };
}

/**
 * Interface for all CivicPulse Data Adapters
 */
export interface ICivicPulseDataAdapter {
  adapterName: string;
  isProductionReady: boolean;
  getNormalizedDistricts(): Promise<NormalizedDistrictRecord[]>;
  getDistrictById(id: string): Promise<District | null>;
  getDistrictPublicContext(districtName: string, category: InfrastructureCategory): {
    summary: string;
    source: string;
    year: string;
    isSynthetic: boolean;
  };
  buildIssueEvidenceBundle(district: District, category: InfrastructureCategory, requests: CitizenRequest[]): EvidenceBundle;
}

/**
 * Prototype Data Adapter (Active)
 * Bridges prototype dataset files & local storage into the Common Data Model
 */
export class PrototypeCivicPulseAdapter implements ICivicPulseDataAdapter {
  public readonly adapterName = 'Prototype Local & Benchmark Data Adapter';
  public readonly isProductionReady = false;

  async getNormalizedDistricts(): Promise<NormalizedDistrictRecord[]> {
    return DISTRICTS_REGISTRY.map((d) => {
      const hasGovBaseline = Boolean(STATE_GRIEVANCE_BASELINES[d.state]);
      return {
        district: d,
        provenance: {
          sourceName: hasGovBaseline ? 'Public Open Data Benchmark (Census / OGD / JJM Portal)' : 'CivicPulse Representative Prototype Registry',
          datasetYear: '2024-2026',
          isSynthetic: !hasGovBaseline,
          isCuratedBenchmark: hasGovBaseline,
        },
      };
    });
  }

  async getDistrictById(id: string): Promise<District | null> {
    const found = DISTRICTS_REGISTRY.find((d) => d.id === id || d.name.toLowerCase() === id.toLowerCase());
    return found || null;
  }

  getDistrictPublicContext(districtName: string, category: InfrastructureCategory) {
    const pubSummary = getPublicContextSummary(districtName, category);
    const topIndicator = pubSummary.indicators[0];
    return {
      summary: pubSummary.headline,
      source: topIndicator?.source || 'data.gov.in',
      year: topIndicator?.year ? String(topIndicator.year) : '2025',
      isSynthetic: pubSummary.isSynthetic,
    };
  }

  buildIssueEvidenceBundle(district: District, category: InfrastructureCategory, requests: CitizenRequest[]): EvidenceBundle {
    return buildEvidenceBundle(district, category, requests);
  }
}

/**
 * Production Integration Data Adapter (Specification / Future Stub)
 * Standardizes how live government API endpoints (e.g., Jal Jeevan Mission API, PMGSY GIS)
 * will plug into CivicPulse without altering core business logic.
 */
export class FutureProductionGovAdapter implements ICivicPulseDataAdapter {
  public readonly adapterName = 'Production Open-Gov & API Adapter (Future Integration)';
  public readonly isProductionReady = true;

  async getNormalizedDistricts(): Promise<NormalizedDistrictRecord[]> {
    throw new Error('Production Gov API credentials not configured. Using PrototypeCivicPulseAdapter fallback.');
  }

  async getDistrictById(id: string): Promise<District | null> {
    return null;
  }

  getDistrictPublicContext(districtName: string, category: InfrastructureCategory) {
    return {
      summary: 'Live production API endpoint',
      source: 'data.gov.in (Live)',
      year: '2026',
      isSynthetic: false,
    };
  }

  buildIssueEvidenceBundle(district: District, category: InfrastructureCategory, requests: CitizenRequest[]): EvidenceBundle {
    return buildEvidenceBundle(district, category, requests);
  }
}

// Global active data adapter instance
export const defaultDataAdapter: ICivicPulseDataAdapter = new PrototypeCivicPulseAdapter();
