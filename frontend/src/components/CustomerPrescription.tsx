import React, { useState } from 'react';
import { Currency } from '../types';
import { CustomerBottomNav } from './CustomerBottomNav';
import {
  PrescriptionUploadSimulator,
  UploadedRxData,
  SAMPLE_PRESCRIPTIONS,
} from './PrescriptionUploadSimulator';

interface CustomerPrescriptionProps {
  currency: Currency;
  onNavigateToTracking: () => void;
  onNavigateToSearch: () => void;
  onNavigateToAccount?: () => void;
}

export const CustomerPrescription: React.FC<CustomerPrescriptionProps> = ({
  currency,
  onNavigateToTracking,
  onNavigateToSearch,
  onNavigateToAccount,
}) => {
  const [currentRx, setCurrentRx] = useState<UploadedRxData | null>(SAMPLE_PRESCRIPTIONS.cardio);
  const [hasUploaded, setHasUploaded] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [authorized, setAuthorized] = useState(true);
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
  const [genericChoices, setGenericChoices] = useState<Record<string, boolean>>({
    'med-1': true,
    'med-2': true,
    'med-3': true,
    'med-4': true,
    'med-5': true,
    'med-6': true,
  });

  const getPrice = (usd: number, inr: number) => {
    return currency === 'USD' ? `$${usd.toFixed(2)}` : `₹${inr.toFixed(2)}`;
  };

  const handlePrescriptionSelected = (rxData: UploadedRxData) => {
    setCurrentRx(rxData);
    setHasUploaded(true);
    // Initialize default generic selections for newly loaded medicines
    const newChoices = { ...genericChoices };
    rxData.medicines.forEach((med) => {
      if (newChoices[med.id] === undefined) {
        newChoices[med.id] = true;
      }
    });
    setGenericChoices(newChoices);
  };

  const handleResetUpload = () => {
    setCurrentRx(null);
    setHasUploaded(false);
  };

  const toggleGeneric = (medId: string, value: boolean) => {
    setGenericChoices((prev) => ({ ...prev, [medId]: value }));
  };

  // Dynamic Price Calculations based on currentRx medicines
  const activeMedicines = currentRx ? currentRx.medicines : [];
  
  const totalPriceUSD = activeMedicines.reduce((sum, med) => {
    const isGen = genericChoices[med.id] ?? true;
    return sum + (isGen ? med.genericPriceUSD : med.brandedPriceUSD);
  }, 0);

  const totalPriceINR = activeMedicines.reduce((sum, med) => {
    const isGen = genericChoices[med.id] ?? true;
    return sum + (isGen ? med.genericPriceINR : med.brandedPriceINR);
  }, 0);

  const brandedTotalUSD = activeMedicines.reduce((sum, med) => sum + med.brandedPriceUSD, 0);
  const brandedTotalINR = activeMedicines.reduce((sum, med) => sum + med.brandedPriceINR, 0);

  const billedAmount = currency === 'USD' ? totalPriceUSD : totalPriceINR;
  const originalBrandedAmount = currency === 'USD' ? brandedTotalUSD : brandedTotalINR;
  const directSavings = Math.max(0, originalBrandedAmount - billedAmount);
  const savingsPercent = originalBrandedAmount > 0 ? ((directSavings / originalBrandedAmount) * 100).toFixed(1) : '0';

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-10 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onNavigateToSearch}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Drug Search</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono font-medium text-slate-500 hidden sm:block">
              Dispensary: <strong className="text-slate-800">MetroCare Pharmacy #104</strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToTracking}
                className="relative p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                title="View Orders / Cart"
              >
                <span className="material-symbols-outlined text-base">shopping_bag</span>
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center border border-white">
                  2
                </span>
              </button>
              <button
                onClick={onNavigateToAccount}
                className="w-7 h-7 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center cursor-pointer transition shadow-2xs"
                title="Patient Profile & Health Vault"
              >
                <span className="material-symbols-outlined text-sm">person</span>
              </button>
            </div>
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
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-sky-700 font-semibold">1. Upload/Scan</span>
            <span>→</span>
            <span>2. Pharmacist Signoff</span>
            <span>→</span>
            <span>3. Doorstep Delivery</span>
          </div>
        </div>

        {/* Prescription File Picker & Camera Scanner Simulator */}
        <PrescriptionUploadSimulator
          onPrescriptionSelected={handlePrescriptionSelected}
          isScanning={isScanning}
          setIsScanning={setIsScanning}
          currentRx={currentRx}
          onReset={handleResetUpload}
        />

        {/* Prescription Extracted Details & Generic Substitution Engine */}
        {hasUploaded && !isScanning && currentRx && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Extracted Medicines Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-headline font-bold text-slate-900 text-sm">
                    Detected Medicines &amp; Bioequivalent Substitutions
                  </h3>
                  <p className="text-xs text-slate-500">
                    Extracted from <span className="font-mono text-slate-700 font-semibold">{currentRx.fileName}</span>
                  </p>
                </div>

                <button
                  onClick={() => setIsDocViewerOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold border border-sky-200 transition cursor-pointer flex items-center gap-1"
                  title="View Prescriber Notations"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  <span>View Full Rx</span>
                </button>
              </div>

              {/* Dynamic Line Items */}
              <div className="space-y-3">
                {activeMedicines.map((med) => {
                  const isGeneric = genericChoices[med.id] ?? true;
                  const itemSavings = (currency === 'USD' ? med.brandedPriceUSD : med.brandedPriceINR) -
                    (currency === 'USD' ? med.genericPriceUSD : med.genericPriceINR);

                  return (
                    <div key={med.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold text-slate-500">Prescribed:</div>
                          <div className="font-bold text-slate-800 text-sm">
                            {med.brandedName} ({med.brandedManufacturer})
                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{med.dosageInstructions}</div>
                        </div>

                        <div className="flex items-center gap-3 self-start sm:self-center">
                          <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                            <input
                              type="checkbox"
                              checked={isGeneric}
                              onChange={(e) => toggleGeneric(med.id, e.target.checked)}
                              className="rounded text-sky-600 focus:ring-sky-500"
                            />
                            <span className="text-xs font-bold text-slate-800">
                              {isGeneric ? 'Use Bioequivalent Generic' : 'Dispense Branded'}
                            </span>
                          </label>
                        </div>
                      </div>

                      {isGeneric ? (
                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-emerald-950 flex items-center gap-1">
                              <span>{med.genericName}</span>
                              <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
                            </div>
                            <div className="text-emerald-700 text-[11px] mt-0.5">
                              {med.genericManufacturer} • {med.bioequivalentCode}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-slate-900 text-sm">
                              {getPrice(med.genericPriceUSD, med.genericPriceINR)}
                            </span>
                            <span className="text-emerald-700 font-bold block text-[11px]">
                              Save {currency === 'USD' ? `$${itemSavings.toFixed(2)}` : `₹${itemSavings.toFixed(2)}`}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-100 rounded-lg text-xs flex justify-between items-center">
                          <span className="text-slate-600">
                            Dispensing original branded {med.brandedName} ({med.brandedManufacturer})
                          </span>
                          <span className="font-bold text-slate-900">
                            {getPrice(med.brandedPriceUSD, med.brandedPriceINR)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Order Financial Summary */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Billed to Patient:</span>
                  <span className="font-headline font-bold text-xl text-white">
                    {getPrice(totalPriceUSD, totalPriceINR)}
                  </span>
                </div>

                {directSavings > 0 && (
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-emerald-400 font-semibold">
                    <span>Total Direct Consumer Savings:</span>
                    <span className="font-mono text-sm">
                      -{currency === 'USD' ? `$${directSavings.toFixed(2)}` : `₹${directSavings.toFixed(2)}`} ({savingsPercent}% relief)
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
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">check_circle</span>
                <span>Confirm &amp; Send to Pharmacist Queue (18m Delivery)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* High-Resolution Prescription Document Inspection Modal */}
      {isDocViewerOpen && currentRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-700 text-xl">description</span>
                <div>
                  <h3 className="font-headline font-bold text-slate-900 text-sm">
                    Verified Medical Prescription Record
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {currentRx.fileName} • 21 CFR Part 11 Audit Trail
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDocViewerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Simulated Realistic Prescription Document Body */}
            <div className="p-6 overflow-y-auto bg-amber-50/70 font-sans space-y-4">
              {/* Doctor Header */}
              <div className="border-b-2 border-slate-800 pb-3 flex items-start justify-between">
                <div>
                  <h2 className="font-serif font-black text-slate-950 text-sm tracking-wide">
                    {currentRx.clinicName.toUpperCase()}
                  </h2>
                  <div className="text-xs font-bold text-sky-900 mt-0.5">{currentRx.doctorName}</div>
                  <div className="text-[10px] text-slate-600 font-mono">
                    Registration No: {currentRx.doctorReg}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg border-2 border-slate-900 flex items-center justify-center font-serif font-black text-slate-900 text-lg">
                  ℞
                </div>
              </div>

              {/* Patient Meta */}
              <div className="grid grid-cols-2 gap-2 text-[11px] py-2 border-b border-slate-300 font-mono text-slate-800">
                <div>
                  Patient: <strong>Rajesh Sharma</strong> (58/M)
                </div>
                <div className="text-right">
                  Date: <strong>{currentRx.date}</strong>
                </div>
                <div>
                  ABHA ID: <strong>91-4820-1940-2219</strong>
                </div>
                <div className="text-right text-emerald-800 font-bold">
                  Status: Valid Schedule H Rx
                </div>
              </div>

              {/* Prescription Items */}
              <div className="py-2 space-y-3">
                <div className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                  Medications Prescribed:
                </div>
                {currentRx.medicines.map((med, index) => (
                  <div key={med.id} className="p-2.5 bg-white/80 rounded-lg border border-slate-300 space-y-1">
                    <div className="font-bold text-slate-900 text-xs">
                      {index + 1}. {med.brandedName} ({med.genericName})
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono italic">
                      Sig: {med.dosageInstructions}
                    </div>
                  </div>
                ))}
              </div>

              {/* Doctor Signature Block & Seal */}
              <div className="pt-4 flex items-end justify-between border-t border-slate-300">
                <div className="text-[9px] text-slate-500 font-mono">
                  <div>DISPENSED VIA METROCARE PHARMACY #104</div>
                  <div>SECURITY HASH: 0x892a4f...921</div>
                </div>
                <div className="text-center">
                  <div className="font-serif italic text-sm font-bold text-sky-950 border-b border-sky-950 px-4">
                    Dr. Arvind Mehta
                  </div>
                  <div className="text-[9px] font-mono text-slate-600 mt-0.5">Signed Electronically</div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-white flex justify-end">
              <button
                onClick={() => setIsDocViewerOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Customer Bottom Nav */}
      <CustomerBottomNav
        activeTab="prescriptions"
        onNavigateToSearch={onNavigateToSearch}
        onNavigateToPrescription={() => {}}
        onNavigateToTracking={onNavigateToTracking}
        onNavigateToAccount={onNavigateToAccount || (() => {})}
      />
    </div>
  );
};

