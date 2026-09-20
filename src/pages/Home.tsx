import { ArrowLeft, ArrowRight, Bell, PiggyBank, Search, TrendingUp, Wallet } from 'lucide-react';
import { useMemo } from 'react';
import { getBudgets, getExpenses, getIncome } from '../services/storage';
import { formatCurrency, formatMonthLabel } from '../utils/formatters';

const currentMonth = '2026-09';

function Home() {
  const expenses = getExpenses();
  const budgets = getBudgets();
  const incomes = getIncome();

  const totalIncome = useMemo(() => incomes.reduce((sum, item) => sum + item.amount, 0), [incomes]);
  const totalSpent = useMemo(() => expenses.reduce((sum, item) => sum + item.amount, 0), [expenses]);
  const remaining = totalIncome - totalSpent;
  const savings = remaining;

  const budgetSummary = useMemo(() => {
    return budgets.map((budget) => {
      const spent = expenses
        .filter((expense) => expense.category === budget.category)
        .reduce((sum, expense) => sum + expense.amount, 0);

      return {
        ...budget,
        spent,
        remaining: budget.amount - spent,
        percentage: budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0,
      };
    });
  }, [budgets, expenses]);

  const monthlySavingsPct = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
  const totalBudget = budgets.reduce((sum, item) => sum + item.amount, 0);
  const budgetSpent = budgetSummary.reduce((sum, item) => sum + item.spent, 0);
  const budgetPercent = totalBudget > 0 ? Math.min((budgetSpent / totalBudget) * 100, 100) : 0;

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-[30px] border border-blue-400/15 bg-gradient-to-br from-[#111a38] via-[#0b1228] to-[#11102b] p-5 shadow-[0_20px_50px_rgba(15,23,42,0.35)] backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-violet-500 text-sm font-bold text-white shadow-[0_0_22px_rgba(59,130,246,0.4)]">JA</div><div><div className="text-xs text-slate-400">Good evening</div><div className="font-semibold text-white">Janhavi &amp; Aditya</div></div></div>
          <div className="flex items-center gap-1 text-slate-400"><button type="button" aria-label="Search" className="rounded-full p-2 hover:bg-white/10 hover:text-white"><Search size={18} /></button><button type="button" aria-label="Notifications" className="rounded-full p-2 hover:bg-white/10 hover:text-white"><Bell size={18} /></button></div>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <button type="button" className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10" aria-label="Previous month">
            <ArrowLeft size={18} />
          </button>
          <div className="text-center"><div className="text-[11px] uppercase tracking-[0.2em] text-blue-300">Monthly overview</div><h2 className="mt-1 text-lg font-semibold text-white">{formatMonthLabel(currentMonth)}</h2></div>
          <button type="button" className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10" aria-label="Next month">
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="mb-4 rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-center justify-between gap-4"><div><div className="text-xs uppercase tracking-[0.18em] text-slate-400">Monthly budget</div><div className="mt-2 text-3xl font-semibold text-white">{formatCurrency(budgetSpent)}</div><div className="mt-1 text-sm text-slate-400">of {formatCurrency(totalBudget)} spent</div></div><div className="relative flex h-20 w-20 items-center justify-center rounded-full" style={{ background: `conic-gradient(#3b82f6 ${budgetPercent}%, rgba(255,255,255,0.1) 0)` }}><div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111a38] text-sm font-semibold text-white">{Math.round(budgetPercent)}%</div></div></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-400" style={{ width: `${budgetPercent}%` }} /></div></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
              <span>Income</span>
              <Wallet size={16} className="text-emerald-300" />
            </div>
            <div className="text-3xl font-semibold text-white">{formatCurrency(totalIncome)}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
              <span>Spent</span>
              <TrendingUp size={16} className="text-amber-300" />
            </div>
            <div className="text-3xl font-semibold text-white">{formatCurrency(totalSpent)}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
              <span>Remaining</span>
              <Wallet size={16} className="text-sky-300" />
            </div>
            <div className="text-3xl font-semibold text-white">{formatCurrency(remaining)}</div>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-emerald-200">
              <span>Savings</span>
              <PiggyBank size={16} />
            </div>
            <div className="text-3xl font-semibold text-white">{formatCurrency(savings)}</div>
            <div className="mt-2 text-xs text-emerald-200">{Math.round(monthlySavingsPct)}% of income saved</div>
          </div>
        </div>
      </header>

      <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.25)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Monthly Budget</h3>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">{budgetSummary.length} categories</span>
        </div>

        <div className="space-y-4">
          {budgetSummary.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-white">{item.category}</div>
                  <div className="text-xs text-slate-400">{formatCurrency(item.spent)} / {formatCurrency(item.amount)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-200">{item.remaining >= 0 ? 'On track' : 'Over budget'}</div>
                  <div className="text-xs text-slate-400">{Math.round(item.percentage)}%</div>
                </div>
              </div>

              <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${
                    item.percentage < 70
                      ? 'bg-emerald-400'
                      : item.percentage < 90
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                  }`}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Remaining {formatCurrency(item.remaining)}</span>
                <span>{item.percentage < 70 ? 'Healthy' : item.percentage < 90 ? 'Approaching limit' : 'Over limit'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.25)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Recent Expenses</h3>
          <button type="button" className="text-sm text-sky-300">View all</button>
        </div>

        <div className="space-y-3">
          {expenses.slice(0, 4).map((expense) => (
            <button
              key={expense.id}
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 p-3 text-left transition hover:border-sky-500/40 hover:bg-slate-950/60"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-white">{expense.title}</div>
                <div className="mt-1 truncate text-xs text-slate-400">{expense.merchant}</div>
              </div>
              <div className="ml-3 text-right">
                <div className="text-sm font-semibold text-white">{formatCurrency(expense.amount)}</div>
                <div className="mt-1 text-[11px] text-slate-400">{expense.type} · {expense.paidBy}</div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
