import React, { useState } from 'react';
import { Currency, PharmacyKYC, AuditLedgerEntry } from '../types';
import { INITIAL_KYC_QUEUE, INITIAL_AUDIT_LOGS, ORANGE_BOOK_DATA } from '../data/mockData';
import { PharmacopeiaModal, AuditPackageModal } from './Modals';

interface AdminConsoleProps {
  currency: Currency;
  onNavigateToWorkstation: () => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  currency,
  onNavigateToWorkstation,
}) => {
  const [kycList, setKycList] = useState<PharmacyKYC[]>(INITIAL_KYC_QUEUE);
  const [auditLogs, setAuditLogs] = useState<AuditLedgerEntry[]>(INITIAL_AUDIT_LOGS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [isWarmingCache, setIsWarmingCache] = useState(false);
  const [isCacheHot, setIsCacheHot] = useState(false);
  const [isPharmacopeiaOpen, setIsPharmacopeiaOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [orangeBookSearch, setOrangeBookSearch] = useState('');
  const [tenantQuery, setTenantQuery] = useState("SET LOCAL app.current_tenant_id = 'tenant_pharmacy_001';");

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const copyCommand = () => {
    navigator.clipboard?.writeText(tenantQuery);
    showToast('Copied PostgreSQL RLS tenant injection query to clipboard.', 'success');
  };

  const triggerWarmup = () => {
    setIsWarmingCache(true);
    setTimeout(() => {
      setIsWarmingCache(false);
      setIsCacheHot(true);
      showToast('104,821 chemical salt pairs verified and hot in Redis memory (99.4% hit rate).', 'success');
      setTimeout(() => setIsCacheHot(false), 4000);
    }, 1200);
  };

  const handleKYCAction = (id: string, action: string) => {
    if (action === 'Reject') {
      setKycList(prev => prev.map(item => item.id === id ? { ...item, status: 'rejected' } : item));
      showToast('Pharmacy license application rejected and logged in immutable ledger.', 'error');
      // Add audit log
      const newLog: AuditLedgerEntry = {
        id: `log-${Date.now()}`,
        type: 'BLOCKED',
        title: 'PARTNER KYC REJECTED',
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' EST',
        description: `Application for pharmacy partner ${id} was rejected during regulatory review.`,
        details: [
          { label: 'Decision', value: 'REJECTED', isWarning: true },
          { label: 'Reviewer', value: 'RPH-LIC-44910' }
        ],
        signature: '0x' + Math.random().toString(16).substring(2, 10)
      };
      setAuditLogs(prev => [newLog, ...prev]);
    } else if (action === 'Approve & Activate') {
      setKycList(prev => prev.map(item => item.id === id ? { ...item, status: 'approved' } : item));
      showToast('Pharmacy partner approved. Multi-tenant PostgreSQL RLS isolation provisioned.', 'success');
      const newLog: AuditLedgerEntry = {
        id: `log-${Date.now()}`,
        type: 'APPROVED',
        title: 'PHARMACY PARTNER ACTIVATED',
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' EST',
        description: 'New verified pharmacy node provisioned with isolated RLS tenant schema.',
        details: [
          { label: 'Cluster', value: 'Midtown Manhattan' },
          { label: 'Status', value: 'ACTIVE & ENFORCED', isHighlight: true }
        ],
        signature: '0x' + Math.random().toString(16).substring(2, 10)
      };
      setAuditLogs(prev => [newLog, ...prev]);
    } else if (action === 'Reset' || action === 'Revert') {
      setKycList(prev => prev.map(item => item.id === id ? { ...item, status: 'pending' } : item));
      showToast('Decision reverted. Pharmacy application returned to pending review.', 'info');
      const newLog: AuditLedgerEntry = {
        id: `log-${Date.now()}`,
        type: 'AUDIT',
        title: 'KYC DECISION REVERTED',
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' EST',
        description: `Decision for pharmacy partner ${id} was reverted to pending review for re-evaluation.`,
        details: [
          { label: 'Status', value: 'PENDING_REVIEW' },
          { label: 'Reviewer', value: 'RPH-LIC-44910' }
        ],
        signature: '0x' + Math.random().toString(16).substring(2, 10)
      };
      setAuditLogs(prev => [newLog, ...prev]);
    } else {
      showToast(`Action "${action}" recorded and dispatched to regional inspector.`, 'info');
    }
  };

  const filteredOrangeBook = ORANGE_BOOK_DATA.filter(item =>
    item.brandName.toLowerCase().includes(orangeBookSearch.toLowerCase()) ||
    item.saltName.toLowerCase().includes(orangeBookSearch.toLowerCase())
  );

  return (
    <div className="bg-slate-100 text-slate-800 font-sans antialiased min-h-screen flex flex-col">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-10 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <img
                alt="MediLocator Authority Console Logo"
                className="h-9 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida/AEtjO1WgVrbcaHR67UvcdyK0IZss2VgcPCgfUPUPDQJHaZkvGSMdc3uvBxk7kfFdb243EElFTSg3dQnV79jzYNSJaD9ASvSnqsC9LVdKcgrZ3MeQGgLKiIYAVAM1zOBLHAiczaYxaysDBJSjU8HPwexh2r741-7ZMrXRFYp3eLVf8tXkw1Se2bujFNWBMeH_Rr_Z72S5DjLjtCHT5c0SNz_Rvv3Ml_YcAEPAQbJVCTdPsbHHXDIZll7wUc-swtQ-"
                onError={(e) => {
                  // Fallback vector logo if external link is unavailable
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <div className="hidden items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-sky-400/40 flex items-center justify-center text-sky-400 font-bold text-lg">
                  +
                </div>
                <div>
                  <span className="font-bold text-slate-900 tracking-tight text-base font-headline">Medi<span className="text-sky-600">Locator</span></span>
                  <span className="block text-[10px] tracking-widest text-slate-400 font-mono">AUTHORITY CONSOLE</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block h-6 w-px bg-slate-200"></div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 leading-none">Authority Console</span>
              <span className="text-xs font-medium text-slate-600">Federal &amp; State Oversight</span>
            </div>
          </div>

          {/* Live Tenant Indicator Pill */}
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-950">MetroCare Pharmacy #104</span>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
              tenant_pharmacy_001
            </span>
          </div>

          {/* Global Search & User Profile */}
          <div className="flex items-center gap-3 flex-1 justify-end max-w-md">
            <div className="relative w-full max-w-xs">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                placeholder="Search Rx ID, MRN, Salt INN..."
                type="text"
              />
            </div>
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* Pharmacist Profile Badge */}
            <div 
              onClick={onNavigateToWorkstation} 
              className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer hover:opacity-90 transition"
              title="Click to open Clinical Pharmacist Dispensing Workstation"
            >
              <img
                alt="Dr. Sarah Jenkins, PharmD"
                className="h-9 w-9 rounded-full object-cover ring-2 ring-sky-600/20"
                src="https://lh3.googleusercontent.com/aida/AEtjO1WOTdyUKFhbuUDdfbKOwbEEPBM_jnGZ18bhuvhIbkoFTrd6nOMSLztnqtjZVnXQUjvHmRvE8imPkDTWmi9A6EI-Ynyc8MdQ9RhSvIWO85h97J3KZHCK1wnfT34kesULQ63Ixr7DnQJAyGnT5EsP9DFUg5cYW4HYn6ro_m4TuUOIklKHno5ou3uTqVnO2Y2DVwVTstdRp3zjHD7q7P6itb6xKh9Tpd4lL2ItMtmtyhaA_6en0ClxvxIsmOU"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <div className="hidden w-9 h-9 rounded-full bg-sky-100 text-sky-800 font-bold text-xs items-center justify-center">
                SJ
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">Dr. Sarah Jenkins, PharmD</span>
                <span className="text-[11px] font-mono text-sky-700">RPH-LIC-44910</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. SUBHEADER BAR */}
      <section className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Page Title & Status Badges */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>National Health Infrastructure</span>
              <span className="text-slate-300">/</span>
              <span>Compliance Operations</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-semibold">Master Admin</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-headline text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
                Master Admin Regulatory &amp; Compliance Console
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                21 CFR Part 11 Enforced
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-sky-50 text-sky-800 border border-sky-200">
                <span className="material-symbols-outlined text-sm">lock</span>
                PostgreSQL RLS Isolation: Active
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={triggerWarmup}
              disabled={isWarmingCache}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition"
            >
              {isWarmingCache ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin text-amber-500">refresh</span>
                  <span>Warming Salts...</span>
                </>
              ) : isCacheHot ? (
                <>
                  <span className="material-symbols-outlined text-base text-emerald-600">check</span>
                  <span>Cache Hot (99.4%)</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base text-amber-500">bolt</span>
                  <span>Warmup Salt Cache</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsPharmacopeiaOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <span className="material-symbols-outlined text-base text-sky-600">menu_book</span>
              <span>Pharmacopeia DB (100k+ SKUs)</span>
            </button>

            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-800 hover:bg-brand-900 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>Export Audit Package</span>
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* 3. METRICS KPI STRIP (4 DISTINCT CARDS) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Prescription Cost Savings */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Prescription Cost Savings</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">savings</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-2xl font-extrabold text-slate-900">
                  {currency === 'USD' ? '$482,910' : '₹4,829,100'}
                </span>
                <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  +18.4% MoM
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Total Savings Delivered (TPCSD) to consumers</p>
            </div>
          </div>

          {/* Card 2: Bioequivalence Conversion */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Bioequivalence Conversion</span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">swap_horiz</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-2xl font-extrabold text-slate-900">74.8%</span>
                <span className="text-xs font-medium text-slate-500">Generic Conversion</span>
              </div>
              {/* Split bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden flex">
                <div className="bg-sky-600 h-full" style={{ width: '74.8%' }} title="Generic: 74.8%"></div>
                <div className="bg-amber-500 h-full" style={{ width: '14.2%' }} title="Branded: 14.2%"></div>
                <div className="bg-slate-300 h-full" style={{ width: '11.0%' }} title="Narrow: 11%"></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">74.8% Generic / 14.2% Branded / 11% Narrow</p>
            </div>
          </div>

          {/* Card 3: Pharmacist SLA & TAT */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pharmacist SLA &amp; TAT</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">timer</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-2xl font-extrabold text-slate-900">11.2 min</span>
                <span className="text-xs font-semibold text-emerald-600">vs 15m Target</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-xs">
                <span className="text-slate-500">On-time SLA Compliance</span>
                <span className="font-mono font-bold text-slate-800">99.1%</span>
              </div>
            </div>
          </div>

          {/* Card 4: Verified Pharmacies */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Verified Pharmacies</span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">local_pharmacy</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-2xl font-extrabold text-slate-900">1,248</span>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">Live</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Across 14 Metro Areas (38 pending triage)</p>
            </div>
          </div>
        </section>

        {/* 4. POSTGRESQL RLS & SECURITY GATEWAY SECTION */}
        <section className="bg-slate-900 text-white rounded-xl p-5 sm:p-6 border border-slate-800 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-400/30 text-sky-400 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-xl">database</span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-headline font-bold text-base sm:text-lg text-white">
                    PostgreSQL Row-Level Security (RLS) Isolation Gateway
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold tracking-wider uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    ACTIVE &amp; ENFORCED
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Zero-leakage multi-tenant schema isolation preventing cross-dispensary prescription data leakage.
                </p>
              </div>
            </div>

            {/* SQL Code Block */}
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-2 rounded-lg font-mono text-xs text-sky-300">
              <span className="text-slate-500 select-none">$</span>
              <code>{tenantQuery}</code>
              <button
                className="text-slate-400 hover:text-white transition ml-1"
                onClick={copyCommand}
                title="Copy Command"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
              </button>
            </div>
          </div>

          {/* Telemetry Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Leakage Alerts (24h)</div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-1">0 Discrepancies</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">RLS Isolated Queries</div>
              <div className="text-lg font-bold font-mono text-sky-300 mt-1">14,289 Passed</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Redis Cache Hit Rate</div>
              <div className="text-lg font-bold font-mono text-teal-300 mt-1">99.4% (1.2ms)</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Kong / WAF Perimeter</div>
              <div className="text-lg font-bold font-mono text-white mt-1">100% Enforced TLS 1.3</div>
            </div>
          </div>
        </section>

        {/* 5. TWO-COLUMN MAIN CONTENT AREA (60% / 40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Pharmacy Partner Licensing & KYC Queue */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-brand-700 text-xl">domain_verification</span>
                <h3 className="font-headline font-bold text-slate-900 text-base">
                  Pharmacy Partner Licensing &amp; KYC Queue
                </h3>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                {kycList.filter(k => k.status !== 'approved').length} Actions Required
              </span>
            </div>

            <div className="divide-y divide-slate-200">
              {kycList.map((pharmacy) => (
                <div
                  key={pharmacy.id}
                  className={`p-5 flex flex-col gap-3 transition ${
                    pharmacy.status === 'approved' ? 'bg-emerald-50/40' : pharmacy.status === 'rejected' ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{pharmacy.name}</h4>
                        <span className="font-mono text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {pharmacy.code}
                        </span>
                        {pharmacy.status === 'approved' ? (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Approved &amp; Live
                          </span>
                        ) : pharmacy.status === 'inspection_pending' ? (
                          <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Inspection Pending
                          </span>
                        ) : pharmacy.status === 'rejected' ? (
                          <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Application Rejected
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            GSTIN Verified
                          </span>
                        )}
                      </div>

                      <div className="mt-1 text-xs text-slate-600 flex flex-wrap gap-y-1 gap-x-3">
                        <span>
                          License: <strong className="font-mono text-slate-800">{pharmacy.licenseNumber}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Staff: <strong className="text-slate-800">{pharmacy.staffCount}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Location: <strong className="text-slate-800">{pharmacy.cluster}</strong>
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400 self-start">
                      {pharmacy.submittedTime}
                    </span>
                  </div>

                  {/* Supporting Document badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    {pharmacy.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-slate-700">
                        <span
                          className={`material-symbols-outlined text-sm ${
                            doc.verified ? 'text-emerald-600' : 'text-amber-500'
                          }`}
                        >
                          {doc.verified ? 'task_alt' : 'pending'}
                        </span>
                        <span>{doc.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  {pharmacy.status !== 'approved' && pharmacy.status !== 'rejected' ? (
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                      {pharmacy.id === 'kyc-1' ? (
                        <>
                          <button
                            className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition cursor-pointer"
                            onClick={() => handleKYCAction(pharmacy.id, 'Reject')}
                          >
                            Reject
                          </button>
                          <button
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg transition cursor-pointer"
                            onClick={() => handleKYCAction(pharmacy.id, 'Request Resubmission')}
                          >
                            Request Resubmission
                          </button>
                          <button
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition inline-flex items-center gap-1 cursor-pointer"
                            onClick={() => handleKYCAction(pharmacy.id, 'Approve & Activate')}
                          >
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <span>Approve &amp; Activate</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg transition cursor-pointer"
                            onClick={() => handleKYCAction(pharmacy.id, 'Contact Inspector')}
                          >
                            Contact Inspector
                          </button>
                          <button
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-brand-800 hover:bg-brand-900 rounded-lg shadow-xs transition inline-flex items-center gap-1 cursor-pointer"
                            onClick={() => handleKYCAction(pharmacy.id, 'Fast-Track Provisional')}
                          >
                            <span className="material-symbols-outlined text-sm">bolt</span>
                            <span>Fast-Track Provisional</span>
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span
                          className={`material-symbols-outlined text-sm ${
                            pharmacy.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {pharmacy.status === 'approved' ? 'check_circle' : 'cancel'}
                        </span>
                        <span className="text-slate-600 font-medium">
                          Decision: <strong className={pharmacy.status === 'approved' ? 'text-emerald-700' : 'text-rose-700'}>
                            {pharmacy.status === 'approved' ? 'Approved & Activated' : 'Application Rejected'}
                          </strong>
                        </span>
                      </div>

                      <button
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-300 hover:border-slate-400 rounded-lg shadow-2xs transition inline-flex items-center gap-1.5 cursor-pointer"
                        onClick={() => handleKYCAction(pharmacy.id, 'Reset')}
                        title="Undo this decision and return to review options"
                      >
                        <span className="material-symbols-outlined text-sm text-slate-600">arrow_back</span>
                        <span>Back / Undo Decision</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Immutable Regulatory Audit Ledger */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-xl">policy</span>
                <h3 className="font-headline font-bold text-slate-900 text-base">
                  Immutable Regulatory Audit Ledger
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                LIVE FEED
              </span>
            </div>

            <div className="p-4 space-y-3 font-sans">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg flex flex-col gap-1.5 text-xs border ${
                    log.type === 'BLOCKED'
                      ? 'bg-rose-50 border-rose-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                        log.type === 'BLOCKED'
                          ? 'text-rose-800 bg-rose-100 border-rose-200'
                          : log.type === 'APPROVED'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : 'text-sky-800 bg-sky-50 border-sky-200'
                      }`}
                    >
                      {log.type === 'BLOCKED' && (
                        <span className="material-symbols-outlined text-xs">block</span>
                      )}
                      {log.title}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{log.timestamp}</span>
                  </div>

                  <p
                    className={`leading-relaxed ${
                      log.type === 'BLOCKED' ? 'text-rose-900 font-medium' : 'text-slate-700'
                    }`}
                  >
                    {log.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                    {log.details.map((detail, idx) => (
                      <span key={idx}>
                        {detail.label}:{' '}
                        <strong
                          className={
                            detail.isHighlight
                              ? 'text-emerald-700 font-semibold'
                              : detail.isWarning
                              ? 'text-rose-700 font-bold'
                              : 'text-slate-900 font-semibold'
                          }
                        >
                          {detail.value}
                        </strong>
                      </span>
                    ))}
                    {log.signature && (
                      <span className="font-mono text-slate-400">
                        Sig: {log.signature.substring(0, 10)}...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[11px]">wss://audit.medilocator.gov</span>
              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center gap-1"
              >
                <span>View Full Ledger</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* 6. BOTTOM TABLE: FDA ORANGE BOOK MAPPINGS */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-headline font-bold text-slate-900 text-base">
                FDA Orange Book Salt Therapeutic Equivalence Mappings
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time bioequivalence mapping registry for national generic substitution compliance.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-48 sm:w-64">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Filter salts..."
                  value={orangeBookSearch}
                  onChange={(e) => setOrangeBookSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <span className="text-xs font-mono font-medium text-slate-600 bg-slate-200/70 px-2.5 py-1 rounded whitespace-nowrap">
                Active Registry: 104,821 Salt Pairs
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4" scope="col">Brand Name</th>
                  <th className="py-3 px-4" scope="col">Active Pharmaceutical Ingredient (INN Salt)</th>
                  <th className="py-3 px-4" scope="col">Dosage &amp; Form</th>
                  <th className="py-3 px-4" scope="col">Equivalence Code</th>
                  <th className="py-3 px-4" scope="col">Ceiling Price (NPPA)</th>
                  <th className="py-3 px-4" scope="col">Generic Market Median</th>
                  <th className="py-3 px-4 text-right" scope="col">Patient Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredOrangeBook.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.brandName}</td>
                    <td className="py-3.5 px-4 font-mono text-sky-800">{row.saltName}</td>
                    <td className="py-3.5 px-4">{row.dosageForm}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {row.equivalenceCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {currency === 'USD' ? row.ceilingPriceUSD : row.ceilingPriceINR}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      {currency === 'USD' ? row.genericMedianUSD : row.genericMedianINR}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                      {row.savingsPercent} ({currency === 'USD' ? row.savingsUSD : row.savingsINR})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Interactive Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
          <span
            className={`material-symbols-outlined text-xl ${
              toastType === 'error' ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {toastType === 'error' ? 'cancel' : toastType === 'info' ? 'info' : 'check_circle'}
          </span>
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <PharmacopeiaModal
        isOpen={isPharmacopeiaOpen}
        onClose={() => setIsPharmacopeiaOpen(false)}
        currency={currency}
      />
      <AuditPackageModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
};
