import { Bell, Check, Home, PiggyBank, ReceiptText, RefreshCw, Save, Settings as SettingsIcon, Target, TrendingUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { AddExpenseSheet } from './components/AddExpenseSheet';
import type { Expense } from './types/finance';
import Budget from './pages/Budget';
import Expenses from './pages/Expenses';
import HomePage from './pages/Home';
import Insights from './pages/Insights';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import { initializeDefaultStorage, syncStateFromCloud, syncStateToCloud } from './services/storage';
import './App.css';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/expenses', label: 'Expenses', icon: ReceiptText },
  { to: '/budget', label: 'Budget', icon: PiggyBank },
  { to: '/insights', label: 'Insights', icon: TrendingUp },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

function AppShell() {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [syncMessage, setSyncMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [newExpenseNotice, setNewExpenseNotice] = useState<string[]>([]);

  async function refreshFromCloud(showStatus = true) {
    setIsSyncing(true);
    try {
      const result = await syncStateFromCloud();
      if (result.newExpenses.length > 0) {
        setNewExpenseNotice(result.newExpenses.map((expense: Expense) => `${expense.paidBy === 'janhavi' ? 'Janhavi' : expense.paidBy === 'aditya' ? 'Aditya' : 'Someone'} added ${expense.title} for ₹${expense.amount.toLocaleString('en-IN')}`));
      }
      setRefreshTick((value) => value + 1);
      if (showStatus) setSyncMessage('Latest household data loaded.');
    } catch (error) {
      setSyncMessage(error instanceof Error ? error.message : 'Could not refresh shared data.');
    } finally {
      setIsSyncing(false);
    }
  }

  async function saveToCloud() {
    setIsSyncing(true);
    const saved = await syncStateToCloud();
    setSyncMessage(saved ? 'Saved to the shared household.' : 'Shared sync is not configured.');
    setIsSyncing(false);
  }

  useEffect(() => {
    initializeDefaultStorage();
    void refreshFromCloud(false);

    const refreshInterval = window.setInterval(() => {
      void syncStateFromCloud()
        .then((result) => {
          if (result.newExpenses.length > 0) {
            setNewExpenseNotice(result.newExpenses.map((expense: Expense) => `${expense.paidBy === 'janhavi' ? 'Janhavi' : expense.paidBy === 'aditya' ? 'Aditya' : 'Someone'} added ${expense.title} for ₹${expense.amount.toLocaleString('en-IN')}`));
          }
          if (result.changed) setRefreshTick((value) => value + 1);
        })
        .catch((error) => console.error('Could not refresh shared household data:', error));
    }, 5000);

    return () => window.clearInterval(refreshInterval);
  }, []);

  return (
    <div className="min-h-screen bg-[#060914] text-slate-100">
      {newExpenseNotice.length > 0 && <div className="fixed inset-x-3 top-3 z-[70] mx-auto max-w-md rounded-2xl bg-blue-500 px-4 py-3 text-sm text-white shadow-[0_18px_40px_rgba(37,99,235,0.35)]"><div className="flex items-start gap-3"><Bell size={18} className="mt-0.5 shrink-0" /><div className="min-w-0 flex-1"><div className="font-semibold">New household expense</div>{newExpenseNotice.map((notice) => <div key={notice} className="mt-1 text-blue-50">{notice}</div>)}</div><button type="button" aria-label="Dismiss notification" onClick={() => setNewExpenseNotice([])} className="rounded-lg p-1 hover:bg-white/10"><X size={16} /></button></div></div>}
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#070a14]/85 p-5 lg:flex lg:flex-col">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 text-lg font-bold text-white shadow-[0_0_28px_rgba(59,130,246,0.45)]">
              J
            </div>
            <div>
              <div className="text-sm text-slate-400">Household</div>
              <div className="font-semibold text-white">Janhavi & Aditya</div>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-500/15 text-white shadow-[inset_3px_0_0_#3b82f6]'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto rounded-3xl border border-blue-400/25 bg-gradient-to-br from-blue-500/20 to-violet-500/10 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-blue-200">Quick action</div>
            <button
              type="button"
              onClick={() => setIsAddSheetOpen(true)}
              className="mt-3 w-full rounded-2xl bg-blue-500 px-3 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)] transition hover:bg-blue-400"
            >
              + Add Expense
            </button>
          </div>
        </aside>

        <main className="flex-1 p-3 pb-24 sm:p-6 lg:pb-6">
          <div className="mx-auto max-w-5xl">
            <div className="mb-4 flex items-center justify-end gap-2"><button type="button" onClick={saveToCloud} disabled={isSyncing} className="inline-flex items-center gap-2 rounded-xl bg-blue-500/15 px-3 py-2 text-xs font-semibold text-blue-200 transition hover:bg-blue-500/25 disabled:opacity-60"><Save size={15} /> Save</button><button type="button" onClick={() => void refreshFromCloud()} disabled={isSyncing} className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-60"><RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} /> Refresh</button>{syncMessage && <span className="hidden items-center gap-1 text-xs text-slate-400 sm:flex"><Check size={13} /> {syncMessage}</span>}</div>
            <Routes>
              <Route path="/" element={<HomePage key={refreshTick} />} />
              <Route path="/expenses" element={<Expenses key={refreshTick} />} />
              <Route path="/budget" element={<Budget key={refreshTick} />} />
              <Route path="/insights" element={<Insights key={refreshTick} />} />
              <Route path="/goals" element={<Goals key={refreshTick} />} />
              <Route path="/settings" element={<Settings key={refreshTick} />} />
            </Routes>
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#080b16]/92 p-2 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around gap-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] transition ${
                  isActive ? 'bg-blue-500/15 text-blue-300' : 'text-slate-400'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <button
        type="button"
        onClick={() => setIsAddSheetOpen(true)}
        className="fixed bottom-20 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-2xl font-semibold text-white shadow-[0_18px_40px_rgba(59,130,246,0.45)] transition hover:scale-105 lg:bottom-8 lg:right-8"
        aria-label="Add expense"
      >
        +
      </button>

      {isAddSheetOpen && (
        <AddExpenseSheet
          onClose={() => setIsAddSheetOpen(false)}
          onSaved={() => {
            setIsAddSheetOpen(false);
            setRefreshTick((value) => value + 1);
          }}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
