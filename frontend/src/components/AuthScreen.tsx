import React, { FormEvent, useState } from 'react';
import { apiClient } from '../api/client';

export type AuthRole = 'ADMIN' | 'PHARMACIST' | 'CUSTOMER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  abhaId?: string | null;
  phone?: string | null;
  mrn?: string | null;
}

interface AuthScreenProps { onAuthenticated: (user: AuthUser) => void; }

const roleCopy: Record<AuthRole, { label: string; description: string }> = {
  ADMIN: { label: 'Admin', description: 'Authority Console and pharmacy oversight' },
  PHARMACIST: { label: 'Medical / Pharmacist', description: 'Prescription verification and case workstation' },
  CUSTOMER: { label: 'Patient / User', description: 'Search, upload prescriptions, and track orders' },
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<AuthRole>('CUSTOMER');
  const [registrationRole, setRegistrationRole] = useState<'CUSTOMER' | 'PHARMACIST'>('CUSTOMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [abhaId, setAbhaId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectRole = (nextRole: AuthRole): void => { setRole(nextRole); setError(null); };
  const selectMode = (nextMode: 'login' | 'register'): void => {
    setMode(nextMode); setError(null); setName(''); setEmail(''); setPassword(''); setPhone(''); setAbhaId(''); setRegistrationRole('CUSTOMER');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault(); setError(null); setIsSubmitting(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login' ? { email, password } : { name, email, password, role: registrationRole, phone: phone || undefined, abhaId: abhaId || undefined };
      const { data } = await apiClient.post<{ accessToken: string; refreshToken: string; user: AuthUser }>(endpoint, payload);
      localStorage.setItem('accessToken', data.accessToken); localStorage.setItem('refreshToken', data.refreshToken); onAuthenticated(data.user);
    } catch (requestError: unknown) {
      const message = (requestError as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message;
      const isOffline = !((requestError as { response?: unknown }).response);
      setError(message ?? (isOffline
        ? 'Unable to reach the MediLocator server. Start the backend and try again.'
        : mode === 'login' ? 'Unable to sign in. Check your email and password.' : 'Unable to create your account. Please check the details and try again.'));
    } finally { setIsSubmitting(false); }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-5xl grid lg:grid-cols-[1.05fr_0.95fr] overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-sky-950 via-slate-900 to-slate-950">
          <div><div className="flex items-center gap-3 mb-10"><div className="h-11 w-11 rounded-2xl bg-sky-500 flex items-center justify-center text-2xl font-bold">+</div><span className="text-2xl font-bold">Medi<span className="text-sky-400">Locator</span></span></div><p className="text-xs uppercase tracking-[0.3em] text-sky-300">Trusted care network</p><h1 className="mt-4 text-4xl font-bold leading-tight">One secure workspace for every care role.</h1><p className="mt-5 max-w-md text-slate-300 leading-7">Connect patients, pharmacists, and administrators through verified prescriptions, transparent pricing, and accountable pharmacy operations.</p></div>
          <div className="grid grid-cols-3 gap-3 text-center text-xs text-slate-300"><div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"><strong className="block text-xl text-white">3</strong>role portals</div><div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"><strong className="block text-xl text-white">24/7</strong>care access</div><div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"><strong className="block text-xl text-white">Secure</strong>by design</div></div>
        </div>
        <div className="p-6 sm:p-10 bg-white text-slate-900">
          <div className="lg:hidden flex items-center gap-3 mb-8"><div className="h-10 w-10 rounded-xl bg-sky-500 flex items-center justify-center text-xl font-bold text-white">+</div><span className="text-xl font-bold">Medi<span className="text-sky-600">Locator</span></span></div>
          <div className="flex rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Account access">
            <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => selectMode('login')} className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold ${mode === 'login' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500'}`}>Existing user login</button>
            <button type="button" role="tab" aria-selected={mode === 'register'} onClick={() => selectMode('register')} className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold ${mode === 'register' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500'}`}>New user sign up</button>
          </div>
          <p className="mt-7 text-sm font-semibold text-sky-700">{mode === 'login' ? 'Secure sign in' : 'Create your account'}</p><h2 className="mt-2 text-3xl font-bold">{mode === 'login' ? 'Welcome back' : 'Get started'}</h2><p className="mt-2 text-sm text-slate-500">{mode === 'login' ? 'Choose your portal to continue.' : 'Create a patient account to search medicines and manage prescriptions.'}</p>
          {mode === 'login' && <div className="mt-7 grid gap-2" role="tablist" aria-label="Choose account type">
            {(Object.keys(roleCopy) as AuthRole[]).map((item) => <button key={item} type="button" role="tab" aria-selected={role === item} onClick={() => selectRole(item)} className={`text-left rounded-xl border p-3 transition ${role === item ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-100' : 'border-slate-200 hover:border-sky-300'}`}><span className="block text-sm font-bold">{roleCopy[item].label}</span><span className="block text-xs text-slate-500 mt-1">{roleCopy[item].description}</span></button>)}
          </div>}
          {mode === 'register' && <div className="mt-7 grid grid-cols-2 gap-2" role="group" aria-label="Choose account type">
            <button type="button" onClick={() => setRegistrationRole('CUSTOMER')} className={`rounded-xl border p-3 text-left transition ${registrationRole === 'CUSTOMER' ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-100' : 'border-slate-200 hover:border-sky-300'}`}><span className="block text-sm font-bold">Patient / User</span><span className="mt-1 block text-xs text-slate-500">Search, upload, and track prescriptions</span></button>
            <button type="button" onClick={() => setRegistrationRole('PHARMACIST')} className={`rounded-xl border p-3 text-left transition ${registrationRole === 'PHARMACIST' ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-100' : 'border-slate-200 hover:border-sky-300'}`}><span className="block text-sm font-bold">Pharmacist</span><span className="mt-1 block text-xs text-slate-500">Review prescriptions and manage cases</span></button>
          </div>}
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {mode === 'register' && <>
              <label className="block text-sm font-semibold">Full name<input value={name} onChange={(event) => setName(event.target.value)} type="text" autoComplete="name" required className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label>
              <label className="block text-sm font-semibold">Phone (optional)<input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" autoComplete="tel" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label>
              <label className="block text-sm font-semibold">ABHA ID (optional)<input value={abhaId} onChange={(event) => setAbhaId(event.target.value)} type="text" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label>
            </>}
            <label className="block text-sm font-semibold">Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label>
            <label className="block text-sm font-semibold">Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'login' ? 6 : 8} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button disabled={isSubmitting} type="submit" className="w-full rounded-xl bg-sky-600 px-4 py-3 font-bold text-white transition hover:bg-sky-700 disabled:cursor-wait disabled:opacity-60">{isSubmitting ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : mode === 'login' ? `Sign in as ${roleCopy[role].label}` : 'Create patient account'}</button>
          </form>
          <p className="mt-5 text-center text-xs text-slate-500">{mode === 'login' ? 'Use the email and password associated with your account.' : registrationRole === 'PHARMACIST' ? 'Pharmacist accounts may require verification before handling live prescriptions.' : 'New patient accounts are created securely.'}</p>
        </div>
      </section>
    </main>
  );
};
