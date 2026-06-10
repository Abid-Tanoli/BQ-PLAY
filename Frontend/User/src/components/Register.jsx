import React, { useState } from 'react';
import { register } from '../pages/auth/auth';

const accountTypes = [
  {
    value: 'player',
    label: 'Player',
    description: 'Create your player profile and join teams or events.',
  },
  {
    value: 'handler',
    label: 'Cricket Handler',
    description: 'Manage your own teams, squads, matches, tournaments and local scoring.',
  },
  {
    value: 'organization_admin',
    label: 'Organization Admin',
    description: 'For schools, colleges, universities, industries, clubs, leagues and academies.',
  },
];

const organizationCategories = [
  'School',
  'College',
  'University',
  'Organization',
  'Business',
  'Industry',
  'Club',
  'Academy',
  'League',
  'Other',
];

export default function Register({ onSuccess, onCancel }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('handler');
  const [organizationCategory, setOrganizationCategory] = useState('School');
  const [organizationName, setOrganizationName] = useState('');
  const [phone, setPhone] = useState('');
  const [joinIntent, setJoinIntent] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const user = await register(name, email, password, {
        accountType,
        organizationCategory: accountType === 'player' ? '' : organizationCategory,
        organizationName,
        phone,
        joinIntent,
      });
      onSuccess?.(user);
    } catch (error) {
      setErr(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="bg-[#031d44] px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-200">Join BQ-PLAY</p>
              <h3 className="mt-1 text-2xl font-black uppercase tracking-tight">Choose how you want to join</h3>
              <p className="mt-2 max-w-2xl text-sm font-semibold text-blue-100/80">
                BQ-PLAY provides the platform. Local cricket handlers manage their own teams, playing XI, squads, matches and tournaments.
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/20"
            >
              Close
            </button>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5 p-6">
          <div className="grid gap-3 md:grid-cols-3">
            {accountTypes.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setAccountType(item.value)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  accountType === item.value
                    ? 'border-[#031d44] bg-[#031d44] text-white shadow-lg'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300'
                }`}
              >
                <span className="block text-sm font-black uppercase tracking-wide">{item.label}</span>
                <span className={`mt-2 block text-xs font-semibold leading-relaxed ${accountType === item.value ? 'text-blue-100' : 'text-slate-500'}`}>
                  {item.description}
                </span>
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

        <input
          placeholder="Password (minimum 8 characters)"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

          {accountType !== 'player' && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Handler details</p>
              <div className="grid gap-4 md:grid-cols-2">
                <select
                  value={organizationCategory}
                  onChange={e => setOrganizationCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {organizationCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <input
                  placeholder="Organization, school, college, club or league name"
                  value={organizationName}
                  onChange={e => setOrganizationName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input
                  placeholder="Phone (optional)"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  placeholder="What will you manage? e.g. school league, club tournament"
                  value={joinIntent}
                  onChange={e => setJoinIntent(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          )}

        {err && <p className="text-red-500">{err}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold text-slate-500">
            Player accounts can follow and build profiles. Handler/admin accounts can request scoring and event management access.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500 disabled:opacity-60"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
