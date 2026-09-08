import React, { useState, useEffect } from 'react';
import { Currency } from '../types';
import { INITIAL_ORDER_TRACKING } from '../data/mockData';
import { InvoiceModal } from './Modals';
import { CustomerBottomNav } from './CustomerBottomNav';

interface CustomerTrackingProps {
  currency: Currency;
  onNavigateToSearch: () => void;
  onNavigateToWorkstation?: () => void;
  onNavigateToPrescription?: () => void;
  onNavigateToAccount?: () => void;
}

export const CustomerTracking: React.FC<CustomerTrackingProps> = ({
  currency,
  onNavigateToSearch,
  onNavigateToWorkstation,
  onNavigateToPrescription,
  onNavigateToAccount,
}) => {
  const [tracking] = useState(INITIAL_ORDER_TRACKING);
  const [distance, setDistance] = useState(450);
  const [temperature, setTemperature] = useState(4.0);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);

  // Live courier telemetry simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setDistance((prev) => (prev > 100 ? prev - 15 : 450));
      setTemperature((prev) => {
        const delta = (Math.random() - 0.5) * 0.1;
        return Number((prev + delta).toFixed(1));
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans pb-16">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-10 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onNavigateToSearch}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <span className="material-symbols-outlined text-sm">home</span>
            <span>Home</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-slate-900">{tracking.orderId}</span>
            </div>

            <button
              onClick={onNavigateToAccount}
              className="w-7 h-7 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center cursor-pointer transition shadow-2xs ml-1"
              title="Patient Profile & Health Vault"
            >
              <span className="material-symbols-outlined text-sm">person</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* ETA & Status Header Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                  LIVE DOORSTEP DISPATCH
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Courier En Route
                </span>
              </div>
              <h2 className="font-headline font-extrabold text-2xl sm:text-3xl mt-1">
                Arriving in ~{tracking.etaMinutes} mins
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Dispensed from <strong className="text-white">{tracking.dispensaryName}</strong> by{' '}
                <strong className="text-white">{tracking.pharmacistInCharge}</strong>
              </p>
            </div>

            {/* OTP Handover Box */}
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3.5 text-center self-start sm:self-center">
              <span className="text-[10px] font-mono text-sky-300 uppercase tracking-wider block">
                DELIVERY HANDOVER OTP
              </span>
              <span className="font-mono text-2xl font-black text-white tracking-widest block mt-0.5">
                {tracking.handoverOtp}
              </span>
              <span className="text-[10px] text-slate-300 block">Show to courier upon arrival</span>
            </div>
          </div>

          {/* Savings Highlight */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="material-symbols-outlined text-base">savings</span>
              <span>
                You saved {currency === 'USD' ? `$${tracking.totalSavedUSD.toFixed(2)}` : `₹${tracking.totalSavedINR.toFixed(2)}`} (73.2% generic discount)
              </span>
            </div>

            <button
              onClick={() => setIsInvoiceOpen(true)}
              className="text-white hover:text-sky-300 font-semibold underline text-xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">receipt_long</span>
              <span>View Tax &amp; Regulatory Invoice</span>
            </button>
          </div>
        </div>

        {/* Live Delivery Map & Cold Chain Telemetry */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-600 text-lg">near_me</span>
              <h3 className="font-headline font-bold text-slate-900 text-xs uppercase tracking-wide">
                Hyperlocal Cold-Chain Telemetry &amp; GPS
              </h3>
            </div>
            {/* Live Temperature Sensor Badge */}
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-xs text-emerald-900 font-bold font-mono">
              <span className="material-symbols-outlined text-sm text-emerald-600">ac_unit</span>
              <span>{temperature}°C</span>
              <span className="text-[10px] text-emerald-600 font-normal">(Safe Zone: 2°-8°C)</span>
            </div>
          </div>

          {/* Simulated Interactive Map Display */}
          <div className="relative h-64 bg-slate-200 overflow-hidden flex items-center justify-center">
            {/* Map Grid Pattern Background */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'radial-gradient(#94a3b8 1px, transparent 1px), radial-gradient(#cbd5e1 1px, #e2e8f0 1px)',
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0, 12px 12px',
              }}
            ></div>

            {/* City Streets Simulation Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-300 stroke-2">
              <line x1="10%" y1="20%" x2="90%" y2="20%" strokeDasharray="4 4" />
              <line x1="10%" y1="50%" x2="90%" y2="50%" strokeDasharray="4 4" />
              <line x1="10%" y1="80%" x2="90%" y2="80%" strokeDasharray="4 4" />
              <line x1="30%" y1="0%" x2="30%" y2="100%" strokeDasharray="4 4" />
              <line x1="70%" y1="0%" x2="70%" y2="100%" strokeDasharray="4 4" />
            </svg>

            {/* Route Path (Green) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path
                d="M 120 160 Q 280 80 480 140 T 700 120"
                fill="none"
                stroke="#0284c7"
                strokeWidth="4"
                strokeDasharray="6 6"
                className="animate-pulse"
              />
            </svg>

            {/* Origin: Dispensary Node */}
            <div className="absolute left-8 top-28 bg-white border-2 border-sky-600 p-2 rounded-xl shadow-md flex items-center gap-2 text-xs">
              <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold">
                <span className="material-symbols-outlined text-sm">local_pharmacy</span>
              </div>
              <div>
                <div className="font-bold text-slate-900">MetroCare #104</div>
                <div className="text-[10px] text-slate-500">404 Healthcare Blvd</div>
              </div>
            </div>

            {/* Dynamic Courier Marker */}
            <div
              className="absolute transition-all duration-1000 flex flex-col items-center"
              style={{
                left: `${Math.min(75, Math.max(30, 80 - (distance / 450) * 45))}%`,
                top: '38%',
              }}
            >
              <div className="bg-emerald-600 text-white p-2 rounded-full shadow-lg ring-4 ring-emerald-300/40 animate-bounce">
                <span className="material-symbols-outlined text-lg">delivery_dining</span>
              </div>
              <span className="bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded-full shadow-xs mt-1 whitespace-nowrap">
                {tracking.courierName} ({distance}m away)
              </span>
            </div>

            {/* Destination: Patient Doorstep */}
            <div className="absolute right-8 bottom-10 bg-white border-2 border-emerald-600 p-2 rounded-xl shadow-md flex items-center gap-2 text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                <span className="material-symbols-outlined text-sm">home</span>
              </div>
              <div>
                <div className="font-bold text-slate-900">Your Doorstep</div>
                <div className="text-[10px] text-slate-500">Midtown, NY 10001</div>
              </div>
            </div>
          </div>

          {/* Courier Telemetry Row */}
          <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                AM
              </div>
              <div>
                <div className="font-bold text-slate-900">{tracking.courierName} (Courier Node #442)</div>
                <div className="text-slate-500 text-[11px]">
                  Electric Cargo Bike • Verified Background &amp; Cold Pouch
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="font-mono text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
                Speed: <strong>{tracking.courierSpeedKmh} km/h</strong>
              </div>
              <button
                onClick={() => alert('Simulating call to Courier Alex M. (+1 555-019-4421)')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1 transition"
              >
                <span className="material-symbols-outlined text-sm">call</span>
                <span>Contact Rider</span>
              </button>
            </div>
          </div>
        </div>

        {/* Milestone Timeline */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="font-headline font-bold text-slate-900 text-sm">Order Fulfillment Milestones</h3>

          <div className="space-y-4 relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {tracking.milestones.map((m, idx) => (
              <div key={idx} className="relative flex items-start gap-3 text-xs">
                {/* Dot */}
                <div
                  className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    m.current
                      ? 'bg-sky-600 border-white ring-4 ring-sky-100'
                      : m.completed
                      ? 'bg-emerald-600 border-white ring-2 ring-emerald-100'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  {m.completed && !m.current && (
                    <span className="material-symbols-outlined text-[10px] text-white">check</span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-bold ${
                        m.current ? 'text-sky-700 text-sm' : m.completed ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {m.step}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{m.time}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">{m.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart 30-Day Auto-Refill Card */}
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-sky-600 text-2xl">event_repeat</span>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Chronic Medication? Enable 30-Day Refill Reminder</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                We'll ping you 5 days before your 30-day Atorvastatin &amp; Metformin strip runs out so you never miss a dose.
              </p>
            </div>
          </div>

          <button
            onClick={() => setReminderSet(true)}
            disabled={reminderSet}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap self-start sm:self-center ${
              reminderSet
                ? 'bg-emerald-600 text-white'
                : 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
            }`}
          >
            {reminderSet ? '✓ Refill Scheduled' : 'Enable Smart Refill'}
          </button>
        </div>
      </div>

      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        currency={currency}
      />

      {/* Persistent Customer Bottom Nav */}
      <CustomerBottomNav
        activeTab="orders"
        onNavigateToSearch={onNavigateToSearch}
        onNavigateToPrescription={onNavigateToPrescription || (() => {})}
        onNavigateToTracking={() => {}}
        onNavigateToAccount={onNavigateToAccount || (() => {})}
      />
    </div>
  );
};
