import React, { useMemo, useState } from 'react';
import { INITIAL_INVENTORY } from '../data/mockData';
import { InventoryRecord } from '../types';

interface InventoryManagementPanelProps {
  clusterFilter: string;
  onNotify: (message: string) => void;
}

export const InventoryManagementPanel: React.FC<InventoryManagementPanelProps> = ({ clusterFilter, onNotify }) => {
  const [records, setRecords] = useState<InventoryRecord[]>(INITIAL_INVENTORY);
  const visibleRecords = useMemo(
    () => clusterFilter === 'All clusters' ? records : records.filter((record) => record.cluster === clusterFilter),
    [clusterFilter, records]
  );
  const alertCount = visibleRecords.filter((record) => record.status !== 'healthy').length;

  const handleReorder = (record: InventoryRecord): void => {
    setRecords((current) => current.map((item) => item.id === record.id
      ? { ...item, quantity: item.reorderPoint * 2, status: 'healthy' }
      : item));
    onNotify(`Reorder request created for ${record.genericName} at ${record.pharmacyName}.`);
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden" aria-labelledby="inventory-heading">
      <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3">
        <div>
          <h2 id="inventory-heading" className="font-headline font-bold text-slate-900">Drug Inventory Management</h2>
          <p className="text-xs text-slate-500 mt-1">Mock inventory adapter ready for later database replacement.</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${alertCount ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
          {alertCount} {alertCount === 1 ? 'alert' : 'alerts'}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
            <tr><th className="px-4 py-3">Medicine</th><th className="px-4 py-3">Pharmacy / Cluster</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Expiry</th><th className="px-4 py-3 text-right">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleRecords.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-3"><div className="font-semibold text-slate-900">{record.drugName}</div><div className="text-[11px] text-slate-500">{record.genericName} · Lot {record.lotNumber}</div></td>
                <td className="px-4 py-3"><div>{record.pharmacyName}</div><div className="text-[11px] text-slate-500">{record.cluster}</div></td>
                <td className="px-4 py-3"><span className="font-bold">{record.quantity} {record.unit}</span><div className="text-[11px] text-slate-500">Reorder at {record.reorderPoint}</div></td>
                <td className="px-4 py-3">{record.expiryDate}</td>
                <td className="px-4 py-3 text-right"><button type="button" onClick={() => handleReorder(record)} disabled={record.status === 'healthy'} className="rounded-lg bg-sky-50 px-2.5 py-1.5 font-semibold text-sky-700 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40" data-testid={`inventory-reorder-${record.id}`}>Reorder</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
