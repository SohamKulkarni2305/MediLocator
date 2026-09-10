import React from 'react';
import { Currency } from '../types';
import { ORANGE_BOOK_DATA } from '../data/mockData';

interface PharmacopeiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
}

export const PharmacopeiaModal: React.FC<PharmacopeiaModalProps> = ({ isOpen, onClose, currency }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  if (!isOpen) return null;

  const filtered = ORANGE_BOOK_DATA.filter(item => 
    item.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.saltName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-sky-600 text-2xl">menu_book</span>
            <div>
              <h3 className="font-headline font-bold text-slate-900 text-lg">National Pharmacopeia Database</h3>
              <p className="text-xs text-slate-500">104,821 active salt formulations &amp; bioequivalence ratings (US-FDA / IP / BP)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              type="text" 
              placeholder="Search by Brand Name, Salt INN, or therapeutic code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[11px] font-semibold text-slate-500">
                <tr>
                  <th className="py-2.5 px-3">Brand Name</th>
                  <th className="py-2.5 px-3">Salt Composition (API)</th>
                  <th className="py-2.5 px-3">Form &amp; Strength</th>
                  <th className="py-2.5 px-3">Therapeutic Code</th>
                  <th className="py-2.5 px-3">Ceiling Price</th>
                  <th className="py-2.5 px-3">Generic Median</th>
                  <th className="py-2.5 px-3 text-right">Potential Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-bold text-slate-900">{item.brandName}</td>
                    <td className="py-3 px-3 font-mono text-sky-800">{item.saltName}</td>
                    <td className="py-3 px-3">{item.dosageForm}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.equivalenceCode}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {currency === 'USD' ? item.ceilingPriceUSD : item.ceilingPriceINR}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                      {currency === 'USD' ? item.genericMedianUSD : item.genericMedianINR}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                      {item.savingsPercent} ({currency === 'USD' ? item.savingsUSD : item.savingsINR})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono">Sync Status: 21 CFR Part 11 Validated Daily</span>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition"
          >
            Close Database
          </button>
        </div>
      </div>
    </div>
  );
};

interface AuditPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditPackageModal: React.FC<AuditPackageModalProps> = ({ isOpen, onClose }) => {
  const [downloading, setDownloading] = React.useState(false);
  const [downloaded, setDownloaded] = React.useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">verified</span>
          </div>
          <div>
            <h3 className="font-headline font-bold text-slate-900 text-lg">21 CFR Part 11 Regulatory Audit Package</h3>
            <p className="text-xs text-slate-500">Cryptographically signed immutable compliance bundle</p>
          </div>
        </div>

        <div className="my-5 space-y-3 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Bundle ID:</span>
              <span className="text-slate-800 font-bold">AUDIT-PKG-2026-SEP-08</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ledger Root Hash:</span>
              <span className="text-sky-700">0x8a92f912440182c31be5d774a11</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Enforcement Standard:</span>
              <span className="text-emerald-700 font-semibold">FDA 21 CFR Part 11 &amp; Rule 65</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Records:</span>
              <span className="text-slate-800">14,289 RLS Transactions</span>
            </div>
          </div>

          <p className="text-slate-600">
            This export contains all time-stamped clinician sign-offs, doctor Rx ingest hashes, substituted generic lot numbers, and PostgreSQL Row-Level Security tenant boundary audits.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading || downloaded}
            className="px-4 py-2 text-xs font-bold text-white bg-brand-800 hover:bg-brand-900 rounded-lg shadow-sm transition inline-flex items-center gap-1.5 disabled:opacity-75"
          >
            {downloading ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                <span>Generating Cryptographic Archive...</span>
              </>
            ) : downloaded ? (
              <>
                <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
                <span>Downloaded (.ZIP)</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Download Compliance ZIP</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, currency }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-brand-800 text-2xl">receipt_long</span>
            <div>
              <h3 className="font-headline font-bold text-slate-900 text-base">Tax &amp; Regulatory Medical Invoice</h3>
              <p className="text-[11px] font-mono text-slate-500">INV-2026-9942 • Form 20B/21B Compliant</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="my-4 space-y-4 text-xs text-slate-700">
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase">Dispensing Pharmacy</div>
              <div className="font-semibold text-slate-900 mt-0.5">MetroCare Pharmacy #104</div>
              <div className="text-slate-500 text-[11px]">Lic: DL-20B-88391</div>
              <div className="text-slate-500 text-[11px]">GSTIN: 27AAACM1234F1Z8</div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase">Patient / Customer</div>
              <div className="font-semibold text-slate-900 mt-0.5">Rajesh Sharma (58/M)</div>
              <div className="text-slate-500 text-[11px]">MRN: 94021-B • Midtown, NY</div>
              <div className="text-slate-500 text-[11px]">Prescriber: Dr. Arvind Mehta</div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-100 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="p-2">Item Description</th>
                  <th className="p-2">Lot &amp; Exp</th>
                  <th className="p-2">Branded MRP</th>
                  <th className="p-2 text-right">Generic Billed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2">
                    <span className="font-semibold text-slate-900">Atorvastatin 10mg Tablet</span>
                    <div className="text-slate-400 text-[10px]">Cipla Ltd (Bioequiv. to Lipitor)</div>
                  </td>
                  <td className="p-2 font-mono text-slate-500">CIP-AT-881 (11/28)</td>
                  <td className="p-2 line-through text-slate-400">{currency === 'USD' ? '$42.00' : '₹420.00'}</td>
                  <td className="p-2 text-right font-bold text-slate-900">{currency === 'USD' ? '$11.50' : '₹115.00'}</td>
                </tr>
                <tr>
                  <td className="p-2">
                    <span className="font-semibold text-slate-900">Metformin HCl 500mg ER</span>
                    <div className="text-slate-400 text-[10px]">Sun Pharma (Bioequiv. to Glucophage)</div>
                  </td>
                  <td className="p-2 font-mono text-slate-500">SUN-MF-993 (04/28)</td>
                  <td className="p-2 line-through text-slate-400">{currency === 'USD' ? '$28.00' : '₹280.00'}</td>
                  <td className="p-2 text-right font-bold text-slate-900">{currency === 'USD' ? '$7.20' : '₹72.00'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="font-semibold text-emerald-900 text-xs">Total Direct Consumer Savings</span>
              <div className="text-[11px] text-emerald-700 font-medium">Verified 73.2% Bioequivalence Price Relief</div>
            </div>
            <span className="font-headline font-bold text-emerald-700 text-base">
              {currency === 'USD' ? '-$51.30' : '-₹513.00'}
            </span>
          </div>

          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal (Generics)</span>
              <span className="font-mono">{currency === 'USD' ? '$18.70' : '₹187.00'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Hyperlocal Cold-Chain Courier</span>
              <span className="font-semibold text-emerald-600">FREE (Partner Promo)</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Prescription Handling &amp; GST/Tax</span>
              <span className="font-mono">{currency === 'USD' ? '$0.00' : '₹0.00'}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
              <span>Total Paid (Card ending in 4242)</span>
              <span className="font-mono">{currency === 'USD' ? '$18.70' : '₹187.00'}</span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded border border-slate-200 font-mono text-[10px] text-slate-500">
            <div>SHA-256 Stamp: e88a9134bca819077de129cb01</div>
            <div>Sign-off: Dr. Sarah Jenkins (PharmD #PH-99214)</div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
          >
            Close &amp; Print
          </button>
        </div>
      </div>
    </div>
  );
};

interface ClinicalProofModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClinicalProofModal: React.FC<ClinicalProofModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-2xl">verified_user</span>
            <h3 className="font-headline font-bold text-slate-900 text-base">Clinical Bioequivalence Proof</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="my-4 space-y-3 text-xs text-slate-600">
          <div className="p-3 bg-sky-50 rounded-lg border border-sky-200 text-sky-950">
            <span className="font-bold">FDA "AB" Rating Standard:</span>
            <p className="mt-1 text-[11px] leading-relaxed">
              Products evaluated with code "AB" have demonstrated bioequivalence through in vivo or in vitro dissolution studies, assuring 100% therapeutic identity and equal bioavailability to branded drugs.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="font-semibold text-slate-800">Peak Serum Concentration (Cmax)</span>
              <span className="font-mono text-emerald-700 font-bold">99.4% Match</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="font-semibold text-slate-800">Area Under the Curve (AUC0-inf)</span>
              <span className="font-mono text-emerald-700 font-bold">99.8% Equivalence</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="font-semibold text-slate-800">Manufacturing Quality Certification</span>
              <span className="font-mono text-sky-800 font-bold">WHO-GMP &amp; US-FDA</span>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
        >
          Understood &amp; Verified
        </button>
      </div>
    </div>
  );
};
