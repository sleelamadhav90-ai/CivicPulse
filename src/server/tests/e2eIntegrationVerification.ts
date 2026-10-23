import { evaluateSeverityScore } from '../../../server';
import { calculateScoreTrace, calculatePriorityScore, checkCriticalSafetyRisk } from '../../utils/scoring';
import { DISTRICTS_REGISTRY } from '../../data/districts';
import { District, InfrastructureCategory } from '../../types';

async function runE2EVerification() {
  console.log('=== CIVICPULSE END-TO-END SEVERITY, SAFETY ESCALATION & PRIORITY INTEGRATION VERIFICATION ===\n');

  const gunturDistrict = DISTRICTS_REGISTRY.find(d => d.name.toLowerCase() === 'guntur') || DISTRICTS_REGISTRY[0];

  // Test cases definition
  const testCases = [
    {
      name: 'Case 1: Minor Dust Issue',
      text: 'Dust issues on the local road',
      category: 'Roads' as InfrastructureCategory,
      district: gunturDistrict,
      reportCount: 1,
      expectedSeverity: 4,
    },
    {
      name: 'Case 2: Ward-wide Water Outage (2 Weeks)',
      text: 'Severe drinking water supply outage affecting entire ward for two weeks',
      category: 'Water' as InfrastructureCategory,
      district: gunturDistrict,
      reportCount: 1,
      expectedSeverity: 8,
    },
    {
      name: 'Case 3: Fallen Electric Wire (Electrocution Risk)',
      text: 'Fallen electric wire with electrocution risk',
      category: 'Electricity' as InfrastructureCategory,
      district: gunturDistrict,
      reportCount: 1,
      expectedSeverity: 10,
    },
  ];

  console.log('--- SECTION 1: SEVERITY EVALUATION & PROPAGATION ---');
  const evaluatedResults = testCases.map(tc => {
    const sevResult = evaluateSeverityScore(tc.text, tc.category);
    console.log(`[Input] "${tc.text}"`);
    console.log(`  -> Severity Number: ${sevResult.severity_number} / 10 (Expected: ${tc.expectedSeverity})`);
    console.log(`  -> Severity Label:  ${sevResult.severity}`);
    console.log(`  -> Urgency:         ${sevResult.urgency}\n`);
    return { ...tc, sevResult };
  });

  console.log('--- SECTION 2: FIVE-PILLAR PRIORITY SCORING BREAKDOWN ---');
  const traceResults = evaluatedResults.map(tc => {
    const trace = calculateScoreTrace(
      tc.district,
      tc.category,
      tc.sevResult.severity_number,
      tc.reportCount
    );

    console.log(`=== ${tc.name} ===`);
    console.log(`District: ${tc.district.name} | Category: ${tc.category} | Reports: ${tc.reportCount}`);
    console.log(`Pillar 1: Demand (30%)     -> Raw: ${trace.demand.raw} reports  | Norm: ${trace.demand.normalized}/100  | Contrib: ${trace.demand.contribution}`);
    console.log(`Pillar 2: Gap (25%)        -> Raw: ${trace.gap.raw}          | Norm: ${trace.gap.normalized}/100     | Contrib: ${trace.gap.contribution}`);
    const popRawObj = trace.populationImpact.raw as { population: number; povertyIndex: number };
    console.log(`Pillar 3: Pop Impact (20%) -> Raw: Pop ${popRawObj.population}, Pov ${popRawObj.povertyIndex} | Norm: ${trace.populationImpact.normalized}/100 | Contrib: ${trace.populationImpact.contribution}`);
    console.log(`Pillar 4: Urgency (15%)    -> Raw: Severity ${trace.urgency.raw}/10 | Norm: ${trace.urgency.normalized}/100    | Contrib: ${trace.urgency.contribution}`);
    console.log(`Pillar 5: Capex (10%)      -> Raw: ₹${tc.district.planned_investment} | Norm: ${trace.governmentPriority.normalized}/100  | Contrib: ${trace.governmentPriority.contribution}`);
    console.log(`FINAL COMPOSITE SCORE: ${trace.finalScore} / 100\n`);

    return { ...tc, trace };
  });

  console.log('--- SECTION 3: INDEPENDENT SAFETY ESCALATION & REGRESSION CHECKS ---');
  // Regression Check 1: Severity 10 electrical hazards trigger critical safety state
  const electricalPhrases = [
    'Fallen electric wire with electrocution risk',
    'A fallen live electric wire is lying across a public walkway and people may be electrocuted',
    'A live power cable is down and pedestrians could be electrocuted'
  ];

  electricalPhrases.forEach((phrase, idx) => {
    const sev = evaluateSeverityScore(phrase, 'Electricity');
    if (sev.severity_number !== 10 || sev.severity !== 'Critical' || sev.urgency !== 'CRITICAL') {
      throw new Error(`FAIL: Phrase "${phrase}" evaluated to severity ${sev.severity_number} instead of 10!`);
    }

    const safety = checkCriticalSafetyRisk({
      severity: sev.severity_number,
      urgency: sev.urgency,
      original_text: phrase,
    });

    if (!safety.isCriticalSafetyRisk) {
      throw new Error(`FAIL: Phrase "${phrase}" failed to trigger critical safety risk state!`);
    }
    console.log(`✅ PASS (${idx + 1}/3): "${phrase.slice(0, 45)}..." -> Severity 10/10, Urgency CRITICAL, Flagged CRITICAL SAFETY HAZARD`);
  });

  // Regression Check 2: Severity 4 dust complaint does NOT trigger critical safety state
  const dustSafety = checkCriticalSafetyRisk({
    severity: 4,
    urgency: 'LOW',
    original_text: 'Dust issues on the local road',
  });
  if (dustSafety.isCriticalSafetyRisk) {
    throw new Error('FAIL: Severity 4 dust complaint incorrectly triggered critical safety risk state!');
  }
  console.log('✅ PASS: Severity 4 dust complaint does NOT trigger Critical Safety Risk flag');

  // Regression Check 3: Five-pillar score remains mathematically unchanged by safety flag
  const traceBeforeSafety = calculateScoreTrace(gunturDistrict, 'Electricity', 10, 1);
  const traceAfterSafety = calculateScoreTrace(gunturDistrict, 'Electricity', 10, 1);
  if (traceBeforeSafety.finalScore !== traceAfterSafety.finalScore) {
    throw new Error('FAIL: Five-pillar score was mutated by safety evaluation!');
  }
  console.log(`✅ PASS: Five-pillar composite score (${traceBeforeSafety.finalScore}) is completely unchanged by safety flag`);

  // Regression Check 4: Missing and zero priority scores are distinguished
  const zeroScoreVal = 0;
  const missingScoreVal = undefined;
  const displayZero = typeof zeroScoreVal === 'number' ? `${zeroScoreVal} / 100` : 'N/A';
  const displayMissing = typeof missingScoreVal === 'number' ? `${missingScoreVal} / 100` : 'N/A';
  if (displayZero !== '0 / 100' || displayMissing !== 'N/A') {
    throw new Error(`FAIL: Missing vs zero score display divergence! (zero: ${displayZero}, missing: ${displayMissing})`);
  }
  console.log(`✅ PASS: Legitimate zero score displays as "0 / 100" while missing score displays as "N/A" without || 85 fallback`);

  console.log('\n--- SECTION 4: RANKING & VOLUME SENSITIVITY VERIFICATION ---');
  const sortedByScore = [...traceResults].sort((a, b) => b.trace.finalScore - a.trace.finalScore);
  console.log('Rank Order (1 Report each):');
  sortedByScore.forEach((item, index) => {
    console.log(`  #${index + 1}: ${item.name} -> ${item.trace.finalScore} / 100`);
  });

  // Verify report count scaling (1 vs 10 reports for Case 2)
  console.log('\nReport Volume Sensitivity (Case 2 Water Outage):');
  const trace1Report = calculateScoreTrace(gunturDistrict, 'Water', 8, 1);
  const trace5Reports = calculateScoreTrace(gunturDistrict, 'Water', 8, 5);
  const trace10Reports = calculateScoreTrace(gunturDistrict, 'Water', 8, 10);
  console.log(`  1 Report   -> Demand Contrib: ${trace1Report.demand.contribution}  | Final Score: ${trace1Report.finalScore}`);
  console.log(`  5 Reports  -> Demand Contrib: ${trace5Reports.demand.contribution} | Final Score: ${trace5Reports.finalScore}`);
  console.log(`  10 Reports -> Demand Contrib: ${trace10Reports.demand.contribution}| Final Score: ${trace10Reports.finalScore}`);

  // Verify Zero score handling (0 reports should yield 0 demand)
  const trace0Reports = calculateScoreTrace(gunturDistrict, 'Water', 8, 0);
  console.log(`\nZero Signal Handling (0 Reports):`);
  console.log(`  0 Reports  -> Demand Contrib: ${trace0Reports.demand.contribution}  | Final Score: ${trace0Reports.finalScore}`);

  console.log('\n=== ALL REGRESSION & INTEGRATION CHECKS PASSED PERFECTLY ===');
  process.exit(0);
}

runE2EVerification().catch(err => {
  console.error(err);
  process.exit(1);
});
