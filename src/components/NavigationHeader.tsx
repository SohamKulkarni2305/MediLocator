import React from 'react';
import { ActiveScreen, Currency } from '../types';

interface NavigationHeaderProps {
  currentScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  currency: Currency;
  onToggleCurrency: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentScreen,
  onSelectScreen,
  currency,
  onToggleCurrency,
  isMobileFrame,
  onToggleMobileFrame,
}) => {
  const isCustomerScreen = currentScreen.startsWith('customer-');

  const screens: { id: ActiveScreen; label: string; icon: string; category: string }[] = [
    { id: 'admin-console', label: 'Master Admin Console', icon: 'shield_person', category: 'Authority' },
    { id: 'pharmacist-workstation', label: 'Pharmacist Workstation', icon: 'medical_services', category: 'Clinical Node' },
    { id: 'customer-search', label: 'Customer: Search & Compare', icon: 'search', category: 'Patient' },
    { id: 'customer-prescription', label: 'Customer: Rx Gate & OCR', icon: 'description', category: 'Patient' },
    { id: 'customer-tracking', label: 'Customer: Order Tracking', icon: 'delivery_dining', category: 'Patient' },
    { id: 'customer-account', label: 'Customer: Health Vault & Account', icon: 'account_circle', category: 'Patient' },
    { id: 'architecture-blueprint', label: 'Architecture Blueprint', icon: 'account_tree', category: 'System Spec' },
  ];

  return (
    <nav className="bg-slate-950 text-white border-b border-slate-800 text-xs sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: System Role Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 rounded border border-slate-800 text-slate-400 font-mono text-[11px] uppercase mr-1 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            <span>Screens:</span>
          </div>

          <div className="flex items-center gap-1 flex-nowrap">
            {screens.map((scr) => {
              const active = currentScreen === scr.id;
              return (
                <button
                  key={scr.id}
                  onClick={() => onSelectScreen(scr.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap text-xs ${
                    active
                      ? 'bg-sky-500 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{scr.icon}</span>
                  <span>{scr.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Global Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Currency Toggle */}
          <button
            onClick={onToggleCurrency}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 hover:text-white font-mono text-xs transition"
            title="Toggle between USD ($) and INR (₹) price display"
          >
            <span className="text-slate-400">Currency:</span>
            <span className="font-bold text-emerald-400">{currency === 'USD' ? '$ USD' : '₹ INR'}</span>
          </button>

          {/* Mobile Phone Mockup Frame toggle (only shown on customer screens) */}
          {isCustomerScreen && (
            <button
              onClick={onToggleMobileFrame}
              className={`flex items-center gap-1.5 px-2.5 py-1 border rounded text-xs transition ${
                isMobileFrame
                  ? 'bg-sky-950 border-sky-500 text-sky-300 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Toggle mobile device frame container"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isMobileFrame ? 'stay_current_portrait' : 'desktop_windows'}
              </span>
              <span>{isMobileFrame ? 'Mobile Frame: ON' : 'Mobile Frame: OFF'}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
