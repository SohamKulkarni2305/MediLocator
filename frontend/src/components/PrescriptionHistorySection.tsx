import React, { useState } from 'react';
import { Currency } from '../types';
import {
  usePrescription,
  PrescriptionRecord,
  PrescriptionStatus,
} from '../context/PrescriptionContext';

export type { PrescriptionRecord, PrescriptionStatus };

interface PrescriptionHistorySectionProps {
  currency: Currency;
  onNavigateToUpload: () => void;
  onShowToast: (msg: string) => void;
  initialSelectedRxId?: string | null;
}

export const PrescriptionHistorySection: React.FC<PrescriptionHistorySectionProps> = ({
  currency,
  onNavigateToUpload,
  onShowToast,
  initialSelectedRxId,
}) => {
  const { prescriptions, updatePrescriptionStatus, simulateStatusChange } = usePrescription();

  const [filter, setFilter] = useState<'all' | 'verified' | 'pending' | 'rejected' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRx, setSelectedRx] = useState<PrescriptionRecord | null>(() => {
    if (initialSelectedRxId) {
      return prescriptions.find((p) => p.id === initialSelectedRxId) || null;
    }
    return null;
  });
  const [customRejectReason, setCustomRejectReason] = useState<string>(
    'Incomplete doctor registration credentials and dosage exceeds CDSCO threshold'
  );
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [pendingTargetId, setPendingTargetId] = useState<string | null>(null);

  const formatCurrency = (usd: number, inr: number) => {
    return currency === 'USD' ? `$${usd.toFixed(2)}` : `₹${inr.toFixed(2)}`;
  };

  const filteredList = prescriptions.filter((item) => {
    if (filter === 'verified') {
      if (item.status !== 'verified' && item.status !== 'approved') return false;
    } else if (filter !== 'all' && item.status !== filter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDoc = item.doctorName.toLowerCase().includes(q);
      const matchClinic = item.clinicName.toLowerCase().includes(q);
      const matchFile = item.fileName.toLowerCase().includes(q);
      const matchMed = item.medicines.some(
        (m) => m.brandedName.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q)
      );
      return matchDoc || matchClinic || matchFile || matchMed;
    }
    return true;
  });

  const verifiedCount = prescriptions.filter(
    (r) => r.status === 'verified' || r.status === 'approved'
  ).length;
  const pendingCount = prescriptions.filter((r) => r.status === 'pending').length;
  const rejectedCount = prescriptions.filter((r) => r.status === 'rejected').length;
  const expiredCount = prescriptions.filter((r) => r.status === 'expired').length;

  const handleDownload = (rx: PrescriptionRecord) => {
    onShowToast(`Downloading tamper-evident digital copy of ${rx.fileName} (Audit Hash: ${rx.auditHash.slice(0, 10)}...)`);
  };

  const handleRefillAction = (rx: PrescriptionRecord) => {
    if (rx.status === 'expired') {
      onShowToast('This prescription has lapsed. Redirecting to upload renewal...');
      onNavigateToUpload();
    } else if (rx.status === 'pending') {
      onShowToast('Prescription verification in progress by tele-pharmacist. Refill will unlock upon signoff.');
    } else if (rx.status === 'rejected') {
      onShowToast('Prescription was rejected. Please re-upload a clear copy for verification.');
      onNavigateToUpload();
    } else {
      onShowToast(`Initiating refill order for ${rx.doctorName}'s verified regimen.`);
      onNavigateToUpload();
    }
  };

  const openRejectModal = (rxId: string) => {
    setPendingTargetId(rxId);
    setIsRejectModalOpen(true);
  };

  const confirmRejection = () => {
    if (pendingTargetId) {
      updatePrescriptionStatus(pendingTargetId, 'rejected', customRejectReason);
      setIsRejectModalOpen(false);
      setPendingTargetId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
              <span className="material-symbols-outlined text-lg">history_edu</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-slate-900 text-sm sm:text-base">
                Prescription History &amp; Verification Status
              </h3>
              <p className="text-[11px] text-slate-500">
                {prescriptions.length} Total uploads • {verifiedCount} Verified active • {pendingCount} Pending review
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToUpload}
            className="px-3 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
            <span>Upload New Rx</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({prescriptions.length})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
              filter === 'verified'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Verified Active ({verifiedCount})</span>
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
              filter === 'pending'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>In Review ({pendingCount})</span>
          </button>
          {rejectedCount > 0 && (
            <button
              onClick={() => setFilter('rejected')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                filter === 'rejected'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>Rejected ({rejectedCount})</span>
            </button>
          )}
          <button
            onClick={() => setFilter('expired')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filter === 'expired'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Expired ({expiredCount})
          </button>
        </div>

        {/* Search within prescriptions */}
        <div className="relative sm:w-56">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctor or drug..."
            className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Prescription Cards List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <span className="material-symbols-outlined text-3xl text-slate-400">inventory_2</span>
            <div className="text-xs font-bold text-slate-700">No prescriptions found</div>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              No previous prescription uploads match your current filter or search criteria.
            </p>
            <button
              onClick={() => {
                setFilter('all');
                setSearchQuery('');
              }}
              className="mt-1 text-xs font-semibold text-sky-700 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredList.map((rx) => {
            const isVerified = rx.status === 'verified' || rx.status === 'approved';
            const isPending = rx.status === 'pending';
            const isRejected = rx.status === 'rejected';
            const isExpired = rx.status === 'expired';

            return (
              <div
                key={rx.id}
                className={`p-3.5 sm:p-4 rounded-xl border transition bg-white space-y-3 ${
                  isRejected
                    ? 'border-rose-200 bg-rose-50/20'
                    : isPending
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200 hover:border-sky-300 hover:shadow-xs'
                }`}
              >
                {/* Top Row: File icon, Title, Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                        isVerified
                          ? 'bg-emerald-100 text-emerald-800'
                          : isPending
                          ? 'bg-amber-100 text-amber-800'
                          : isRejected
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {rx.source === 'camera'
                          ? 'photo_camera'
                          : rx.source === 'abha_sync'
                          ? 'cloud_done'
                          : 'description'}
                      </span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {rx.doctorName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          • {rx.rxNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-1">
                        <span>{rx.clinicName}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-[10px] text-slate-400">{rx.sourceLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Status Pill */}
                  <div className="shrink-0 flex items-center gap-1">
                    {isVerified && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px] flex items-center gap-1 shadow-2xs">
                        <span className="material-symbols-outlined text-xs text-emerald-600">verified</span>
                        <span>Verified Active</span>
                      </span>
                    )}
                    {isPending && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px] flex items-center gap-1 shadow-2xs animate-pulse">
                        <span className="material-symbols-outlined text-xs text-amber-600">
                          hourglass_top
                        </span>
                        <span>Pending Review</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-bold text-[10px] flex items-center gap-1 shadow-2xs">
                        <span className="material-symbols-outlined text-xs text-rose-600">cancel</span>
                        <span>Verification Rejected</span>
                      </span>
                    )}
                    {isExpired && (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold text-[10px] flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-slate-400">event_busy</span>
                        <span>Expired</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Prescribed Medications & Generic Mapping Sub-table */}
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Prescribed Medicines ({rx.medicines.length})</span>
                    <span>Mapped Generic Bioequivalent</span>
                  </div>

                  {rx.medicines.map((med) => (
                    <div key={med.id} className="flex items-center justify-between gap-2 pt-0.5">
                      <div className="truncate">
                        <strong className="text-slate-800">{med.brandedName}</strong>
                        <span className="text-slate-500 text-[10px] ml-1">({med.dosage})</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-emerald-700 font-medium truncate max-w-[160px] sm:max-w-[240px] inline-block">
                          {med.genericName.split('(')[0]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status Notice for Pending Status with Simulator triggers */}
                {isPending && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-1 text-amber-950 font-bold">
                        <span className="material-symbols-outlined text-sm text-amber-700">schedule</span>
                        <span>Awaiting Clinical Tele-Pharmacist Signoff</span>
                      </div>
                      <span className="text-[10px] text-amber-800 font-mono">
                        Schedule H1 • Est. 5-10 mins
                      </span>
                    </div>

                    <p className="text-[11px] text-amber-900 leading-snug">
                      Test the notification toast system by simulating the pharmacist's verification status decision:
                    </p>

                    {/* Simulation buttons that transition pending -> approved or rejected */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <button
                        onClick={() => updatePrescriptionStatus(rx.id, 'approved')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] transition shadow-2xs flex items-center gap-1 cursor-pointer"
                        title="Simulate pharmacist approval and trigger notification toast"
                      >
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        <span>Simulate Approval (Toast)</span>
                      </button>

                      <button
                        onClick={() => openRejectModal(rx.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] transition shadow-2xs flex items-center gap-1 cursor-pointer"
                        title="Simulate pharmacist rejection and trigger notification toast"
                      >
                        <span className="material-symbols-outlined text-xs">cancel</span>
                        <span>Simulate Rejection (Toast)</span>
                      </button>

                      <button
                        onClick={() => {
                          onShowToast('Simulating tele-pharmacist review... Notification toast will fire in 3s!');
                          simulateStatusChange(rx.id, 'approved', 3);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-[11px] transition shadow-2xs flex items-center gap-1 cursor-pointer"
                        title="Simulate review after 3 seconds delay"
                      >
                        <span className="material-symbols-outlined text-xs">timer</span>
                        <span>Auto-Review in 3s</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* If Rejected: explain rejection reason and offer re-upload / reset */}
                {isRejected && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-rose-900 font-bold">
                      <span className="material-symbols-outlined text-base text-rose-700">error</span>
                      <span>Verification Audit Not Passed</span>
                    </div>
                    <p className="text-[11.5px] text-rose-950">
                      <strong>Rejection Reason:</strong>{' '}
                      {rx.rejectionReason || 'Incomplete doctor registration credentials or unclear dosage units'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={onNavigateToUpload}
                        className="px-3 py-1 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">upload_file</span>
                        <span>Re-upload New Prescription</span>
                      </button>

                      <button
                        onClick={() => updatePrescriptionStatus(rx.id, 'pending')}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
                        title="Reset to pending to test approval/rejection toast again"
                      >
                        Reset to Pending
                      </button>
                    </div>
                  </div>
                )}

                {/* Status description & verification timeline bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400 font-mono text-[10px]">
                      Uploaded: {rx.uploadDate} ({rx.uploadTimestamp})
                    </span>
                    {rx.daysRemaining !== null && rx.daysRemaining > 0 && (
                      <span className="bg-sky-50 text-sky-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-sky-200">
                        {rx.daysRemaining} days valid
                      </span>
                    )}
                    {rx.refillsRemaining > 0 && (
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                        {rx.refillsRemaining} of {rx.refillsAllowed} Refills left
                      </span>
                    )}
                    {/* If this was rx-hist-3 and is now approved, allow reset to test again */}
                    {rx.id === 'rx-hist-3' && isVerified && (
                      <button
                        onClick={() => updatePrescriptionStatus(rx.id, 'pending')}
                        className="text-[10px] text-sky-700 hover:underline font-mono ml-1 cursor-pointer"
                        title="Reset back to pending so you can trigger the notification toast again"
                      >
                        [Reset to Pending for Testing]
                      </button>
                    )}
                  </div>

                  {/* Actions for this item */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      onClick={() => setSelectedRx(rx)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center gap-1"
                      title="Inspect full medical audit & optical details"
                    >
                      <span className="material-symbols-outlined text-xs">visibility</span>
                      <span>Inspect Rx</span>
                    </button>

                    <button
                      onClick={() => handleDownload(rx)}
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                      title="Download tamper-proof copy"
                    >
                      <span className="material-symbols-outlined text-base">download</span>
                    </button>

                    <button
                      onClick={() => handleRefillAction(rx)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs flex items-center gap-1 ${
                        isVerified
                          ? 'bg-sky-700 hover:bg-sky-800 text-white'
                          : isPending
                          ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                          : isRejected
                          ? 'bg-rose-100 text-rose-900 hover:bg-rose-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>
                        {isVerified
                          ? 'Refill Now'
                          : isPending
                          ? 'Track Review'
                          : isRejected
                          ? 'Re-upload'
                          : 'Renew Rx'}
                      </span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Regulatory Compliance Footer Note */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sky-600 text-sm">lock</span>
          <span>Prescription vault encrypted under 21 CFR Part 11 &amp; NDHM ABHA Health Records Architecture</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">SHA-256 Immutability</span>
      </div>

      {/* REJECTION REASON SELECTION MODAL */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-700">
                <span className="material-symbols-outlined">report_problem</span>
                <h4 className="font-headline font-bold text-slate-900 text-sm">
                  Simulate Pharmacist Rejection
                </h4>
              </div>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Select the clinical audit reason for rejecting this pending prescription. This will update its status to <strong>rejected</strong> and alert the patient via the notification toast system.
            </p>

            <div className="space-y-2 text-xs">
              {[
                'Incomplete doctor registration credentials and dosage exceeds CDSCO threshold',
                'Document image is blurry or doctor signature cannot be optically authenticated',
                'Prescription date exceeds 3-month legal validity limit under Drugs & Cosmetics Act',
                'Schedule X controlled substance not supported for remote generic dispensing',
              ].map((reasonOption) => (
                <label
                  key={reasonOption}
                  className="flex items-start gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition text-[11.5px]"
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    checked={customRejectReason === reasonOption}
                    onChange={() => setCustomRejectReason(reasonOption)}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-slate-700">{reasonOption}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejection}
                className="px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">cancel</span>
                <span>Confirm Rejection &amp; Trigger Alert</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRESCRIPTION INSPECTION MODAL */}
      {selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                    selectedRx.status === 'rejected'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-sky-100 text-sky-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {selectedRx.status === 'rejected' ? 'cancel' : 'verified_user'}
                  </span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-slate-900 text-sm">
                    {selectedRx.status === 'rejected'
                      ? 'Rejected Prescription Record'
                      : 'Verified Digital Prescription Record'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {selectedRx.rxNumber} • {selectedRx.fileName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRx(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Status Banner */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  selectedRx.status === 'verified' || selectedRx.status === 'approved'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : selectedRx.status === 'pending'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : selectedRx.status === 'rejected'
                    ? 'bg-rose-50 border-rose-200 text-rose-950'
                    : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">
                    {selectedRx.status === 'verified' || selectedRx.status === 'approved'
                      ? 'task_alt'
                      : selectedRx.status === 'pending'
                      ? 'pending_actions'
                      : selectedRx.status === 'rejected'
                      ? 'error'
                      : 'event_busy'}
                  </span>
                  <div>
                    <div className="font-bold text-xs">{selectedRx.statusLabel}</div>
                    <div className="text-[11px] opacity-90">{selectedRx.statusDescription}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono font-bold bg-white/70 px-2 py-0.5 rounded border border-black/10">
                    OCR: {selectedRx.ocrConfidence}%
                  </span>
                </div>
              </div>

              {/* If Rejected: callout */}
              {selectedRx.status === 'rejected' && selectedRx.rejectionReason && (
                <div className="p-3 bg-rose-100/60 rounded-xl border border-rose-300 text-xs text-rose-900 space-y-1">
                  <div className="font-bold flex items-center gap-1 text-rose-800">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    <span>Audit Discrepancy Flagged</span>
                  </div>
                  <p className="text-[11px]">{selectedRx.rejectionReason}</p>
                </div>
              )}

              {/* Prescriber & Hospital Details */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>Prescribing Practitioner</span>
                  <span className="text-[10px] font-mono text-slate-500">{selectedRx.doctorReg}</span>
                </div>
                <div className="text-slate-800 font-semibold">{selectedRx.doctorName}</div>
                <div className="text-slate-500 text-[11px]">{selectedRx.doctorSpecialty}</div>
                <div className="text-slate-600 text-[11px]">
                  {selectedRx.clinicName}, {selectedRx.clinicLocation}
                </div>
              </div>

              {/* Prescribed Medicines with Generic Savings */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                  Prescription Line Items:
                </div>
                {selectedRx.medicines.map((med, idx) => (
                  <div
                    key={med.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {idx + 1}. {med.brandedName}
                      </span>
                      <span className="text-emerald-700 font-bold text-[11px]">
                        Save {formatCurrency(med.genericSavingsUSD, med.genericSavingsINR)}
                      </span>
                    </div>
                    <div className="text-[11px] text-sky-900 font-medium">
                      Generic: {med.genericName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Dosage: {med.dosage} • Duration: {med.duration}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pharmacist Signoff Box if available */}
              {selectedRx.pharmacistSignoff && (
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs space-y-1">
                  <div className="flex items-center gap-1 text-emerald-900 font-bold">
                    <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
                    <span>Chief Pharmacist Validation &amp; Signoff</span>
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    Verified by: <strong>{selectedRx.pharmacistSignoff.name}</strong>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-700">
                    Reg: {selectedRx.pharmacistSignoff.license} • Signed at: {selectedRx.pharmacistSignoff.timestamp}
                  </div>
                </div>
              )}

              {/* Technical Audit Hash */}
              <div className="p-2.5 bg-slate-100 rounded-xl font-mono text-[10px] text-slate-500 space-y-0.5">
                <div className="flex justify-between">
                  <span>Cryptographic Audit Stamp:</span>
                  <span className="text-slate-700 font-bold">SHA-256</span>
                </div>
                <div className="text-slate-800 truncate">{selectedRx.auditHash}</div>
                <div className="text-slate-400 text-[9px]">
                  Uploaded on {selectedRx.uploadDate} via {selectedRx.sourceLabel}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => handleDownload(selectedRx)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Download PDF</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedRx(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedRx(null);
                    handleRefillAction(selectedRx);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <span>
                    {selectedRx.status === 'verified' || selectedRx.status === 'approved'
                      ? 'Order Refill'
                      : selectedRx.status === 'rejected'
                      ? 'Re-upload Rx'
                      : 'Proceed'}
                  </span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
