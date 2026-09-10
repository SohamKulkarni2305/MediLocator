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

const roleCopy: Record<AuthRole, { label: string; description: string; email: string }> = {
  ADMIN: { label: 'Admin', description: 'Authority Console and pharmacy oversight', email: 'admin@medilocator.com' },
  PHARMACIST: { label: 'Medical / Pharmacist', description: 'Prescription verification and case workstation', email: 'pharmacist@medilocator.com' },
  CUSTOMER: { label: 'Patient / User', description: 'Search, upload prescriptions, and track orders', email: 'customer@medilocator.com' },
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [role, setRole] = useState<AuthRole>('CUSTOMER');
  const [email, setEmail] = useState(roleCopy.CUSTOMER.email);
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectRole = (nextRole: AuthRole): void => { setRole(nextRole); setEmail(roleCopy[nextRole].email); setError(null); };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault(); setError(null); setIsSubmitting(true);
    try {
      const { data } = await apiClient.post<{ accessToken: string; refreshToken: string; user: AuthUser }>('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken); localStorage.setItem('refreshToken', data.refreshToken); onAuthenticated(data.user);
    } catch (requestError: unknown) {
      const message = (requestError as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message;
      setError(message ?? 'Unable to sign in. Check your email and password.');
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
          <p className="text-sm font-semibold text-sky-700">Secure sign in</p><h2 className="mt-2 text-3xl font-bold">Welcome back</h2><p className="mt-2 text-sm text-slate-500">Choose your portal to continue.</p>
          <div className="mt-7 grid gap-2" role="tablist" aria-label="Choose account type">
            {(Object.keys(roleCopy) as AuthRole[]).map((item) => <button key={item} type="button" role="tab" aria-selected={role === item} onClick={() => selectRole(item)} className={`text-left rounded-xl border p-3 transition ${role === item ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-100' : 'border-slate-200 hover:border-sky-300'}`}><span className="block text-sm font-bold">{roleCopy[item].label}</span><span className="block text-xs text-slate-500 mt-1">{roleCopy[item].description}</span></button>)}
          </div>
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <label className="block text-sm font-semibold">Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label>
            <label className="block text-sm font-semibold">Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required minLength={6} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button disabled={isSubmitting} type="submit" className="w-full rounded-xl bg-sky-600 px-4 py-3 font-bold text-white transition hover:bg-sky-700 disabled:cursor-wait disabled:opacity-60">{isSubmitting ? 'Signing in…' : `Sign in as ${roleCopy[role].label}`}</button>
          </form>
          <p className="mt-5 text-center text-xs text-slate-500">Demo accounts use the seeded password <strong>Admin@123</strong>.</p>
        </div>
      </section>
    </main>
  );
};
