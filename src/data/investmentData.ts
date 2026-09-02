import { InvestmentSchemeData, InvestmentAnomalySignal, InvestmentAuditSummary, InfrastructureCategory } from '../types';

export interface StateInvestmentOverview {
  allocatedInr: number;
  releasedInr: number;
  spentInr: number;
  remainingInr: number;
  utilizationPct: number;
  totalProjects: number;
  completedProjects: number;
  delayedProjects: number;
  pendingProjects: number;
  totalCitizenComplaints: number;
}

export const STATE_INVESTMENT_OVERVIEW: StateInvestmentOverview = {
  allocatedInr: 1200000000, // ₹120 Cr
  releasedInr: 980000000,   // ₹98 Cr
  spentInr: 760000000,       // ₹76 Cr
  remainingInr: 440000000,   // ₹44 Cr
  utilizationPct: 77.5,
  totalProjects: 340,
  completedProjects: 210,
  delayedProjects: 85,
  pendingProjects: 45,
  totalCitizenComplaints: 18450
};

export const MAJOR_GOVERNMENT_SCHEMES: InvestmentSchemeData[] = [
  {
    schemeId: 'SCHEME-JJM-01',
    schemeName: 'Jal Jeevan Mission (JJM) — Rural Water Supply',
    department: 'Rural Water Supply & Sanitation (RWSS)',
    category: 'Water',
    stateAllocationInr: 500000000, // ₹50 Cr
    releasedInr: 450000000,        // ₹45 Cr
    spentInr: 390000000,           // ₹39 Cr
    remainingInr: 110000000,       // ₹11 Cr
    utilizationPct: 86.6,
    totalProjects: 120,
    completedProjects: 82,
    delayedProjects: 25,
    pendingProjects: 13,
    citizenComplaintsCount: 4820,
    quadrant: 'YELLOW_HIGH_INVESTMENT_POOR_OUTCOME',
    primaryAnomaly: {
      id: 'ANOM-JJM-001',
      title: 'High Expenditure (₹39 Cr) vs 25 Delayed Water Projects & 4,820 Complaints',
      type: 'HIGH_SPENT_LOW_COMPLETION',
      severity: 'CRITICAL',
      districtId: 'guntur',
      districtName: 'Guntur & Vijayawada Rural',
      department: 'Rural Water Supply & Sanitation (RWSS)',
      schemeName: 'Jal Jeevan Mission (JJM)',
      allocatedInr: 500000000,
      spentInr: 390000000,
      unspentInr: 110000000,
      projectsCount: 120,
      completedCount: 82,
      delayedCount: 25,
      citizenComplaintsCount: 4820,
      outcomeTrend: '₹39 Cr spent, but 37 villages report active water access bottlenecks and pipeline leaks.',
      aiInvestigationNote: 'AI Audit Flag: Rather than allocating new capital for BUILD, the system recommends 🔧 FIX / AUDIT to expedite the 25 stalled pipe laying contracts.',
      recommendedActionType: 'FIX'
    }
  },
  {
    schemeId: 'SCHEME-PMGSY-02',
    schemeName: 'Pradhan Mantri Gram Sadak Yojana (PMGSY) — Rural Roads',
    department: 'Public Works Department (PWD)',
    category: 'Roads',
    stateAllocationInr: 320000000, // ₹32 Cr
    releasedInr: 280000000,        // ₹28 Cr
    spentInr: 200000000,           // ₹20 Cr
    remainingInr: 120000000,       // ₹12 Cr
    utilizationPct: 71.4,
    totalProjects: 85,
    completedProjects: 54,
    delayedProjects: 22,
    pendingProjects: 9,
    citizenComplaintsCount: 3890,
    quadrant: 'YELLOW_HIGH_INVESTMENT_POOR_OUTCOME',
    primaryAnomaly: {
      id: 'ANOM-PMGSY-002',
      title: 'High Road Investment (₹20 Cr Spent) but Complaints Surged +31% Post-Completion',
      type: 'HIGH_COMPLAINTS_POST_COMPLETION',
      severity: 'HIGH',
      districtId: 'guntur',
      districtName: 'Guntur Highway Corridor',
      department: 'Public Works Department (PWD)',
      schemeName: 'PMGSY Rural Roads',
      allocatedInr: 320000000,
      spentInr: 200000000,
      unspentInr: 120000000,
      projectsCount: 85,
      completedCount: 54,
      delayedCount: 22,
      citizenComplaintsCount: 3890,
      outcomeTrend: '42 km asphalt constructed, but surface peeling and pothole claims rose +31% within 90 days.',
      aiInvestigationNote: 'AI Audit Flag: Contractor quality audit required on Bituminous Course layering rather than new road sanctioning.',
      recommendedActionType: 'FIX'
    }
  },
  {
    schemeId: 'SCHEME-NHM-03',
    schemeName: 'National Health Mission (NHM) — Primary Health & Clinics',
    department: 'Health & Family Welfare Department',
    category: 'Healthcare',
    stateAllocationInr: 220000000, // ₹22 Cr
    releasedInr: 150000000,        // ₹15 Cr
    spentInr: 110000000,           // ₹11 Cr
    remainingInr: 110000000,       // ₹11 Cr
    utilizationPct: 73.3,
    totalProjects: 45,
    completedProjects: 28,
    delayedProjects: 12,
    pendingProjects: 5,
    citizenComplaintsCount: 5120,
    quadrant: 'RED_HIGH_NEED_LOW_INVESTMENT',
    primaryAnomaly: {
      id: 'ANOM-NHM-003',
      title: 'Funding Mismatch: High Health Complaints (5,120) vs Only ₹11 Cr Expended',
      type: 'FUNDING_MISMATCH',
      severity: 'CRITICAL',
      districtId: 'vijayawada',
      districtName: 'Vijayawada Outer Rural',
      department: 'Health & Family Welfare Department',
      schemeName: 'National Health Mission (NHM)',
      allocatedInr: 220000000,
      spentInr: 110000000,
      unspentInr: 110000000,
      projectsCount: 45,
      completedCount: 28,
      delayedCount: 12,
      citizenComplaintsCount: 5120,
      outcomeTrend: '14,200 residents are 18.2 km from nearest PHC; ₹11 Cr unspent balance sitting idle in state treasury.',
      aiInvestigationNote: 'AI Audit Flag: Severe gap detected. Reallocate unspent NHM funds to 🏗 BUILD new PHC sub-centre in Mangalagiri Sector 4.',
      recommendedActionType: 'BUILD'
    }
  },
  {
    schemeId: 'SCHEME-ELE-04',
    schemeName: 'AP Transco Power Sector Modernization & Substation Feeder',
    department: 'State Energy Transmission Agency',
    category: 'Electricity',
    stateAllocationInr: 160000000, // ₹16 Cr
    releasedInr: 100000000,        // ₹10 Cr
    spentInr: 60000000,            // ₹6 Cr
    remainingInr: 100000000,       // ₹10 Cr
    utilizationPct: 60.0,
    totalProjects: 30,
    completedProjects: 16,
    delayedProjects: 10,
    pendingProjects: 4,
    citizenComplaintsCount: 2310,
    quadrant: 'RED_HIGH_NEED_LOW_INVESTMENT',
    primaryAnomaly: {
      id: 'ANOM-ELE-004',
      title: 'Large Unutilized Allocation (₹10 Cr Unreleased) During Peak Transformer Outages',
      type: 'UNUTILIZED_FUNDS',
      severity: 'MEDIUM',
      districtId: 'kurnool',
      districtName: 'Kurnool Agricultural Grid',
      department: 'State Energy Transmission Agency',
      schemeName: 'AP Power Sector Modernization',
      allocatedInr: 160000000,
      spentInr: 60000000,
      unspentInr: 100000000,
      projectsCount: 30,
      completedCount: 16,
      delayedCount: 10,
      citizenComplaintsCount: 2310,
      outcomeTrend: '108% transformer overload; ₹10 Cr tranche release stalled in sanction pipeline for 7 months.',
      aiInvestigationNote: 'AI Audit Flag: Immediate administrative release of pending ₹10 Cr to ⬆ UPGRADE 33/11kV Transformer coil capacity.',
      recommendedActionType: 'UPGRADE'
    }
  },
  {
    schemeId: 'SCHEME-SBM-05',
    schemeName: 'Swachh Bharat Urban & Outfall Drainage Modernization',
    department: 'Municipal Administration & Urban Development (MA&UD)',
    category: 'Drainage',
    stateAllocationInr: 180000000, // ₹18 Cr
    releasedInr: 150000000,        // ₹15 Cr
    spentInr: 130000000,           // ₹13 Cr
    remainingInr: 50000000,        // ₹5 Cr
    utilizationPct: 86.6,
    totalProjects: 60,
    completedProjects: 30,
    delayedProjects: 16,
    pendingProjects: 14,
    citizenComplaintsCount: 2310,
    quadrant: 'GREEN_HIGH_NEED_ADEQUATE_INVESTMENT',
    primaryAnomaly: {
      id: 'ANOM-SBM-005',
      title: 'Drainage Outfall Desilting Contract Delays in Low-Income Colony',
      type: 'PROJECT_DELAYS_OVERRUNS',
      severity: 'HIGH',
      districtId: 'vijayawada',
      districtName: 'Vijayawada Municipal Ward 4',
      department: 'MA&UD',
      schemeName: 'Swachh Bharat Urban',
      allocatedInr: 180000000,
      spentInr: 130000000,
      unspentInr: 50000000,
      projectsCount: 60,
      completedCount: 30,
      delayedCount: 16,
      citizenComplaintsCount: 2310,
      outcomeTrend: 'Silt blockage at 70%; drainage desilting contractor delayed work execution by 14 weeks.',
      aiInvestigationNote: 'AI Audit Flag: Enforce liquidated damages on contractor and issue 🔧 FIX order for emergency desilting trucks.',
      recommendedActionType: 'FIX'
    }
  }
];

export const ALL_INVESTMENT_ANOMALIES: InvestmentAnomalySignal[] = MAJOR_GOVERNMENT_SCHEMES
  .map(s => s.primaryAnomaly)
  .filter((a): a is InvestmentAnomalySignal => a !== undefined);

export function getInvestmentAuditByCategory(category: InfrastructureCategory): InvestmentAuditSummary {
  const scheme = MAJOR_GOVERNMENT_SCHEMES.find(s => s.category.toLowerCase() === category.toLowerCase() ||
    (category === 'Health' && s.category === 'Healthcare') ||
    (category === 'Healthcare' && s.category === 'Health')
  ) || MAJOR_GOVERNMENT_SCHEMES[0];

  return {
    schemeName: scheme.schemeName,
    department: scheme.department,
    allocatedInr: scheme.stateAllocationInr,
    releasedInr: scheme.releasedInr,
    spentInr: scheme.spentInr,
    unutilizedInr: scheme.remainingInr,
    totalProjects: scheme.totalProjects,
    completedProjects: scheme.completedProjects,
    delayedProjects: scheme.delayedProjects,
    citizenComplaints: scheme.citizenComplaintsCount,
    auditFinding: scheme.primaryAnomaly 
      ? scheme.primaryAnomaly.outcomeTrend 
      : `₹${(scheme.spentInr / 10000000).toFixed(1)} Cr spent across ${scheme.totalProjects} projects under ${scheme.schemeName}.`,
    investmentGapRationale: scheme.primaryAnomaly 
      ? scheme.primaryAnomaly.aiInvestigationNote 
      : `Investment utilization is at ${scheme.utilizationPct}%. Monitor execution performance.`,
    quadrant: scheme.quadrant
  };
}
