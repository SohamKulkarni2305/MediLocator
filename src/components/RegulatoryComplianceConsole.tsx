import React, { useState } from 'react';
import { Currency } from '../types';
import {
  MOCK_DAILY_THROUGHPUT,
  MOCK_FLAGGED_PATTERNS,
  MOCK_RECENT_INTERCEPTIONS,
  DailyThroughputPoint,
  FlaggedPatternSummary,
  FlaggedPrescriptionCase,
} from '../data/complianceData';
import { ComplianceD3LineChart } from './ComplianceD3LineChart';

interface RegulatoryComplianceConsoleProps {
  currency: Currency;
  onNavigateToWorkstation?: () => void;
}

export const RegulatoryComplianceConsole: React.FC<RegulatoryComplianceConsoleProps> = ({
  currency,
  onNavigateToWorkstation,
}) => {
  const [timeWindow, setTimeWindow] = useState<7 | 14 | 30>(30);
  const [selectedPoint, setSelectedPoint] = useState<DailyThroughputPoint | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<FlaggedPatternSummary | null>(
    MOCK_FLAGGED_PATTERNS[0]
  );
  const [interceptions, setInterceptions] = useState<FlaggedPrescriptionCase[]>(
    MOCK_RECENT_INTERCEPTIONS
  );
  const [selectedCaseModal, setSelectedCaseModal] = useState<FlaggedPrescriptionCase | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [filterPatternCategory, setFilterPatternCategory] = useState<string | null>(null);
  const [filterDateKey, setFilterDateKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      showToast('Automated 21 CFR Part 11 & CDSCO Rule 65 statutory audit completed. 0 unresolved breaches.');
    }, 1200);
  };

  // Simulate incoming live tele-rx batch to demonstrate active connected surveillance
  const handleSimulateLiveBatch = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      const newCase: FlaggedPrescriptionCase = {
        id: `flag-live-${Date.now().toString().slice(-4)}`,
        rxNumber: `RX-LIVE-${Math.floor(1000 + Math.random() * 9000)}`,
        dateKey: '2026-09-08',
        timestamp: 'Just now',
        patientInitials: 'R.K. (49/M)',
        prescriber: 'Dr. Sameer Kulkarni',
        prescriberReg: 'MMC-55109',
        clinic: 'Apex Digital Pulmonology Node',
        flagType: 'Schedule H1 Antibiotic Missing Reg#',
        severity: 'CRITICAL',
        medicationInvolved: 'Faropenem Sodium 200mg (10 tabs)',
        statutoryViolation: 'CDSCO GSR 570(E) - Schedule H1 dispensing mandate',
        auditStatus: 'QUARANTINED',
        actionTaken: 'Auto-quarantined by AI Sentinel; tele-pharmacist notification dispatched',
      };
      setInterceptions((prev) => [newCase, ...prev]);
      showToast('⚡ Live Inflow: 10 Tele-Rx processed (9 clean dispenses, 1 Schedule H1 flagged & quarantined).');
    }, 900);
  };

  const clearAllFilters = () => {
    setFilterSeverity('ALL');
    setFilterPatternCategory(null);
    setFilterDateKey(null);
    setSelectedPoint(null);
    setSearchQuery('');
  };

  const handleExportReport = () => {
    const reportData = {
      exportTimestamp: new Date().toISOString(),
      regulator: 'National CDSCO / State Pharmacy Council Compliance Audit',
      timeWindowDays: timeWindow,
      totalVerified: MOCK_DAILY_THROUGHPUT.reduce((a, b) => a + b.totalThroughput, 0),
      totalFlagged: MOCK_DAILY_THROUGHPUT.reduce((a, b) => a + b.flaggedCount, 0),
      flaggedPatterns: MOCK_FLAGGED_PATTERNS,
      recentCases: interceptions,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Regulatory_Compliance_Audit_Export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported official statutory compliance ledger audit report.');
  };

  const handleOverrideCase = (id: string) => {
    setInterceptions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              auditStatus: 'RESOLVED_OVERRIDE',
              actionTaken: 'Pharmacist attestation verified; statutory override signed by RPh-LIC-44910',
            }
          : item
      )
    );
    showToast(`Case ${id} reviewed: Pharmacist clinical attestation recorded in audit ledger.`);
    if (selectedCaseModal?.id === id) {
      setSelectedCaseModal((prev) =>
        prev
          ? {
              ...prev,
              auditStatus: 'RESOLVED_OVERRIDE',
              actionTaken: 'Pharmacist attestation verified; statutory override signed by RPh-LIC-44910',
            }
          : null
      );
    }
  };

  const filteredInterceptions = interceptions.filter((c) => {
    const matchesSeverity = filterSeverity === 'ALL' || c.severity === filterSeverity;
    const matchesPattern =
      !filterPatternCategory ||
      c.flagType.toLowerCase().includes(filterPatternCategory.toLowerCase()) ||
      filterPatternCategory.toLowerCase().includes(c.flagType.toLowerCase());
    const matchesDate = !filterDateKey || c.dateKey === filterDateKey;
    const matchesQuery =
      c.rxNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.prescriber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.medicationInvolved.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.flagType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesPattern && matchesDate && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Console Subheader & Quick Status Strip */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="font-semibold text-slate-900">National Health Oversight</span>
              <span>/</span>
              <span>Compliance &amp; Risk Interception</span>
              <span>/</span>
              <span className="font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                21 CFR Part 11 &amp; CDSCO GSR 570(E)
              </span>
            </div>
            <h2 className="font-headline text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Regulatory Compliance Console</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Oversight Active
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Real-time surveillance console tracking daily tele-pharmacist verification throughput,
              flagged Schedule H/H1 anomalies, dosage discrepancies, and bioequivalence statutory adherence.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSimulateLiveBatch}
              disabled={isSimulating}
              className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              title="Simulate 10 incoming remote tele-prescriptions"
            >
              <span className={`material-symbols-outlined text-base ${isSimulating ? 'animate-spin text-sky-600' : 'text-sky-600'}`}>
                {isSimulating ? 'sync' : 'bolt'}
              </span>
              <span>{isSimulating ? 'Streaming Tele-Rx...' : 'Simulate Live Inflow (+10 Rx)'}</span>
            </button>

            <button
              onClick={handleRunAudit}
              disabled={isAuditing}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <span className={`material-symbols-outlined text-base ${isAuditing ? 'animate-spin text-sky-600' : 'text-slate-600'}`}>
                {isAuditing ? 'refresh' : 'rule'}
              </span>
              <span>{isAuditing ? 'Auditing 58k Rx...' : 'Run Anomaly Audit'}</span>
            </button>

            <button
              onClick={handleExportReport}
              className="px-3.5 py-2 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">file_download</span>
              <span>Export Statutory Package (JSON)</span>
            </button>
          </div>
        </div>

        {/* 4 Regulatory Key Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>30-Day Verifications</span>
              <span className="material-symbols-outlined text-base text-sky-600">verified</span>
            </div>
            <div className="text-xl font-headline font-extrabold text-slate-900 mt-1">
              58,740 <span className="text-xs font-normal text-slate-500">Rx</span>
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
              +14.2% MoM Throughput
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Clean Dispense Ratio</span>
              <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
            </div>
            <div className="text-xl font-headline font-extrabold text-emerald-700 mt-1">
              95.3%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Exceeds 92% National Benchmark
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Intercepted Anomalies</span>
              <span className="material-symbols-outlined text-base text-rose-500">security_update_warning</span>
            </div>
            <div className="text-xl font-headline font-extrabold text-rose-600 mt-1">
              2,790 <span className="text-xs font-normal text-slate-500">Flags</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              0 Unverified Schedule X Escapes
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Pharmacist Audit SLA</span>
              <span className="material-symbols-outlined text-base text-indigo-500">timer</span>
            </div>
            <div className="text-xl font-headline font-extrabold text-slate-900 mt-1">
              42.4 <span className="text-xs font-normal text-slate-500">sec / Rx</span>
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
              Door-to-door delivery: 11.2m
            </div>
          </div>
        </div>
      </div>

      {/* Primary D3 Line Chart Section */}
      <ComplianceD3LineChart
        data={MOCK_DAILY_THROUGHPUT}
        timeWindow={timeWindow}
        selectedPoint={selectedPoint}
        onTimeWindowChange={(days) => setTimeWindow(days)}
        onSelectPoint={(point) => {
          setSelectedPoint(point);
          setFilterDateKey(point.date);
          showToast(`Filtered surveillance ledger to date: ${point.fullDate} (${point.flaggedCount} flags)`);
        }}
      />

      {/* Selected Day Telemetry Banner (If Clicked) */}
      {selectedPoint && (
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-lg">calendar_month</span>
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>Inspection Focus: {selectedPoint.fullDate}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">
                  Cross-Filter Active
                </span>
              </div>
              <div className="text-slate-600 text-[11px]">
                {selectedPoint.totalThroughput.toLocaleString()} Prescriptions processed • {selectedPoint.approvedClean.toLocaleString()} Approved • {selectedPoint.flaggedCount} Flagged ({selectedPoint.flaggedRatePercent}%)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] px-2.5 py-1 bg-white rounded-lg border border-sky-300 text-sky-900">
              Primary: {selectedPoint.primaryFlagPattern}
            </span>
            <button
              onClick={() => {
                setSelectedPoint(null);
                setFilterDateKey(null);
              }}
              className="text-slate-600 hover:text-slate-900 text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold transition cursor-pointer"
            >
              Reset Date Filter
            </button>
          </div>
        </div>
      )}

      {/* Flagged Prescription Patterns Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Flagged Patterns Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 text-xl">pattern</span>
              <h3 className="font-headline font-bold text-slate-900 text-base">
                Flagged Anomaly Patterns
              </h3>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded">
              30-Day Taxonomy
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {MOCK_FLAGGED_PATTERNS.map((pattern) => {
              const isSelected = selectedPattern?.id === pattern.id;
              const isFiltered = filterPatternCategory === pattern.category;
              return (
                <div
                  key={pattern.id}
                  onClick={() => {
                    setSelectedPattern(pattern);
                    setFilterPatternCategory(pattern.category);
                    showToast(`Filtered ledger to pattern: ${pattern.category}`);
                  }}
                  className={`p-4 transition cursor-pointer ${
                    isFiltered
                      ? 'bg-sky-50/80 border-l-4 border-sky-600 shadow-2xs'
                      : isSelected
                      ? 'bg-slate-50/80 border-l-4 border-slate-400'
                      : 'hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            pattern.severity === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : pattern.severity === 'HIGH'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {pattern.severity}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          {pattern.category}
                        </h4>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-1 truncate">
                        {pattern.statutoryCode}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="font-mono font-extrabold text-sm text-slate-900">
                        {pattern.count30d}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {pattern.percentageOfFlags}% of flags
                      </div>
                      <span
                        className={`text-[10px] font-semibold inline-flex items-center ${
                          pattern.trend === 'up'
                            ? 'text-rose-600'
                            : pattern.trend === 'down'
                            ? 'text-emerald-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {pattern.trend === 'up' ? '▲' : pattern.trend === 'down' ? '▼' : '—'}{' '}
                        {pattern.trendPercent}
                      </span>
                    </div>
                  </div>

                  {/* Visual Weight Percentage Bar */}
                  <div className="mt-2.5 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pattern.severity === 'CRITICAL'
                          ? 'bg-rose-500'
                          : pattern.severity === 'HIGH'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${Math.min(100, pattern.percentageOfFlags * 2.5)}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                    {pattern.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Pattern SOP & Regulatory Protocol (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-2xs p-5 sm:p-6 space-y-5">
          {selectedPattern ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        selectedPattern.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {selectedPattern.severity} RISK
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Rule Citation: {selectedPattern.statutoryCode}
                    </span>
                  </div>
                  <h3 className="font-headline font-bold text-lg text-slate-900 mt-1">
                    {selectedPattern.category}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left sm:text-right">
                    <div className="text-xl font-headline font-extrabold text-slate-900">
                      {selectedPattern.count30d} Incidents
                    </div>
                    <div className="text-xs text-slate-500">
                      {selectedPattern.percentageOfFlags}% of all intercepted anomalies
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setFilterPatternCategory(
                        filterPatternCategory === selectedPattern.category ? null : selectedPattern.category
                      );
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1 ${
                      filterPatternCategory === selectedPattern.category
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">filter_alt</span>
                    <span>
                      {filterPatternCategory === selectedPattern.category ? 'Filtering Ledger' : 'Filter Ledger'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Pattern Clinical Anatomy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200/80 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    <span>Representative Clinical Anomaly</span>
                  </div>
                  <p className="font-mono text-slate-800 text-[11px] leading-relaxed bg-white p-2.5 rounded-lg border border-rose-200">
                    "{selectedPattern.sampleAnomaly}"
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">gavel</span>
                    <span>Mandated Regulatory SOP Protocol</span>
                  </div>
                  <p className="text-slate-800 text-[11px] leading-relaxed bg-white p-2.5 rounded-lg border border-emerald-200">
                    {selectedPattern.regulatoryAction}
                  </p>
                </div>
              </div>

              {/* Statutory Audit Rules Details */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-sky-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">verified_user</span>
                    <span>Enforced Statutory Compliance Standards</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    21 CFR Part 11 / CDSCO
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-300">
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <span className="text-slate-400 block text-[9px]">INTERCEPT LATENCY</span>
                    <strong className="text-emerald-400">&lt; 120ms (Pre-dispense)</strong>
                  </div>
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <span className="text-slate-400 block text-[9px]">PRESCRIBER NMC VERIFY</span>
                    <strong className="text-sky-300">Live API Registry</strong>
                  </div>
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <span className="text-slate-400 block text-[9px]">LEDGER RECORDING</span>
                    <strong className="text-amber-300">SHA-256 Immutability</strong>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select an anomaly pattern on the left to inspect clinical anatomy and statutory protocols.
            </div>
          )}
        </div>
      </div>

      {/* Live Interception Queue Ledger */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-headline font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-700 text-xl">shield</span>
              <span>Recent Regulatory Flag Interceptions Ledger</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live chronological feed of prescriptions quarantined, rejected, or attested by licensed tele-pharmacists
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative w-44 sm:w-56">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Filter cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-2xs"
              />
            </div>

            {/* Severity Filter */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5 text-xs font-semibold">
              {(['ALL', 'CRITICAL', 'HIGH'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] cursor-pointer transition ${
                    filterSeverity === sev
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Connected Filter Indicator Banner (If filtered by date or pattern) */}
        {(filterDateKey || filterPatternCategory || filterSeverity !== 'ALL' || searchQuery) && (
          <div className="px-5 py-2.5 bg-sky-50/70 border-b border-sky-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sky-950 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-sky-600">filter_alt</span>
                <span>Active Filters:</span>
              </span>
              {filterDateKey && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono text-[11px] font-semibold">
                  <span>Date: {filterDateKey}</span>
                  <button onClick={() => { setFilterDateKey(null); setSelectedPoint(null); }} className="hover:text-rose-700 font-bold ml-1">✕</button>
                </span>
              )}
              {filterPatternCategory && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono text-[11px] font-semibold">
                  <span>Pattern: {filterPatternCategory}</span>
                  <button onClick={() => setFilterPatternCategory(null)} className="hover:text-rose-700 font-bold ml-1">✕</button>
                </span>
              )}
              {filterSeverity !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[11px] font-semibold">
                  <span>Severity: {filterSeverity}</span>
                  <button onClick={() => setFilterSeverity('ALL')} className="hover:text-rose-700 font-bold ml-1">✕</button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-mono text-[11px] font-semibold">
                  <span>"{searchQuery}"</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-rose-700 font-bold ml-1">✕</button>
                </span>
              )}
              <span className="text-slate-500 text-[11px]">
                ({filteredInterceptions.length} matching cases)
              </span>
            </div>

            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 underline cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Interceptions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4" scope="col">Case ID &amp; Time</th>
                <th className="py-3 px-4" scope="col">Prescriber &amp; Clinic</th>
                <th className="py-3 px-4" scope="col">Medication Prescribed</th>
                <th className="py-3 px-4" scope="col">Flag Type &amp; Severity</th>
                <th className="py-3 px-4" scope="col">Statutory Violation</th>
                <th className="py-3 px-4" scope="col">Audit Status</th>
                <th className="py-3 px-4 text-right" scope="col">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredInterceptions.length > 0 ? (
                filteredInterceptions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{item.rxNumber}</div>
                      <div className="text-[10px] text-slate-400">{item.timestamp}</div>
                      <div className="text-[10px] text-slate-500 font-sans">Pt: {item.patientInitials}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{item.prescriber}</div>
                      <div className="text-[10px] font-mono text-sky-800">{item.prescriberReg}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs">{item.clinic}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{item.medicationInvolved}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.severity === 'CRITICAL'
                              ? 'bg-rose-500'
                              : item.severity === 'HIGH'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span className="font-semibold text-slate-800">{item.flagType}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {item.statutoryViolation}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.auditStatus === 'QUARANTINED'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : item.auditStatus === 'RESOLVED_OVERRIDE'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {item.auditStatus === 'QUARANTINED' && (
                          <span className="material-symbols-outlined text-xs">lock</span>
                        )}
                        {item.auditStatus === 'RESOLVED_OVERRIDE' && (
                          <span className="material-symbols-outlined text-xs">verified</span>
                        )}
                        {item.auditStatus === 'REJECTED_DISPATCHED' && (
                          <span className="material-symbols-outlined text-xs">block</span>
                        )}
                        <span>{item.auditStatus}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCaseModal(item)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
                          title="Inspect Anomaly Case"
                        >
                          Inspect
                        </button>
                        {item.auditStatus === 'QUARANTINED' && (
                          <button
                            onClick={() => handleOverrideCase(item.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer"
                            title="Authorize Pharmacist Attestation Override"
                          >
                            Override
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <span className="material-symbols-outlined text-3xl text-slate-300">verified_user</span>
                      <p className="font-semibold text-slate-600">No intercepted cases match the selected filters.</p>
                      <p className="text-[11px] text-slate-400">All tele-pharmacist verifications for this query met regulatory standards.</p>
                      <button
                        onClick={clearAllFilters}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 mt-2 cursor-pointer"
                      >
                        Clear Active Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <span className="font-mono text-[11px]">
            Displaying {filteredInterceptions.length} of {interceptions.length} regulatory cases
          </span>
          <div className="flex items-center gap-3">
            {onNavigateToWorkstation && (
              <button
                onClick={onNavigateToWorkstation}
                className="text-sky-600 hover:text-sky-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Open Pharmacist Dispensing Queue</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Case Details Inspection Modal with 4-Step Verification Chain */}
      {selectedCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-xl">policy</span>
                <div>
                  <h3 className="font-headline font-bold text-slate-900 text-sm sm:text-base">
                    Regulatory Case Inspection: {selectedCaseModal.rxNumber}
                  </h3>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Logged: {selectedCaseModal.timestamp} • Date Key: {selectedCaseModal.dateKey || 'N/A'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCaseModal(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              {/* 4-Step Verification Chain */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-sky-600">route</span>
                  <span>4-Tier Statutory Verification Gate</span>
                </span>

                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                  <div className="p-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
                    <span className="material-symbols-outlined text-sm block mx-auto text-emerald-600">document_scanner</span>
                    <span className="font-bold">1. AI OCR</span>
                    <span className="block text-[9px] text-emerald-700">99.4% Match</span>
                  </div>
                  <div className="p-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
                    <span className="material-symbols-outlined text-sm block mx-auto text-emerald-600">account_box</span>
                    <span className="font-bold">2. Registry</span>
                    <span className="block text-[9px] text-emerald-700">NMC Active</span>
                  </div>
                  <div className="p-1.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg">
                    <span className="material-symbols-outlined text-sm block mx-auto text-rose-600">crisis_alert</span>
                    <span className="font-bold">3. Sentinel</span>
                    <span className="block text-[9px] text-rose-700">Flag Triggered</span>
                  </div>
                  <div className={`p-1.5 border rounded-lg ${
                    selectedCaseModal.auditStatus === 'RESOLVED_OVERRIDE'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border-amber-200'
                  }`}>
                    <span className="material-symbols-outlined text-sm block mx-auto">
                      {selectedCaseModal.auditStatus === 'RESOLVED_OVERRIDE' ? 'verified' : 'pending_actions'}
                    </span>
                    <span className="font-bold">4. Attestation</span>
                    <span className="block text-[9px]">
                      {selectedCaseModal.auditStatus === 'RESOLVED_OVERRIDE' ? 'Signed' : 'Quarantine'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Case Metadata */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Prescriber:</span>
                  <span className="font-bold text-slate-900">{selectedCaseModal.prescriber}</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-500">Registration ID:</span>
                  <span className="text-sky-800 font-bold">{selectedCaseModal.prescriberReg}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Clinic / Hospital:</span>
                  <span className="text-slate-800 text-right">{selectedCaseModal.clinic}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Patient Initials:</span>
                  <span className="font-mono text-slate-800">{selectedCaseModal.patientInitials}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Prescribed Medication
                </span>
                <div className="p-3 bg-sky-50 text-sky-950 font-mono rounded-xl border border-sky-200 font-bold text-xs">
                  {selectedCaseModal.medicationInvolved}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Statutory Rule Violated
                </span>
                <div className="p-3 bg-rose-50 text-rose-900 rounded-xl border border-rose-200 font-mono text-xs font-semibold">
                  {selectedCaseModal.statutoryViolation}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Audit Action History
                </span>
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 leading-relaxed text-[11px]">
                  {selectedCaseModal.actionTaken}
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedCaseModal.auditStatus === 'QUARANTINED' ? (
                  <button
                    onClick={() => handleOverrideCase(selectedCaseModal.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">verified</span>
                    <span>Authorize Override Attestation</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    <span>Audit Case Resolved</span>
                  </span>
                )}

                {onNavigateToWorkstation && (
                  <button
                    onClick={() => {
                      setSelectedCaseModal(null);
                      onNavigateToWorkstation();
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">clinical_notes</span>
                    <span>View in Workstation</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedCaseModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 text-xs border border-slate-700">
          <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
