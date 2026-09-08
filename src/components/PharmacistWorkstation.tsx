import React, { useState, useEffect } from 'react';
import { Currency, PharmacistCase } from '../types';
import { PHARMACIST_CASES } from '../data/mockData';
import { usePrescription } from '../context/PrescriptionContext';

interface PharmacistWorkstationProps {
  currency: Currency;
  onNavigateToTracking?: () => void;
  onNavigateToAdmin?: () => void;
}

export const PharmacistWorkstation: React.FC<PharmacistWorkstationProps> = ({
  currency,
  onNavigateToTracking,
  onNavigateToAdmin,
}) => {
  const { updatePrescriptionStatus } = usePrescription();
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [attestationChecked, setAttestationChecked] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isInverted, setIsInverted] = useState(false);
  const [slaSeconds, setSlaSeconds] = useState(504); // 8m 24s
  const [caseDecisions, setCaseDecisions] = useState<
    Record<string, { status: 'approved' | 'rejected'; reason?: string; timestamp: string }>
  >({});
  const [rejectReason, setRejectReason] = useState('BLURRY_IMAGE');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const activeCase: PharmacistCase = PHARMACIST_CASES[activeCaseIndex];
  const currentDecision = caseDecisions[activeCase.id];

  useEffect(() => {
    const timer = setInterval(() => {
      setSlaSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSla = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} mins`;
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleApprove = () => {
    if (!attestationChecked) {
      showToast('Please check the Schedule H Regulatory Compliance Attestation.', 'error');
      return;
    }
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setCaseDecisions((prev) => ({
      ...prev,
      [activeCase.id]: {
        status: 'approved',
        timestamp,
      },
    }));
    // Sync with patient's prescription status to trigger notification toast
    updatePrescriptionStatus('rx-hist-3', 'approved');
    showToast('Prescription Approved & Dispatched to Store Dispense. Tamper seal generated.', 'success');
  };

  const handleReject = () => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setCaseDecisions((prev) => ({
      ...prev,
      [activeCase.id]: {
        status: 'rejected',
        reason: rejectReason,
        timestamp,
      },
    }));
    const reasonMap: Record<string, string> = {
      BLURRY_IMAGE: 'Document optical capture is blurry or signature is unreadable',
      EXPIRED_DATE: 'Prescription valid cycle has exceeded legal 30-day duration',
      CONTROLLED_SUBSTANCE: 'Schedule X medicine requires physical paper verification at dispensing counter',
      INCOMPLETE_REGISTRATION: 'Doctor registration credentials could not be verified in MCI/NMC registry',
    };
    // Sync with patient's prescription status to trigger notification toast
    updatePrescriptionStatus('rx-hist-3', 'rejected', reasonMap[rejectReason] || rejectReason);
    showToast(`Prescription rejected with code "${rejectReason}". Patient notified for re-upload.`, 'error');
  };

  const handleUndoDecision = () => {
    setCaseDecisions((prev) => {
      const updated = { ...prev };
      delete updated[activeCase.id];
      return updated;
    });
    // Reset to pending so it can be verified or rejected again
    updatePrescriptionStatus('rx-hist-3', 'pending');
    showToast(`Decision reverted for ${activeCase.caseNumber}. Returned to pending review.`, 'info');
  };

  // Calculation for financial totals
  const totalBranded = activeCase.lineItems.reduce(
    (sum, item) => sum + (currency === 'USD' ? item.brandedPriceUSD : item.brandedPriceINR),
    0
  );
  const totalGeneric = activeCase.lineItems.reduce(
    (sum, item) => sum + (currency === 'USD' ? item.genericPriceUSD : item.genericPriceINR),
    0
  );
  const directSavings = totalBranded - totalGeneric;
  const savingsPct = totalBranded > 0 ? Math.round((directSavings / totalBranded) * 1000) / 10 : 0;

  return (
    <div className="bg-slate-100 text-slate-800 font-sans antialiased min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-10 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-shrink-0">
            <img
              alt="MediLocator Logo"
              className="h-9 w-auto object-contain cursor-pointer"
              src="https://lh3.googleusercontent.com/aida/AEtjO1WgVrbcaHR67UvcdyK0IZss2VgcPCgfUPUPDQJHaZkvGSMdc3uvBxk7kfFdb243EElFTSg3dQnV79jzYNSJaD9ASvSnqsC9LVdKcgrZ3MeQGgLKiIYAVAM1zOBLHAiczaYxaysDBJSjU8HPwexh2r741-7ZMrXRFYp3eLVf8tXkw1Se2bujFNWBMeH_Rr_Z72S5DjLjtCHT5c0SNz_Rvv3Ml_YcAEPAQbJVCTdPsbHHXDIZll7wUc-swtQ-"
              onClick={onNavigateToAdmin}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="hidden lg:block h-6 w-px bg-slate-200"></div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 leading-none font-headline">
                CLINICAL PHARMACIST DISPENSING WORKSTATION
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Federal Verification Terminal • HIPAA &amp; 21 CFR Part 11 Validated
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-700 font-medium">Dispensary Node #104 - MetroCare Pharmacy</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden xl:block w-64">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Search Rx ID, Patient MRN, or Doctor..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-200/60 px-1 py-0.5 rounded">
                ⌘K
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <img
                alt="Dr. Sarah Jenkins, PharmD"
                className="h-9 w-9 rounded-full object-cover ring-2 ring-sky-600/20"
                src="https://lh3.googleusercontent.com/aida/AEtjO1WOTdyUKFhbuUDdfbKOwbEEPBM_jnGZ18bhuvhIbkoFTrd6nOMSLztnqtjZVnXQUjvHmRvE8imPkDTWmi9A6EI-Ynyc8MdQ9RhSvIWO85h97J3KZHCK1wnfT34kesULQ63Ixr7DnQJAyGnT5EsP9DFUg5cYW4HYn6ro_m4TuUOIklKHno5ou3uTqVnO2Y2DVwVTstdRp3zjHD7q7P6itb6xKh9Tpd4lL2ItMtmtyhaA_6en0ClxvxIsmOU"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">Dr. Sarah Jenkins, PharmD</span>
                <span className="text-[11px] font-mono text-sky-700">RPH-LIC-44910</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-strip with Session Mode & Quick Navigation */}
        <div className="bg-slate-50/80 border-t border-slate-100 px-4 sm:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            {onNavigateToAdmin && (
              <button
                onClick={onNavigateToAdmin}
                className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md transition shadow-2xs cursor-pointer"
                title="Return to Master Regulatory Console"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Back to Admin Console</span>
              </button>
            )}
            <div className="flex items-center gap-1.5 text-sky-700 font-medium">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span>Active Session Mode: Live Audit</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            {currentDecision && (
              <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase flex items-center gap-1 ${
                currentDecision.status === 'approved'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}>
                <span className="material-symbols-outlined text-xs">
                  {currentDecision.status === 'approved' ? 'check_circle' : 'cancel'}
                </span>
                Case {activeCase.caseNumber}: {currentDecision.status}
              </span>
            )}
            <span>Node: 104-NYC-MIDTOWN • Connection: Encrypted TLS 1.3</span>
          </div>
        </div>
      </header>

      {/* Main Workstation Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* CASE HEADER BANNER */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Col 1: Case File */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CASE FILE</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                URGENT REVIEW
              </span>
              <span className="text-[10px] text-slate-400">Uploaded 6m ago</span>
            </div>
            <h2 className="font-headline font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
              {activeCase.caseNumber}
            </h2>
            <div className="text-xs text-sky-700 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">medical_services</span>
              <span>{activeCase.condition}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400">Source: Mobile Patient Portal (Encrypted S3)</div>
          </div>

          {/* Col 2: Patient Profile */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PATIENT PROFILE</span>
              <span className="text-[10px] font-mono text-slate-500">MRN: {activeCase.mrn}</span>
            </div>
            <div className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <span>{activeCase.patientName}</span>
              <span className="text-xs text-slate-500 font-normal">
                {activeCase.patientAge}y / {activeCase.patientGender}
              </span>
            </div>
            <div className="text-xs text-slate-600 flex items-center gap-3">
              <span>BP: <strong className="text-slate-800">{activeCase.bp}</strong></span>
              <span>HbA1c: <strong className="text-slate-800">{activeCase.hba1c}</strong></span>
            </div>
            <div className="text-[11px] text-rose-700 font-medium">
              Allergies: <span>{activeCase.allergies}</span>
            </div>
          </div>

          {/* Col 3: Licensed Prescriber */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">LICENSED PRESCRIBER</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Schedule H Rx Verified
              </span>
            </div>
            <div className="font-bold text-slate-900 text-sm">
              {activeCase.prescriberName}
            </div>
            <div className="text-xs text-slate-600">
              {activeCase.clinicName} • {activeCase.prescriberDegree}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
              <span>Reg: <strong className="font-mono text-slate-700">{activeCase.prescriberReg}</strong></span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-xs">verified</span> State Med Council Active
              </span>
            </div>
          </div>

          {/* Col 4: Workstation Telemetry & SLA Timer */}
          <div className="space-y-2 bg-amber-50/60 border border-amber-200/80 rounded-lg p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold uppercase tracking-wider text-amber-900">WORKSTATION TELEMETRY</span>
              <span className="font-mono text-[10px] bg-sky-100 text-sky-800 px-1 rounded">21 CFR Part 11 Active</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="material-symbols-outlined text-amber-600 text-base">timer</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-amber-800">SLA WINDOW REMAINING</span>
                <span className="font-mono font-extrabold text-amber-950 text-xl tracking-tight">
                  {formatSla(slaSeconds)}
                </span>
              </div>
            </div>
            <div className="text-[10px] text-amber-800 font-medium flex justify-between">
              <span>Target &lt; 15m TAT</span>
              <span className="font-bold text-emerald-700">98.4% On-Track</span>
            </div>
          </div>
        </div>

        {/* WORKSTATION GRID: 2 COLUMNS (50% / 50%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (6 Cols): Prescription Raw Ingest & OCR */}
          <div className="lg:col-span-6 space-y-4">
            {/* Prescription Raw Ingest Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sky-400 text-lg">document_scanner</span>
                  <span className="font-headline font-bold text-xs tracking-wide">
                    PRESCRIPTION RAW INGEST (300 DPI MULTI-BAND)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                    title="Zoom Out"
                  >
                    <span className="material-symbols-outlined text-sm">zoom_out</span>
                  </button>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                    title="Zoom In"
                  >
                    <span className="material-symbols-outlined text-sm">zoom_in</span>
                  </button>
                  <button
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                    title="Rotate"
                  >
                    <span className="material-symbols-outlined text-sm">rotate_right</span>
                  </button>
                  <button
                    onClick={() => setIsInverted((i) => !i)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 transition ${
                      isInverted ? 'bg-sky-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                    title="Toggle Invert"
                  >
                    <span className="material-symbols-outlined text-xs">contrast</span>
                    <span>Invert</span>
                  </button>
                  <button
                    onClick={() => {
                      setZoomLevel(1);
                      setRotation(0);
                      setIsInverted(false);
                    }}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                    title="Reset Viewer"
                  >
                    <span className="material-symbols-outlined text-sm">fullscreen</span>
                  </button>
                </div>
              </div>

              {/* Prescription Document Canvas */}
              <div className="p-6 bg-slate-100 flex items-center justify-center overflow-hidden min-h-[380px]">
                <div
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    filter: isInverted ? 'invert(1) hue-rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease, filter 0.2s ease',
                  }}
                  className="bg-white border border-slate-300 rounded-lg p-6 max-w-md w-full shadow-md text-slate-800 font-sans space-y-4 select-none"
                >
                  {/* Clinic Header */}
                  <div className="border-b-2 border-slate-800 pb-3 flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded bg-sky-900 text-white flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-base">local_hospital</span>
                      </div>
                      <div>
                        <h3 className="font-headline font-bold text-slate-900 text-sm leading-tight">
                          {activeCase.clinicName}
                        </h3>
                        <p className="text-[10px] text-slate-500">{activeCase.clinicAddress}</p>
                        <p className="text-[10px] font-mono text-slate-500">{activeCase.clinicLicense}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase text-slate-400">DATE</div>
                      <div className="text-xs font-bold text-slate-800">Sep 06, 2026</div>
                    </div>
                  </div>

                  {/* Patient Info Bar */}
                  <div className="bg-slate-50 p-2 rounded border border-slate-200 flex items-center justify-between text-xs text-slate-700">
                    <div>
                      Pt: <strong className="text-slate-900">{activeCase.patientName}</strong>, {activeCase.patientAge}/M
                    </div>
                    <div>BP: <strong>{activeCase.bp}</strong></div>
                    <div>HbA1c: <strong>{activeCase.hba1c}</strong></div>
                  </div>

                  {/* Rx Symbol and Items */}
                  <div className="space-y-3 pt-1">
                    <div className="font-serif italic font-extrabold text-2xl text-sky-900 leading-none">℞</div>

                    <div className="pl-3 space-y-3 border-l-2 border-sky-600/40">
                      {activeCase.lineItems.map((item, idx) => (
                        <div key={item.id} className="text-xs space-y-0.5">
                          <div className="font-bold text-slate-900">
                            {idx + 1}. Tab. {item.brandedName}
                          </div>
                          <div className="text-slate-600 italic text-[11px]">
                            Sig: {item.dosageInstructions}
                          </div>
                          <div className="text-[10px] font-mono text-sky-700">
                            Qty: {item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Signatures & Stamps */}
                  <div className="pt-4 border-t border-slate-200 flex items-end justify-between">
                    <div className="border border-sky-400/80 bg-sky-50/60 rounded px-2.5 py-1 text-center rotate-[-3deg]">
                      <div className="text-[9px] font-bold uppercase text-sky-900 tracking-wider">STATE MEDICAL COUNCIL</div>
                      <div className="text-[10px] font-extrabold text-sky-800">★ VERIFIED #88219 ★</div>
                    </div>

                    <div className="text-right">
                      <div className="font-serif italic font-bold text-sm text-slate-800">
                        {activeCase.prescriberName.replace('Dr. ', '')}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-900">{activeCase.prescriberName}</div>
                      <div className="text-[9px] text-slate-500">{activeCase.prescriberDegree}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* OCR Autonomous Diagnostics Engine */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sky-600 text-lg">smart_toy</span>
                  <h3 className="font-headline font-bold text-slate-900 text-xs tracking-wide uppercase">
                    OCR Autonomous Diagnostics Engine
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  99.2% Accuracy Match
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeCase.molecules.map((mol, idx) => (
                  <div key={mol.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                        MOLECULE 0{idx + 1} DETECTED
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                        {mol.confidence}% Confidence
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs">{mol.name}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{mol.drugClass}</div>
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 pt-1">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      <span>{mol.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (6 Cols): Active Line Item Reconciliation & Substitution Engine */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-headline font-bold text-slate-900 text-sm">
                    ACTIVE LINE ITEM RECONCILIATION &amp; SUBSTITUTION ENGINE
                  </h3>
                  <p className="text-xs text-slate-500">
                    Compare Prescribed Branded Request vs. Available WHO-GMP Bioequivalent Inventory
                  </p>
                </div>
                <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2.5 py-1 rounded">
                  2 of 2 Auto-Matched
                </span>
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                {activeCase.lineItems.map((item, idx) => (
                  <div key={item.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sky-600 text-base">check_box</span>
                        <span className="font-bold text-xs text-slate-900">
                          Line Item #{idx + 1}: {item.genericName}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">verified</span>
                        100% Bioequivalent API Match ({item.equivalenceCode})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Doctor Prescribed (Branded) */}
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                        <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                          DOCTOR PRESCRIBED (BRANDED)
                        </div>
                        <div className="font-bold text-slate-700 line-through text-sm">
                          {item.brandedName}
                        </div>
                        <div className="text-[11px] text-slate-500">{item.brandedManufacturer}</div>
                        <div className="text-xs text-slate-500 line-through pt-1">
                          MRP: {currency === 'USD' ? `$${item.brandedPriceUSD.toFixed(2)}` : `₹${item.brandedPriceINR.toFixed(2)}`}
                        </div>
                      </div>

                      {/* Dispensing Generic Equivalent */}
                      <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold">
                            DISPENSING GENERIC EQUIVALENT
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                            FDA Approved
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 text-sm">{item.genericName}</div>
                        <div className="text-[11px] text-slate-600">{item.genericManufacturer}</div>
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="font-headline font-extrabold text-slate-900 text-sm">
                            {currency === 'USD' ? `$${item.genericPriceUSD.toFixed(2)}` : `₹${item.genericPriceINR.toFixed(2)}`}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                            Patient Saves {currency === 'USD' ? `$${(item.brandedPriceUSD - item.genericPriceUSD).toFixed(2)}` : `₹${(item.brandedPriceINR - item.genericPriceINR).toFixed(2)}`} (
                            -{Math.round(((item.brandedPriceUSD - item.genericPriceUSD) / item.brandedPriceUSD) * 100)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 font-mono border-t border-slate-200">
                      <span>Lot: <strong className="text-slate-700">{item.lotNumber}</strong></span>
                      <span>Exp: <strong className="text-slate-700">{item.expiryDate}</strong></span>
                      <span>Dispense: <strong className="text-slate-800">{item.quantity}</strong></span>
                    </div>
                  </div>
                ))}

                {/* Financial Reconciliation Summary */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      FINANCIAL RECONCILIATION SUMMARY
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Direct Savings: {currency === 'USD' ? `$${directSavings.toFixed(2)}` : `₹${directSavings.toFixed(2)}`} ({savingsPct}%)
                    </span>
                  </div>

                  <div className="space-y-1 text-xs pt-1">
                    <div className="flex justify-between text-slate-500">
                      <span>Branded Cumulative Total:</span>
                      <span className="font-mono line-through">
                        {currency === 'USD' ? `$${totalBranded.toFixed(2)}` : `₹${totalBranded.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 text-sm">
                      <span>Bioequivalent Generic Total:</span>
                      <span className="font-mono text-emerald-700">
                        {currency === 'USD' ? `$${totalGeneric.toFixed(2)}` : `₹${totalGeneric.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  {/* Savings Visual Bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${savingsPct}%` }}></div>
                  </div>
                </div>

                {/* Schedule H Attestation */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attestationChecked}
                      onChange={(e) => setAttestationChecked(e.target.checked)}
                      className="mt-0.5 rounded border-amber-400 text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    <div className="text-xs text-amber-950">
                      <span className="font-bold block uppercase tracking-wide text-[11px] text-amber-900">
                        SCHEDULE H REGULATORY COMPLIANCE ATTESTATION:
                      </span>
                      <p className="mt-0.5 text-slate-700 leading-relaxed text-[11px]">
                        I, <strong>Dr. Sarah Jenkins (PharmD #PH-99214)</strong>, certify that I have verified the active salt formulation, strength, and valid practitioner prescription in accordance with Drug Regulatory Norms 2026.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Action Buttons & Decision Card */}
                <div className="space-y-3 pt-2">
                  {currentDecision ? (
                    <div
                      className={`p-4 rounded-xl border space-y-3 animate-in fade-in slide-in-from-top-2 ${
                        currentDecision.status === 'approved'
                          ? 'bg-emerald-50/90 border-emerald-300'
                          : 'bg-rose-50/90 border-rose-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`material-symbols-outlined text-2xl ${
                              currentDecision.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {currentDecision.status === 'approved' ? 'check_circle' : 'cancel'}
                          </span>
                          <div>
                            <div
                              className={`font-bold text-sm leading-tight ${
                                currentDecision.status === 'approved' ? 'text-emerald-950' : 'text-rose-950'
                              }`}
                            >
                              {currentDecision.status === 'approved'
                                ? 'Prescription Approved & Dispatched'
                                : 'Prescription Rejected'}
                            </div>
                            <div
                              className={`text-[11px] mt-0.5 ${
                                currentDecision.status === 'approved' ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {currentDecision.status === 'approved'
                                ? 'Tamper seal generated • Transferred to Store Dispense'
                                : `Code: ${currentDecision.reason || 'BLURRY_IMAGE'} • Patient notified for re-upload`}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            currentDecision.status === 'approved'
                              ? 'bg-emerald-200/80 text-emerald-900 border border-emerald-300'
                              : 'bg-rose-200/80 text-rose-900 border border-rose-300'
                          }`}
                        >
                          {currentDecision.status}
                        </span>
                      </div>

                      <div className="p-2.5 bg-white/90 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-700 flex flex-wrap items-center justify-between gap-2">
                        <span>Logged at: {currentDecision.timestamp} EST</span>
                        <span className="text-slate-500">Dual-Signoff: Verified</span>
                        {currentDecision.status === 'approved' && (
                          <span className="text-emerald-700 font-bold">Tamper Seal: #TM-9921-A</span>
                        )}
                      </div>

                      {/* Primary Back Button and Queue Navigation */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <button
                          onClick={handleUndoDecision}
                          className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-100 border-2 border-slate-300 hover:border-slate-400 text-slate-800 rounded-lg font-bold text-xs shadow-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Undo this decision and return prescription to review state"
                        >
                          <span className="material-symbols-outlined text-base text-slate-700">arrow_back</span>
                          <span>Back / Undo Decision</span>
                        </button>

                        {currentDecision.status === 'approved' && onNavigateToTracking ? (
                          <button
                            onClick={onNavigateToTracking}
                            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>Track Live Delivery</span>
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const nextIdx = (activeCaseIndex + 1) % PHARMACIST_CASES.length;
                              setActiveCaseIndex(nextIdx);
                            }}
                            className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs shadow-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>Next Queue Case</span>
                            <span className="material-symbols-outlined text-sm">queue</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleApprove}
                        className="w-full py-3 rounded-lg text-sm font-bold text-white shadow-sm transition flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        <span>Approve Prescription &amp; Dispatch to Store Dispense</span>
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          onClick={() => showToast('Generic substitution editor opened for alternate manufacturer.', 'info')}
                          className="py-2 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition inline-flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">swap_horiz</span>
                          <span>Modify Generic Match</span>
                        </button>

                        <select
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="py-2 px-2 text-xs font-mono text-slate-700 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
                        >
                          <option value="BLURRY_IMAGE">BLURRY_IMAGE</option>
                          <option value="EXPIRED_RX">EXPIRED_RX</option>
                          <option value="MISSING_DOCTOR_STAMP">MISSING_DOCTOR_STAMP</option>
                          <option value="SALT_INCOMPATIBLE">SALT_INCOMPATIBLE</option>
                        </select>

                        <button
                          onClick={handleReject}
                          className="py-2 px-3 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition inline-flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">cancel</span>
                          <span>Reject</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FIFO VERIFICATION STREAM (STAGING QUEUE) */}
        <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-600 text-lg">queue</span>
              <h3 className="font-headline font-bold text-slate-900 text-sm">
                FIFO VERIFICATION STREAM (STAGING QUEUE)
              </h3>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {PHARMACIST_CASES.length} Cases Waiting
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Dual Pharmacist Signoff Required for Narcotics • Auto-Assigned by SLA Urgency
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PHARMACIST_CASES.map((item, idx) => {
              const isCurrent = idx === activeCaseIndex;
              const decision = caseDecisions[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveCaseIndex(idx);
                  }}
                  className={`p-3.5 rounded-lg border text-xs cursor-pointer transition flex flex-col justify-between gap-2 ${
                    isCurrent
                      ? 'border-sky-500 bg-sky-50/60 shadow-xs ring-1 ring-sky-500/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{item.caseNumber}</span>
                    <span
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        idx === 0
                          ? 'bg-rose-100 text-rose-800'
                          : idx === 1
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {Math.floor(item.slaRemainingSeconds / 60)}m SLA
                    </span>
                  </div>

                  <div>
                    <div className="font-semibold text-slate-800">
                      {item.patientName} ({item.patientAge}{item.patientGender === 'Male' ? 'M' : 'F'})
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {item.lineItems[0]?.genericName}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          decision?.status === 'approved'
                            ? 'bg-emerald-500'
                            : decision?.status === 'rejected'
                            ? 'bg-rose-500'
                            : item.status === 'Ready for Match'
                            ? 'bg-sky-500'
                            : item.status === 'OCR Processing'
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                      ></span>
                      <span className="text-slate-600 font-medium">
                        {decision ? (decision.status === 'approved' ? 'Approved & Dispatched' : 'Rejected') : item.status}
                      </span>
                    </div>

                    {decision && (
                      <span className="text-[10px] text-sky-600 font-semibold hover:underline">
                        Review / Back
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Interactive Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
          <span
            className={`material-symbols-outlined text-xl ${
              notification.type === 'error' ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {notification.type === 'error' ? 'cancel' : 'check_circle'}
          </span>
          <span className="text-xs font-medium">{notification.message}</span>
        </div>
      )}
    </div>
  );
};
