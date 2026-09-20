import { Home, PiggyBank, ReceiptText, Settings as SettingsIcon, Target, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { AddExpenseSheet } from './components/AddExpenseSheet';
import Budget from './pages/Budget';
import Expenses from './pages/Expenses';
import HomePage from './pages/Home';
import Insights from './pages/Insights';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import { initializeDefaultStorage, syncStateFromCloud } from './services/storage';
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

  useEffect(() => {
    initializeDefaultStorage();
    void syncStateFromCloud()
      .catch((error) => console.error('Could not load shared household data:', error))
      .finally(() => setRefreshTick((value) => value + 1));

    const refreshInterval = window.setInterval(() => {
      void syncStateFromCloud()
        .then((changed) => {
          if (changed) setRefreshTick((value) => value + 1);
        })
        .catch((error) => console.error('Could not refresh shared household data:', error));
    }, 5000);

    return () => window.clearInterval(refreshInterval);
  }, []);

  return (
    <div className="min-h-screen bg-[#060914] text-slate-100">
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
