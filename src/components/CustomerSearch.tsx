import React, { useState } from 'react';
import { Currency } from '../types';
import { ClinicalProofModal } from './Modals';

interface CustomerSearchProps {
  currency: Currency;
  onNavigateToPrescription: () => void;
  onNavigateToTracking?: () => void;
}

export const CustomerSearch: React.FC<CustomerSearchProps> = ({
  currency,
  onNavigateToPrescription,
}) => {
  const [selectedStrength, setSelectedStrength] = useState('10mg');
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('Lipitor');
  const [activeCategory, setActiveCategory] = useState('Cardiovascular');

  const categories = ['Cardiovascular', 'Diabetes Care', 'Antibiotics', 'Mental Health', 'Thyroid'];

  const getPrice = (usd: number, inr: number) => {
    return currency === 'USD' ? `$${usd.toFixed(2)}` : `₹${inr.toFixed(2)}`;
  };

  const handleAddToCart = () => {
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 3000);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans pb-16">
      {/* Search Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-10 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* Location strip */}
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2">
            <div className="flex items-center gap-1 text-slate-700">
              <span className="material-symbols-outlined text-sm text-sky-600">location_on</span>
              <span>Delivering to: <strong className="text-slate-900">Midtown, NY 10001</strong></span>
              <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] ml-1">
                MetroCare Pharmacy #104 (1.2 km away)
              </span>
            </div>
            <span className="hidden sm:inline font-mono text-[11px] text-slate-400">18-30 min doorstep delivery</span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search branded medicine (e.g. Lipitor, Glucophage, Zoloft)..."
              className="w-full pl-10 pr-24 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
            />
            <button
              onClick={onNavigateToPrescription}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-800 hover:bg-brand-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
            >
              <span className="material-symbols-outlined text-sm">upload_file</span>
              <span className="hidden sm:inline">Upload Rx</span>
            </button>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2.5 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Banner Alert */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-sky-600 text-xl mt-0.5">verified_user</span>
          <div className="text-xs text-sky-950">
            <span className="font-bold block text-sm">Doctor Prescribed Branded? Save up to 85% with Generic Salts</span>
            <p className="mt-0.5 text-slate-600">
              Generic medicines contain the <strong>exact same active ingredient</strong>, dosage strength, and bioavailability. All substitutions are reviewed and certified by registered clinical pharmacists.
            </p>
          </div>
        </div>

        {/* Comparison Hero Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold">
                  BIOEQUIVALENT SALT MATCH
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  AB Rated • US-FDA Standard
                </span>
              </div>
              <h2 className="font-headline font-extrabold text-xl sm:text-2xl mt-1">
                Atorvastatin Calcium Trihydrate
              </h2>
              <p className="text-xs text-slate-300">
                Lipid-lowering HMG-CoA reductase inhibitor (Statin) • Schedule H
              </p>
            </div>

            <button
              onClick={() => setIsProofModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-xs transition border border-white/20 self-start sm:self-center"
            >
              <span className="material-symbols-outlined text-sm text-emerald-400">policy</span>
              <span>View Clinical Proof</span>
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Strength Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Strength:</span>
              <div className="flex items-center gap-1.5">
                {['10mg', '20mg', '40mg'].map((str) => (
                  <button
                    key={str}
                    onClick={() => setSelectedStrength(str)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      selectedStrength === str
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {str}
                  </button>
                ))}
              </div>
            </div>

            {/* Side by Side Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prescribed Branded Drug */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-slate-400 font-mono">
                      ORIGINAL BRANDED REQUEST
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                      Doctor Prescribed
                    </span>
                  </div>

                  <h3 className="font-headline font-bold text-slate-800 text-lg mt-2">
                    Lipitor® {selectedStrength}
                  </h3>
                  <div className="text-xs text-slate-500">Pfizer Healthcare Inc. • 30 Tablets</div>
                  <div className="text-xs text-slate-400 mt-2 font-mono">NDC: 0071-0155-23</div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200">
                  <div className="text-[11px] text-slate-500">Retail Brand MRP</div>
                  <div className="font-headline font-extrabold text-2xl text-slate-400 line-through">
                    {getPrice(42.00, 420.00)}
                  </div>
                </div>
              </div>

              {/* Verified WHO-GMP Generic Equivalent */}
              <div className="border-2 border-emerald-500 bg-emerald-50/40 rounded-xl p-4 flex flex-col justify-between relative shadow-xs">
                <div className="absolute -top-3 right-4 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                  Recommended Generic
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-emerald-800 font-mono">
                      BIOEQUIVALENT GENERIC
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      In Stock (MetroCare #104)
                    </span>
                  </div>

                  <h3 className="font-headline font-bold text-slate-900 text-lg mt-2 flex items-center gap-1.5">
                    <span>Atorvastatin {selectedStrength} Tablet</span>
                    <span className="material-symbols-outlined text-emerald-600 text-base">verified</span>
                  </h3>
                  <div className="text-xs text-slate-600">Cipla Ltd • WHO-GMP Certified Quality</div>
                  <div className="text-xs text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">savings</span>
                    <span>Direct Patient Savings: {getPrice(30.50, 305.00)} (-72.6%)</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-200 flex items-end justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-emerald-900">Generic Market Price</div>
                    <div className="font-headline font-extrabold text-2xl text-slate-900">
                      {getPrice(11.50, 115.00)}
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-base">
                      {cartAdded ? 'check' : 'add_shopping_cart'}
                    </span>
                    <span>{cartAdded ? 'Added to Cart' : 'Select Generic'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom CTA to upload prescription */}
            <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm">Have a doctor's prescription for Lipitor or other brands?</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload your prescription photo and our registered pharmacists will automatically map all bioequivalent generics.
                </p>
              </div>
              <button
                onClick={onNavigateToPrescription}
                className="w-full sm:w-auto px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold rounded-lg text-xs shadow-sm transition whitespace-nowrap flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">upload_file</span>
                <span>Upload Prescription &amp; Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* Other Manufacturers Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="font-headline font-bold text-slate-900 text-sm">
            Other Equivalent Generic Manufacturers (FDA Verified)
          </h3>
          <div className="divide-y divide-slate-100">
            <div className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-800">Torvast 10mg (Torrent Pharmaceuticals)</span>
                <span className="text-slate-400 block text-[11px]">WHO-GMP Inspected Facility</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">{getPrice(12.00, 120.00)}</span>
                <span className="text-[11px] text-emerald-600 block">Save 71% vs Lipitor</span>
              </div>
            </div>
            <div className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-800">Storvas 10mg (Sun Pharma)</span>
                <span className="text-slate-400 block text-[11px]">US-FDA Approved Plant</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">{getPrice(11.80, 118.00)}</span>
                <span className="text-[11px] text-emerald-600 block">Save 72% vs Lipitor</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ClinicalProofModal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
      />
    </div>
  );
};
