/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useEffect, useState } from 'react';
import { ActiveScreen, Currency, Language, Theme } from './types';
import { NavigationHeader } from './components/NavigationHeader';
import { PrescriptionProvider } from './context/PrescriptionContext';
import { PrescriptionNotificationToast } from './components/PrescriptionNotificationToast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSSE } from './hooks/useSSE';
import { AuthScreen, AuthUser } from './components/AuthScreen';
import { apiClient } from './api/client';

const LazyAdminConsole = lazy(() => import('./components/AdminConsole').then((module) => ({ default: module.AdminConsole })));
const LazyPharmacistWorkstation = lazy(() => import('./components/PharmacistWorkstation').then((module) => ({ default: module.PharmacistWorkstation })));
const LazyCustomerSearch = lazy(() => import('./components/CustomerSearch').then((module) => ({ default: module.CustomerSearch })));
const LazyCustomerPrescription = lazy(() => import('./components/CustomerPrescription').then((module) => ({ default: module.CustomerPrescription })));
const LazyCustomerTracking = lazy(() => import('./components/CustomerTracking').then((module) => ({ default: module.CustomerTracking })));
const LazyCustomerAccount = lazy(() => import('./components/CustomerAccount').then((module) => ({ default: module.CustomerAccount })));
const LazyArchitectureBlueprint = lazy(() => import('./components/ArchitectureBlueprint').then((module) => ({ default: module.ArchitectureBlueprint })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('customer-search');
  const [currency, setCurrency] = useState<Currency>('INR');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('medilocator-theme');
    return storedTheme === 'light' ? 'light' : 'dark';
  });
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem('medilocator-language') === 'hi' ? 'hi' : 'en');

  useSSE(Boolean(user));

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setIsAuthLoading(false); return; }
    apiClient.get<AuthUser>('/auth/me')
      .then(({ data }) => { setUser(data); setCurrentScreen(data.role === 'ADMIN' ? 'admin-console' : data.role === 'PHARMACIST' ? 'pharmacist-workstation' : 'customer-search'); })
      .catch(() => { localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); })
      .finally(() => setIsAuthLoading(false));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('medilocator-theme', theme);
  }, [theme]);

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === 'INR' ? 'USD' : 'INR'));
  };

  const toggleMobileFrame = () => {
    setIsMobileFrame((prev) => !prev);
  };

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const toggleLanguage = () => setLanguage((prev) => {
    const next = prev === 'en' ? 'hi' : 'en';
    localStorage.setItem('medilocator-language', next);
    return next;
  });

  const handleAuthenticated = (authenticatedUser: AuthUser): void => {
    setUser(authenticatedUser);
    setCurrentScreen(authenticatedUser.role === 'ADMIN' ? 'admin-console' : authenticatedUser.role === 'PHARMACIST' ? 'pharmacist-workstation' : 'customer-search');
  };

  const handleLogout = async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    try { if (refreshToken) await apiClient.post('/auth/logout', { refreshToken }); } catch { /* local logout still completes */ }
    localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); setUser(null);
  };

  if (isAuthLoading) return <div className="min-h-screen bg-slate-950 text-slate-300 grid place-items-center" role="status">Checking secure session…</div>;
  if (!user) return <AuthScreen onAuthenticated={handleAuthenticated} />;

  const isCustomerScreen = currentScreen.startsWith('customer-');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'admin-console':
        return (
          <LazyAdminConsole
            currency={currency}
            onNavigateToWorkstation={() => setCurrentScreen('pharmacist-workstation')}
          />
        );
      case 'pharmacist-workstation':
        return (
          <LazyPharmacistWorkstation
            currency={currency}
            onNavigateToTracking={() => setCurrentScreen('customer-tracking')}
            onNavigateToAdmin={() => setCurrentScreen('admin-console')}
          />
        );
      case 'customer-search':
        return (
          <LazyCustomerSearch
            currency={currency}
            onNavigateToPrescription={() => setCurrentScreen('customer-prescription')}
            onNavigateToTracking={() => setCurrentScreen('customer-tracking')}
            onNavigateToAccount={() => setCurrentScreen('customer-account')}
          />
        );
      case 'customer-prescription':
        return (
          <LazyCustomerPrescription
            currency={currency}
            onNavigateToTracking={() => setCurrentScreen('customer-tracking')}
            onNavigateToSearch={() => setCurrentScreen('customer-search')}
            onNavigateToAccount={() => setCurrentScreen('customer-account')}
          />
        );
      case 'customer-tracking':
        return (
          <LazyCustomerTracking
            currency={currency}
            onNavigateToSearch={() => setCurrentScreen('customer-search')}
            onNavigateToWorkstation={() => setCurrentScreen('pharmacist-workstation')}
            onNavigateToPrescription={() => setCurrentScreen('customer-prescription')}
            onNavigateToAccount={() => setCurrentScreen('customer-account')}
          />
        );
      case 'customer-account':
        return (
          <LazyCustomerAccount
            currency={currency}
            onNavigateToSearch={() => setCurrentScreen('customer-search')}
            onNavigateToPrescription={() => setCurrentScreen('customer-prescription')}
            onNavigateToTracking={() => setCurrentScreen('customer-tracking')}
          />
        );
      case 'architecture-blueprint':
        return <LazyArchitectureBlueprint />;
      default:
        return (
          <LazyAdminConsole
            currency={currency}
            onNavigateToWorkstation={() => setCurrentScreen('pharmacist-workstation')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans relative theme-surface">
      {/* Universal Screen Switcher & Controls */}
        <NavigationHeader
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        currency={currency}
        onToggleCurrency={toggleCurrency}
        isMobileFrame={isMobileFrame}
          onToggleMobileFrame={toggleMobileFrame}
          theme={theme}
          onToggleTheme={toggleTheme}
          language={language}
          onToggleLanguage={toggleLanguage}
          userRole={user.role}
          userName={user.name}
          onLogout={handleLogout}
      />

      {/* Floating Prescription Verification Toast Alert System */}
        <PrescriptionNotificationToast
        onNavigateToPrescription={() => setCurrentScreen('customer-prescription')}
        onNavigateToAccount={() => setCurrentScreen('customer-account')}
      />

      {/* Screen Presentation Container */}
        <Suspense fallback={<div className="flex-1 p-8 text-slate-400" role="status">Loading screen…</div>}>
          <div className="flex-1 flex flex-col">
            {isCustomerScreen && isMobileFrame ? (
          <div className="flex-1 bg-slate-950 py-8 px-4 flex items-center justify-center">
            <div className="w-full max-w-[420px] bg-slate-900 rounded-[44px] p-3 shadow-2xl ring-1 ring-slate-800 border-4 border-slate-700 relative">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-end px-3">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
              </div>
              <div className="bg-slate-50 rounded-[34px] overflow-hidden max-h-[820px] overflow-y-auto scrollbar-none pt-7">
                {renderScreen()}
              </div>
              <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto my-2"></div>
            </div>
          </div>
        ) : (
              <div className="flex-1">{renderScreen()}</div>
            )}
          </div>
        </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <PrescriptionProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </PrescriptionProvider>
  );
}

