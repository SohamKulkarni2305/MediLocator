import React, { useState } from 'react';

export interface UserProfileDetails {
  fullName: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  bloodGroup: string;
  chronicCondition: string;
  primaryAddress: string;
  abhaId: string;
  abhaStatus: 'Active' | 'Pending' | 'Unlinked';
  primaryDoctor: string;
  doctorAffiliation: string;
  knownAllergies: string;
  allergyDetails: string;
  bloodPressure: string;
  hba1c: string;
  weight: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  spouseName: string;
  upiId: string;
}

export const DEFAULT_USER_PROFILE: UserProfileDetails = {
  fullName: 'Rajesh Sharma',
  age: 58,
  gender: 'M',
  bloodGroup: 'B+ Positive',
  chronicCondition: 'HTN & Type 2 Diabetes',
  primaryAddress: 'Flat 402, Green Glen Heights, Indiranagar, Bengaluru - 560038',
  abhaId: '91-4820-1940-2219',
  abhaStatus: 'Active',
  primaryDoctor: 'Dr. Arvind Mehta, MD',
  doctorAffiliation: 'Cardiology, Apollo Heart Center',
  knownAllergies: 'Sulfa Drugs',
  allergyDetails: 'Automated dispensation block active. Verified zero penicillin or statin contraindications.',
  bloodPressure: '142/88',
  hba1c: '7.4%',
  weight: '76.5 kg',
  emergencyContactName: 'Rohan Sharma (Son)',
  emergencyContactPhone: '+91-98450-XXXXX',
  spouseName: 'Kavita Sharma',
  upiId: 'HDFC ••8920',
};

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfileDetails;
  onSave: (updated: UserProfileDetails) => void;
  initialTab?: 'general' | 'contacts' | 'clinical';
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  initialTab = 'general',
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'contacts' | 'clinical'>(initialTab);
  const [formData, setFormData] = useState<UserProfileDetails>(profile);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync with incoming profile when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData(profile);
      setActiveTab(initialTab);
      setErrorMsg(null);
    }
  }, [isOpen, profile, initialTab]);

  if (!isOpen) return null;

  const handleChange = (field: keyof UserProfileDetails, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setErrorMsg('Full name cannot be empty.');
      return;
    }
    if (formData.age <= 0 || formData.age > 120) {
      setErrorMsg('Please enter a valid age (1-120).');
      return;
    }
    onSave(formData);
    onClose();
  };

  const handleResetToDefault = () => {
    setFormData(DEFAULT_USER_PROFILE);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">edit_note</span>
            </div>
            <div>
              <h3 className="font-headline font-black text-slate-900 text-base leading-tight">
                Edit Patient Details
              </h3>
              <p className="text-[11px] text-slate-500">
                Update personal identity, clinical history &amp; care vault info
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 pb-1 border-b border-slate-200 bg-white flex gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`pb-2 px-2.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'border-sky-600 text-sky-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-sm">person</span>
            <span>Identity</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('clinical')}
            className={`pb-2 px-2.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'clinical'
                ? 'border-sky-600 text-sky-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-sm">vital_signs</span>
            <span>Clinical &amp; Vitals</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`pb-2 px-2.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'contacts'
                ? 'border-sky-600 text-sky-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-sm">home_pin</span>
            <span>Address &amp; Contacts</span>
          </button>
        </div>

        {/* Form Body with Scroll */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2 text-xs">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: GENERAL IDENTITY */}
          {activeTab === 'general' && (
            <div className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="e.g. Rajesh Sharma"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Age <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    min="1"
                    max="120"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value as 'M' | 'F' | 'Other')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="M">Male (M)</option>
                    <option value="F">Female (F)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => handleChange('bloodGroup', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="B+ Positive">B+ Positive</option>
                    <option value="B- Negative">B- Negative</option>
                    <option value="A+ Positive">A+ Positive</option>
                    <option value="A- Negative">A- Negative</option>
                    <option value="O+ Positive">O+ Positive</option>
                    <option value="O- Negative">O- Negative</option>
                    <option value="AB+ Positive">AB+ Positive</option>
                    <option value="AB- Negative">AB- Negative</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ABHA Status
                  </label>
                  <select
                    value={formData.abhaStatus}
                    onChange={(e) => handleChange('abhaStatus', e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="Active">Active (Linked &amp; Verified)</option>
                    <option value="Pending">Pending Verification</option>
                    <option value="Unlinked">Unlinked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NDHM ABHA Health ID
                </label>
                <input
                  type="text"
                  value={formData.abhaId}
                  onChange={(e) => handleChange('abhaId', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="e.g. 91-4820-1940-2219"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  National Digital Health Mission 14-digit patient identity
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: CLINICAL & VITALS */}
          {activeTab === 'clinical' && (
            <div className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chronic Regimen Enrollment
                </label>
                <input
                  type="text"
                  value={formData.chronicCondition}
                  onChange={(e) => handleChange('chronicCondition', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="e.g. HTN & Type 2 Diabetes"
                />
              </div>

              <div>
                <label className="block font-semibold text-rose-700 mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  <span>Known Clinical Allergy</span>
                </label>
                <input
                  type="text"
                  value={formData.knownAllergies}
                  onChange={(e) => handleChange('knownAllergies', e.target.value)}
                  className="w-full px-3 py-2 bg-rose-50/50 border border-rose-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  placeholder="e.g. Sulfa Drugs, Penicillin"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Allergy Protocol &amp; Dispensation Gate Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.allergyDetails}
                  onChange={(e) => handleChange('allergyDetails', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Vitals row */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                  Current Vitals Record
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      value={formData.bloodPressure}
                      onChange={(e) => handleChange('bloodPressure', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
                      placeholder="142/88"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">HbA1c</label>
                    <input
                      type="text"
                      value={formData.hba1c}
                      onChange={(e) => handleChange('hba1c', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
                      placeholder="7.4%"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Weight</label>
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) => handleChange('weight', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
                      placeholder="76.5 kg"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Primary Doctor
                  </label>
                  <input
                    type="text"
                    value={formData.primaryDoctor}
                    onChange={(e) => handleChange('primaryDoctor', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="Dr. Arvind Mehta, MD"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Affiliation / Hospital
                  </label>
                  <input
                    type="text"
                    value={formData.doctorAffiliation}
                    onChange={(e) => handleChange('doctorAffiliation', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="Apollo Heart Center"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTACTS & CARE VAULT */}
          {activeTab === 'contacts' && (
            <div className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Primary Hyperlocal Delivery Address
                </label>
                <textarea
                  rows={2}
                  value={formData.primaryAddress}
                  onChange={(e) => handleChange('primaryAddress', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="Flat, building, locality, pincode..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="e.g. Rohan Sharma (Son)"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Emergency Phone
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="+91-98450-XXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Spouse / Family Contact
                  </label>
                  <input
                    type="text"
                    value={formData.spouseName}
                    onChange={(e) => handleChange('spouseName', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="e.g. Kavita Sharma"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    UPI AutoPay Handle
                  </label>
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={(e) => handleChange('upiId', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="Google Pay (HDFC ••8920)"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-sm">lock</span>
                <span>Protected by 21 CFR Part 11 and client-side AES-256 Vault.</span>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-[11px] text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
            >
              Reset to Defaults
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">check</span>
                <span>Save Profile Details</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
