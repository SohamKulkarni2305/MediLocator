/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActiveScreen, Currency } from './types';
import { NavigationHeader } from './components/NavigationHeader';
import { AdminConsole } from './components/AdminConsole';
import { PharmacistWorkstation } from './components/PharmacistWorkstation';
import { CustomerSearch } from './components/CustomerSearch';
import { CustomerPrescription } from './components/CustomerPrescription';
import { CustomerTracking } from './components/CustomerTracking';
import { ArchitectureBlueprint } from './components/ArchitectureBlueprint';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('admin-console');
  const [currency, setCurrency] = useState<Currency>('INR');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === 'INR' ? 'USD' : 'INR'));
  };

  const toggleMobileFrame = () => {
    setIsMobileFrame((prev) => !prev);
  };

  const isCustomerScreen = currentScreen.startsWith('customer-');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'admin-console':
        return (
          <AdminConsole
            currency={currency}
            onNavigateToWorkstation={() => setCurrentScreen('pharmacist-workstation')}
          />
        );
      case 'pharmacist-workstation':
        return (
          <PharmacistWorkstation
            currency={currency}
            onNavigateToTracking={() => setCurrentScreen('customer-tracking')}
            onNavigateToAdmin={() => setCurrentScreen('admin-console')}
          />
        );
      case 'customer-search':
        return (
          <CustomerSearch
            currency={currency}
            onNavigateToPrescription={() => setCurrentScreen('customer-prescription')}
            onNavigateToTracking={() => setCurrentScreen('customer-tracking')}
          />
        );
      case 'customer-prescription':
        return (
          <CustomerPrescription
            currency={currency}
            onNavigateToTracking={() => setCurrentScreen('customer-tracking')}
            onNavigateToSearch={() => setCurrentScreen('customer-search')}
          />
        );
      case 'customer-tracking':
        return (
          <CustomerTracking
            currency={currency}
            onNavigateToSearch={() => setCurrentScreen('customer-search')}
            onNavigateToWorkstation={() => setCurrentScreen('pharmacist-workstation')}
          />
        );
      case 'architecture-blueprint':
        return <ArchitectureBlueprint />;
      default:
        return (
          <AdminConsole
            currency={currency}
            onNavigateToWorkstation={() => setCurrentScreen('pharmacist-workstation')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
      {/* Universal Screen Switcher & Controls */}
      <NavigationHeader
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        currency={currency}
        onToggleCurrency={toggleCurrency}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={toggleMobileFrame}
      />

      {/* Screen Presentation Container */}
      <div className="flex-1 flex flex-col">
        {isCustomerScreen && isMobileFrame ? (
          <div className="flex-1 bg-slate-950 py-8 px-4 flex items-center justify-center">
            {/* Realistic Smartphone Mockup Frame */}
            <div className="w-full max-w-[420px] bg-slate-900 rounded-[44px] p-3 shadow-2xl ring-1 ring-slate-800 border-4 border-slate-700 relative">
              {/* Phone Speaker & Dynamic Island */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-end px-3">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
              </div>

              {/* Screen Inner Viewport */}
              <div className="bg-slate-50 rounded-[34px] overflow-hidden max-h-[820px] overflow-y-auto scrollbar-none pt-7">
                {renderScreen()}
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto my-2"></div>
            </div>
          </div>
        ) : (
          <div className="flex-1">{renderScreen()}</div>
        )}
      </div>
    </div>
  );
}

