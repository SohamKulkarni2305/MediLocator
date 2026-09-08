import React, { useState } from 'react';
import { Currency } from '../types';
import { CustomerBottomNav } from './CustomerBottomNav';
import {
  EditProfileModal,
  DEFAULT_USER_PROFILE,
  UserProfileDetails,
} from './EditProfileModal';

interface CustomerAccountProps {
  currency: Currency;
  onNavigateToSearch: () => void;
  onNavigateToPrescription: () => void;
  onNavigateToTracking: () => void;
}

export const CustomerAccount: React.FC<CustomerAccountProps> = ({
  currency,
  onNavigateToSearch,
  onNavigateToPrescription,
  onNavigateToTracking,
}) => {
  const [profile, setProfile] = useState<UserProfileDetails>(DEFAULT_USER_PROFILE);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editInitialTab, setEditInitialTab] = useState<'general' | 'contacts' | 'clinical'>('general');
  const [refill1Active, setRefill1Active] = useState(true);
  const [refill2Active, setRefill2Active] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const openEditModal = (tab: 'general' | 'contacts' | 'clinical' = 'general') => {
    setEditInitialTab(tab);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (updated: UserProfileDetails) => {
    setProfile(updated);
    showToast('Patient details & clinical records updated successfully');
  };

  const formatPrice = (usd: number, inr: number) => {
    return currency === 'USD' ? `$${usd.toFixed(2)}` : `₹${inr.toFixed(2)}`;
  };

  const initials = profile.fullName
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'PT';

  const genderLabel = profile.gender === 'M' ? 'M' : profile.gender === 'F' ? 'F' : 'Other';

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2 rounded-full shadow-lg border border-slate-700 animate-in fade-in flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-sky-400">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Mobile/Web Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-2.5 shadow-2xs">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
          {/* Logo / Brand Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
            <span className="material-symbols-outlined text-sky-600 text-base">vital_signs</span>
            <span className="font-headline font-bold text-xs tracking-tight">HealthSync</span>
          </div>

          {/* Location Deliver-to Dropdown */}
          <button
            onClick={() => showToast('Delivery address: Indiranagar, Bengaluru / Midtown NY')}
            className="flex items-center gap-1 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200/80 px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-sky-600">location_on</span>
            <span className="truncate max-w-[140px] sm:max-w-[200px]">Deliver to <strong>10001 Midtown, NY</strong></span>
            <span className="material-symbols-outlined text-xs text-sky-700">arrow_drop_down</span>
          </button>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Cart Icon */}
            <button
              onClick={onNavigateToTracking}
              className="relative p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="View Cart / Active Orders"
            >
              <span className="material-symbols-outlined text-lg">shopping_bag</span>
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                2
              </span>
            </button>

            {/* Profile Avatar Icon */}
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* Patient Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar with Verified check */}
              <div className="relative">
                <div className="w-13 h-13 rounded-2xl bg-slate-950 text-white font-headline font-bold text-base flex items-center justify-center shadow-xs tracking-wider">
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[11px] font-bold">check</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-headline font-black text-slate-900 text-base leading-tight">
                    {profile.fullName}
                  </h2>
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded">
                    {profile.age} {genderLabel}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Blood Group: <strong>{profile.bloodGroup}</strong></span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => openEditModal('general')}
              className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
              title="Edit Patient Details"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              <span className="hidden sm:inline">Edit Details</span>
            </button>
          </div>

          {/* Chronic Regimen Badge */}
          <div className="flex items-center justify-between gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-amber-700">medical_services</span>
              <span>Chronic Regimen: <strong>{profile.chronicCondition}</strong></span>
            </div>
            <button
              onClick={() => openEditModal('clinical')}
              className="text-[10px] text-amber-800 hover:underline font-bold cursor-pointer"
            >
              Modify
            </button>
          </div>

          {/* Address Line */}
          <div className="flex items-start justify-between gap-1.5 text-xs text-slate-600">
            <div className="flex items-start gap-1.5">
              <span className="material-symbols-outlined text-sm text-slate-400 mt-0.5">location_on</span>
              <span className="line-clamp-1">{profile.primaryAddress}</span>
            </div>
            <button
              onClick={() => openEditModal('contacts')}
              className="text-[10px] text-sky-700 hover:underline font-semibold cursor-pointer shrink-0 ml-1"
            >
              Change
            </button>
          </div>

          {/* ABHA Identity Verification */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-700 text-base">badge</span>
              <div>
                <span className="font-bold text-slate-800 block leading-tight">ABHA: {profile.abhaId}</span>
                <span className="text-[11px] text-slate-500">Linked &amp; Verified NDHM</span>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
              profile.abhaStatus === 'Active'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : 'bg-amber-100 text-amber-800 border-amber-200'
            }`}>
              <span className="material-symbols-outlined text-xs">
                {profile.abhaStatus === 'Active' ? 'check' : 'hourglass_top'}
              </span>
              <span>{profile.abhaStatus}</span>
            </span>
          </div>
        </div>

        {/* MediLocator Lifetime Savings Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              MEDILOCATOR LIFETIME SAVINGS
            </span>
            <div className="w-7 h-7 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">savings</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <div className="font-headline font-black text-2xl sm:text-3xl text-white tracking-tight">
              {formatPrice(148.20, 14820.00)}
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
              +73.4% Avg Cost Cut
            </span>
          </div>

          {/* 3 Metrics Row */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <div className="font-headline font-bold text-sm text-white">18</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Orders Done</div>
            </div>
            <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <div className="font-headline font-bold text-sm text-sky-400">6 Salts</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Bioequivalent</div>
            </div>
            <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <div className="font-headline font-bold text-sm text-emerald-400">
                {currency === 'USD' ? '$36.60' : '₹3,660'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Next Refill Cut</div>
            </div>
          </div>

          {/* Tier Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1 text-sky-300">
                <span className="material-symbols-outlined text-sm">shield</span>
                <span>Tier 2 Wellness Member</span>
              </div>
              <span>{currency === 'USD' ? '$1.80 to Tier 3' : '₹180 to Tier 3'}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-sky-500 h-full rounded-full w-4/5"></div>
            </div>
          </div>
        </div>

        {/* Active Chronic Regimen */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline font-bold text-slate-900 text-sm">
                Active Chronic Regimen
              </h3>
              <p className="text-[11px] text-slate-500">
                2 Subscriptions active with automated generic equivalence
              </p>
            </div>
            <button
              onClick={onNavigateToSearch}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-sky-700 border border-slate-300 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Add</span>
            </button>
          </div>

          {/* Regimen Card 1: Atorvastatin */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
                  RX SCHEDULE H
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[11px]">check</span>
                  <span>Bioequivalent</span>
                </span>
              </div>
              <div className="text-right">
                <span className="font-headline font-bold text-slate-900 text-sm">
                  {formatPrice(11.50, 115.00)}
                </span>
                <span className="text-[11px] text-emerald-600 block font-medium">
                  {currency === 'USD' ? 'Saves $30.50/mo' : 'Saves ₹305/mo'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-headline font-bold text-slate-900 text-sm">
                Atorvastatin Calcium 10mg
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Prescribed: <span className="line-through text-slate-400">Lipitor 10mg</span> • Generic: <strong className="text-slate-700">Cipla LipiSafe 10mg</strong>
              </p>
              <p className="text-xs text-sky-700 font-medium mt-1">
                Dosage: 1 Tablet OD at Bedtime (Post Dinner)
              </p>
            </div>

            {/* Toggle Refill Strip */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="material-symbols-outlined text-sm text-sky-600">autorenew</span>
                <span>Next Refill in 12 days (Aug 24) • Dispatched via MetroCare #104</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={refill1Active}
                  onChange={(e) => {
                    setRefill1Active(e.target.checked);
                    showToast(e.target.checked ? 'Atorvastatin refill resumed' : 'Atorvastatin refill paused');
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>
          </div>

          {/* Regimen Card 2: Metformin */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                  DAILY ESSENTIAL
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[11px]">check</span>
                  <span>Bioequivalent</span>
                </span>
              </div>
              <div className="text-right">
                <span className="font-headline font-bold text-slate-900 text-sm">
                  {formatPrice(7.20, 72.00)}
                </span>
                <span className="text-[11px] text-emerald-600 block font-medium">
                  {currency === 'USD' ? 'Saves $20.80/mo' : 'Saves ₹208/mo'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-headline font-bold text-slate-900 text-sm">
                Metformin HCl 500mg ER
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Prescribed: <span className="line-through text-slate-400">Glucophage 500mg</span> • Generic: <strong className="text-slate-700">Sun Met-SR 500mg</strong>
              </p>
              <p className="text-xs text-sky-700 font-medium mt-1">
                Dosage: 1 Tablet BD after Breakfast &amp; Dinner
              </p>
            </div>

            {/* Toggle Refill Strip */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
                <span>Next Refill in 12 days (Aug 24) • Tamper-sealed cold container</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={refill2Active}
                  onChange={(e) => {
                    setRefill2Active(e.target.checked);
                    showToast(e.target.checked ? 'Metformin refill resumed' : 'Metformin refill paused');
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Clinical Safety Gate & Vitals */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-rose-600 text-lg">shield</span>
              <h3 className="font-headline font-bold text-slate-900 text-sm">
                Clinical Safety Gate &amp; Vitals
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal('clinical')}
                className="text-[11px] font-semibold text-sky-700 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">edit</span>
                <span>Edit Vitals</span>
              </button>
            </div>
          </div>

          {/* Known Allergy Alert */}
          <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <span className="material-symbols-outlined text-sm">warning</span>
                <span>Known Allergy: {profile.knownAllergies}</span>
              </div>
              <button
                onClick={() => openEditModal('clinical')}
                className="text-[10px] text-rose-700 hover:underline font-bold cursor-pointer"
              >
                Change
              </button>
            </div>
            <p className="text-rose-700 text-[11px] leading-relaxed">
              {profile.allergyDetails}
            </p>
          </div>

          {/* 3 Vitals Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div
              onClick={() => openEditModal('clinical')}
              className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-sky-300 transition cursor-pointer"
              title="Click to edit Blood Pressure"
            >
              <div className="text-[11px] text-slate-500 font-medium">Blood Pressure</div>
              <div className="font-headline font-bold text-sm text-slate-900 mt-0.5">{profile.bloodPressure}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-0.5">
                <span>Recent</span>
                <span className="material-symbols-outlined text-[10px]">edit</span>
              </div>
            </div>
            <div
              onClick={() => openEditModal('clinical')}
              className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-sky-300 transition cursor-pointer"
              title="Click to edit HbA1c"
            >
              <div className="text-[11px] text-slate-500 font-medium">HbA1c</div>
              <div className="font-headline font-bold text-sm text-amber-600 mt-0.5">{profile.hba1c}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-0.5">
                <span>Target &lt; 7.0%</span>
                <span className="material-symbols-outlined text-[10px]">edit</span>
              </div>
            </div>
            <div
              onClick={() => openEditModal('clinical')}
              className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-sky-300 transition cursor-pointer"
              title="Click to edit Weight"
            >
              <div className="text-[11px] text-slate-500 font-medium">Weight</div>
              <div className="font-headline font-bold text-sm text-slate-900 mt-0.5">{profile.weight}</div>
              <div className="text-[10px] text-emerald-600 mt-0.5 flex items-center gap-0.5">
                <span>Active Track</span>
                <span className="material-symbols-outlined text-[10px]">edit</span>
              </div>
            </div>
          </div>

          {/* Primary Doctor Credit */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className="material-symbols-outlined text-sm text-sky-600">stethoscope</span>
              <span className="truncate">Primary: <strong>{profile.primaryDoctor}</strong> ({profile.doctorAffiliation})</span>
            </div>
            <button
              onClick={() => openEditModal('clinical')}
              className="text-[10px] text-sky-700 hover:underline font-semibold cursor-pointer shrink-0 ml-1"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Prescription Repository */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline font-bold text-slate-900 text-sm">
                Prescription Repository
              </h3>
              <p className="text-[11px] text-slate-500">2 Active digital prescriptions on file</p>
            </div>
            <button
              onClick={onNavigateToPrescription}
              className="text-[11px] font-semibold text-sky-700 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>View All</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>

          {/* Prescription File Card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-900 text-white flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-xl">description</span>
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs truncate max-w-[180px] sm:max-w-[260px]">
                  Rx-Cardio-Metabolic-202...
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-xs text-emerald-600">verified</span>
                  <span>Dr. Arvind Mehta • Valid till Dec 2026</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => showToast('Downloading digital copy of Rx...')}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                title="Download Prescription"
              >
                <span className="material-symbols-outlined text-base">download</span>
              </button>
              <button
                onClick={onNavigateToPrescription}
                className="px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
              >
                View
              </button>
            </div>
          </div>
        </div>

        {/* Settings & Care Vault */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-headline font-bold text-slate-900 text-sm">
              Settings &amp; Care Vault
            </h3>
            <button
              onClick={() => openEditModal('contacts')}
              className="text-[11px] font-semibold text-sky-700 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs">edit</span>
              <span>Manage All</span>
            </button>
          </div>

          {[
            {
              id: 'family',
              title: 'Family Member Profiles',
              subtitle: `Spouse (${profile.spouseName}) • Add Parents`,
              icon: 'group',
              action: () => openEditModal('contacts'),
            },
            {
              id: 'address',
              title: 'Hyperlocal Delivery Addresses',
              subtitle: `${profile.primaryAddress.split(',')[0]} (Default)`,
              icon: 'pin_drop',
              action: () => openEditModal('contacts'),
            },
            {
              id: 'payment',
              title: 'Payment Methods & UPI Autopay',
              subtitle: `UPI AutoPay (${profile.upiId}) Active`,
              icon: 'account_balance_wallet',
              action: () => openEditModal('contacts'),
            },
            {
              id: 'emergency',
              title: 'Emergency Medical Contacts',
              subtitle: `${profile.emergencyContactName} (${profile.emergencyContactPhone})`,
              icon: 'emergency',
              action: () => openEditModal('contacts'),
            },
            {
              id: 'security',
              title: 'Security & Health Data Privacy',
              subtitle: '21 CFR Part 11 • AES-256 Encrypted Vault',
              icon: 'lock',
              action: () => showToast('Health data encrypted with AES-256 GCM under 21 CFR Part 11.'),
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className="w-full py-2.5 px-2 rounded-xl hover:bg-slate-50 transition flex items-center justify-between text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-sky-50 group-hover:text-sky-700 transition">
                  <span className="material-symbols-outlined text-base">{item.icon}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800 text-xs block leading-tight">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-500">{item.subtitle}</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-base">chevron_right</span>
            </button>
          ))}

          {/* Sign Out Button */}
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => showToast(`Session signed out for ${profile.fullName}. Switched to guest mode.`)}
              className="w-full py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>Sign Out of {profile.fullName} Profile</span>
            </button>
          </div>

          {/* Footer Build info */}
          <div className="text-center pt-2 text-[10px] font-mono text-slate-400">
            MediLocator Clinical Platform v4.12.8 (Build 904)
          </div>
        </div>
      </main>

      {/* Edit Patient Details Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
        initialTab={editInitialTab}
      />

      {/* Customer Bottom Navigation Bar */}
      <CustomerBottomNav
        activeTab="account"
        onNavigateToSearch={onNavigateToSearch}
        onNavigateToPrescription={onNavigateToPrescription}
        onNavigateToTracking={onNavigateToTracking}
        onNavigateToAccount={() => {}}
      />
    </div>
  );
};
