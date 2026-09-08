import React from 'react';

interface CustomerBottomNavProps {
  activeTab: 'search' | 'prescriptions' | 'orders' | 'account';
  onNavigateToSearch: () => void;
  onNavigateToPrescription: () => void;
  onNavigateToTracking: () => void;
  onNavigateToAccount: () => void;
}

export const CustomerBottomNav: React.FC<CustomerBottomNavProps> = ({
  activeTab,
  onNavigateToSearch,
  onNavigateToPrescription,
  onNavigateToTracking,
  onNavigateToAccount,
}) => {
  const tabs = [
    { id: 'search', label: 'Search & Compare', icon: 'search', onClick: onNavigateToSearch },
    { id: 'prescriptions', label: 'Prescriptions', icon: 'description', onClick: onNavigateToPrescription },
    { id: 'orders', label: 'Orders', icon: 'inventory_2', onClick: onNavigateToTracking },
    { id: 'account', label: 'Account', icon: 'person', onClick: onNavigateToAccount },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg">
      <div className="max-w-4xl mx-auto px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={tab.onClick}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition text-[11px] font-medium cursor-pointer ${
                isActive
                  ? 'text-sky-700 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span
                className={`material-symbols-outlined text-xl mb-0.5 ${
                  isActive ? 'text-sky-700 font-variation-fill' : 'text-slate-400'
                }`}
              >
                {tab.icon}
              </span>
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
