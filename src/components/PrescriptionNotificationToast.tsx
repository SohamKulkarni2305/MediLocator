import React, { useState, useEffect } from 'react';
import { usePrescription, VerificationToast } from '../context/PrescriptionContext';

interface PrescriptionNotificationToastProps {
  onNavigateToPrescription?: () => void;
  onNavigateToAccount?: () => void;
  onInspectRx?: (rxId: string) => void;
}

export const PrescriptionNotificationToast: React.FC<PrescriptionNotificationToastProps> = ({
  onNavigateToPrescription,
  onNavigateToAccount,
  onInspectRx,
}) => {
  const { toasts, dismissToast, soundEnabled, setSoundEnabled } = usePrescription();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 right-4 sm:top-16 sm:bottom-auto z-50 flex flex-col gap-2.5 max-w-[420px] w-[calc(100vw-32px)] sm:w-full pointer-events-none"
      aria-live="assertive"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onDismiss={() => dismissToast(toast.id)}
          onNavigateToPrescription={onNavigateToPrescription}
          onNavigateToAccount={onNavigateToAccount}
          onInspectRx={onInspectRx}
        />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: VerificationToast;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onDismiss: () => void;
  onNavigateToPrescription?: () => void;
  onNavigateToAccount?: () => void;
  onInspectRx?: (rxId: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({
  toast,
  soundEnabled,
  onToggleSound,
  onDismiss,
  onNavigateToPrescription,
  onNavigateToAccount,
  onInspectRx,
}) => {
  const isApproved = toast.type === 'approved';
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = 50;
    const step = (interval / toast.durationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return Math.max(0, prev - step);
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, toast.durationMs]);

  const handleAction = () => {
    onDismiss();
    if (isApproved) {
      if (onNavigateToPrescription) {
        onNavigateToPrescription();
      } else if (onNavigateToAccount) {
        onNavigateToAccount();
      }
    } else {
      if (onNavigateToPrescription) {
        onNavigateToPrescription();
      }
    }
  };

  const handleInspect = () => {
    onDismiss();
    if (onInspectRx) {
      onInspectRx(toast.rxId);
    } else if (onNavigateToAccount) {
      onNavigateToAccount();
    }
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto rounded-2xl shadow-xl border overflow-hidden transition-all duration-300 transform translate-y-0 backdrop-blur-md ${
        isApproved
          ? 'bg-slate-900/95 text-white border-emerald-500/40 shadow-emerald-950/30 ring-1 ring-emerald-500/20'
          : 'bg-slate-900/95 text-white border-rose-500/40 shadow-rose-950/30 ring-1 ring-rose-500/20'
      }`}
    >
      {/* Header bar */}
      <div
        className={`px-3.5 py-2.5 flex items-center justify-between border-b ${
          isApproved
            ? 'bg-emerald-950/60 border-emerald-800/40 text-emerald-200'
            : 'bg-rose-950/60 border-rose-800/40 text-rose-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              isApproved ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm font-bold">
              {isApproved ? 'verified' : 'cancel'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-headline font-bold text-xs tracking-wide uppercase">
              {isApproved ? 'Prescription Approved' : 'Verification Rejected'}
            </span>
            <span className="text-[10px] opacity-70 font-mono">
              • {toast.timestamp}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleSound}
            className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
            title={soundEnabled ? 'Chime sound is active' : 'Chime muted'}
          >
            <span className="material-symbols-outlined text-sm">
              {soundEnabled ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          {/* Close Toast */}
          <button
            onClick={onDismiss}
            className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
            title="Dismiss notification"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>

      {/* Toast Body Content */}
      <div className="p-3.5 space-y-2 text-xs">
        {/* Prescription details */}
        <div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-100 text-[13px]">
              {toast.doctorName}
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              {toast.rxNumber}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            {toast.clinicName}
          </div>
        </div>

        {/* Informative message */}
        <p className="text-slate-300 text-[11.5px] leading-relaxed">
          {toast.message}
        </p>

        {/* If Rejected: highlight reason box */}
        {!isApproved && toast.reason && (
          <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/40 text-[11px] text-rose-300 flex items-start gap-1.5">
            <span className="material-symbols-outlined text-xs text-rose-400 shrink-0 mt-0.5">
              report
            </span>
            <span>
              <strong>Clinical Feedback:</strong> {toast.reason}
            </span>
          </div>
        )}

        {/* If Approved: generic medicines unlocked */}
        {isApproved && toast.medicinesSummary && (
          <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-center justify-between gap-1">
            <div className="truncate">
              <span className="font-semibold text-white">Unlocked: </span>
              <span className="opacity-90">{toast.medicinesSummary}</span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300 shrink-0">
              Save up to 85%
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/80">
          <button
            onClick={handleInspect}
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-[11px] font-medium transition cursor-pointer"
          >
            Inspect Rx
          </button>

          <button
            onClick={handleAction}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 shadow-xs ${
              isApproved
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                : 'bg-rose-500 hover:bg-rose-400 text-white'
            }`}
          >
            <span>{isApproved ? 'Refill Now' : 'Re-upload Rx'}</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Animated Countdown Progress Bar */}
      <div className="h-1 w-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full transition-all linear ${
            isApproved ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
