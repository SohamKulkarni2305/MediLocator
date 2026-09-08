import React, { useState } from 'react';
import { Currency } from '../types';

interface CustomerPrescriptionProps {
  currency: Currency;
  onNavigateToTracking: () => void;
  onNavigateToSearch: () => void;
}

export const CustomerPrescription: React.FC<CustomerPrescriptionProps> = ({
  currency,
  onNavigateToTracking,
  onNavigateToSearch,
}) => {
  const [hasUploaded, setHasUploaded] = useState(true); // default to true so users see the rich prescription match right away, but can re-upload
  const [isScanning, setIsScanning] = useState(false);
  const [authorized, setAuthorized] = useState(true);
  const [useGeneric1, setUseGeneric1] = useState(true);
  const [useGeneric2, setUseGeneric2] = useState(true);
  const [fileName, setFileName] = useState('rx_rajesh_sharma_sep2026.pdf');

  const getPrice = (usd: number, inr: number) => {
    return currency === 'USD' ? `$${usd.toFixed(2)}` : `₹${inr.toFixed(2)}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        setHasUploaded(true);
      }, 1200);
    }
  };

  const handleLoadSample = () => {
    setIsScanning(true);
    setFileName('rx_rajesh_sharma_cardio_diabetic.pdf');
    setTimeout(() => {
      setIsScanning(false);
      setHasUploaded(true);
    }, 900);
  };

  // Price calculations
  const price1 = useGeneric1 ? 11.50 : 42.00;
  const price1Inr = useGeneric1 ? 115.00 : 420.00;

  const price2 = useGeneric2 ? 7.20 : 28.00;
  const price2Inr = useGeneric2 ? 72.00 : 280.00;

  const totalPrice = price1 + price2;
  const totalPriceInr = price1Inr + price2Inr;

  const brandedTotal = 42.00 + 28.00;
  const brandedTotalInr = 420.00 + 280.00;

  const savings = (currency === 'USD' ? brandedTotal : brandedTotalInr) - (currency === 'USD' ? totalPrice : totalPriceInr);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans pb-16">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-10 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onNavigateToSearch}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Drug Search</span>
          </button>
          <div className="text-xs font-mono font-medium text-slate-500">
            Dispensary: <strong className="text-slate-800">MetroCare Pharmacy #104</strong>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-800 text-white font-bold text-xs flex items-center justify-center">
              1
            </span>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Prescription Ingest &amp; Salt Match
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>Next: Pharmacist Signoff</span>
            <span>•</span>
            <span>Doorstep Delivery</span>
          </div>
        </div>

        {/* Upload Dropzone */}
        <div className="bg-white border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl p-6 text-center transition">
          <input
            type="file"
            id="rx-file-input"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf"
          />
          <label htmlFor="rx-file-input" className="cursor-pointer flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">cloud_upload</span>
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">
                Click to upload or drag &amp; drop prescription
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Supports JPG, PNG, PDF (Up to 25MB) • Camera Capture Supported
              </p>
            </div>
          </label>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-400">Want to test with sample Rx?</span>
            <button
              onClick={handleLoadSample}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200 transition"
            >
              Load Sample Rx (Dr. Arvind Mehta - Cardiology)
            </button>
          </div>
        </div>

        {/* Scanning Spinner */}
        {isScanning && (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3 animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-4xl text-sky-600 animate-spin">refresh</span>
            <h3 className="font-bold text-slate-900 text-sm">
              Analyzing Prescription with Autonomous OCR Diagnostics...
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Extracting doctor registration, active ingredients (INN), strengths, and validating FDA Orange Book bioequivalence equivalents.
            </p>
          </div>
        )}

        {/* Prescription Extracted Details */}
        {hasUploaded && !isScanning && (
          <div className="space-y-6">
            {/* OCR Success Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-2xl">task_alt</span>
                <div>
                  <h4 className="font-bold text-xs text-emerald-950">
                    Prescription Analyzed (Confidence: 99.2%)
                  </h4>
                  <div className="text-[11px] text-emerald-700">
                    File: <strong className="font-mono">{fileName}</strong> • Prescriber: Dr. Arvind Mehta (Reg #88219)
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                2 Medicines Identified
              </span>
            </div>

            {/* Extracted Medicines Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-headline font-bold text-slate-900 text-sm">
                  Detected Medicines &amp; Recommended Generic Substitutions
                </h3>
                <span className="text-xs text-slate-500">Toggle to customize selection</span>
              </div>

              {/* Item 1: Lipitor / Atorvastatin */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Prescribed:</div>
                    <div className="font-bold text-slate-800 text-sm">
                      Tab. Lipitor 10mg (Atorvastatin Calcium)
                    </div>
                    <div className="text-xs text-slate-400">1 tab daily at bedtime x 30 days</div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                      <input
                        type="checkbox"
                        checked={useGeneric1}
                        onChange={(e) => setUseGeneric1(e.target.checked)}
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span className="text-xs font-bold text-slate-800">
                        {useGeneric1 ? 'Use Bioequivalent Generic' : 'Dispense Branded'}
                      </span>
                    </label>
                  </div>
                </div>

                {useGeneric1 ? (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-emerald-950 flex items-center gap-1">
                        <span>Atorvastatin 10mg Tablet (Cipla Ltd)</span>
                        <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
                      </div>
                      <div className="text-emerald-700 text-[11px]">
                        Same chemical entity • US-FDA AB Rated bioequivalence
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 text-sm">{getPrice(11.50, 115.00)}</span>
                      <span className="text-emerald-700 font-bold block text-[11px]">Save {getPrice(30.50, 305.00)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-100 rounded-lg text-xs flex justify-between">
                    <span className="text-slate-600">Dispensing original branded Lipitor 10mg (Pfizer)</span>
                    <span className="font-bold text-slate-900">{getPrice(42.00, 420.00)}</span>
                  </div>
                )}
              </div>

              {/* Item 2: Glucophage / Metformin */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Prescribed:</div>
                    <div className="font-bold text-slate-800 text-sm">
                      Tab. Glucophage 500mg ER (Metformin HCl)
                    </div>
                    <div className="text-xs text-slate-400">1 tab twice daily after meals x 60 tabs</div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                      <input
                        type="checkbox"
                        checked={useGeneric2}
                        onChange={(e) => setUseGeneric2(e.target.checked)}
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span className="text-xs font-bold text-slate-800">
                        {useGeneric2 ? 'Use Bioequivalent Generic' : 'Dispense Branded'}
                      </span>
                    </label>
                  </div>
                </div>

                {useGeneric2 ? (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-emerald-950 flex items-center gap-1">
                        <span>Metformin HCl 500mg ER (Sun Pharma)</span>
                        <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
                      </div>
                      <div className="text-emerald-700 text-[11px]">
                        Same chemical entity • 100% Active Ingredient match
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 text-sm">{getPrice(7.20, 72.00)}</span>
                      <span className="text-emerald-700 font-bold block text-[11px]">Save {getPrice(20.80, 208.00)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-100 rounded-lg text-xs flex justify-between">
                    <span className="text-slate-600">Dispensing original branded Glucophage 500mg (Merck)</span>
                    <span className="font-bold text-slate-900">{getPrice(28.00, 280.00)}</span>
                  </div>
                )}
              </div>

              {/* Order Financial Summary */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Billed to Patient:</span>
                  <span className="font-headline font-bold text-xl text-white">
                    {getPrice(totalPrice, totalPriceInr)}
                  </span>
                </div>

                {savings > 0 && (
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-emerald-400 font-semibold">
                    <span>Total Direct Consumer Savings:</span>
                    <span className="font-mono text-sm">
                      -{currency === 'USD' ? `$${savings.toFixed(2)}` : `₹${savings.toFixed(2)}`} (73.2% relief)
                    </span>
                  </div>
                )}
              </div>

              {/* Consent Checkbox */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={authorized}
                    onChange={(e) => setAuthorized(e.target.checked)}
                    className="mt-0.5 rounded text-brand-800 focus:ring-brand-800 h-4 w-4"
                  />
                  <span className="text-slate-700 leading-relaxed text-[11px]">
                    I authorize the licensed clinical pharmacist at <strong>MetroCare Pharmacy #104</strong> to verify and substitute identical bioequivalent generic salt formulations as permitted under the National Health &amp; Drug Regulations.
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                onClick={onNavigateToTracking}
                disabled={!authorized}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">check_circle</span>
                <span>Confirm &amp; Send to Pharmacist Queue (18m Delivery)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
