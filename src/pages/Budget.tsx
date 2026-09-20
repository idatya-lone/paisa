import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { deleteBudget, getBudgets, getExpenses, saveBudget } from '../services/storage';
import { formatCurrency } from '../utils/formatters';

const currentMonth = '2026-09';

function Budget() {
  const [budgets, setBudgets] = useState(getBudgets);
  const expenses = getExpenses();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftAmount, setDraftAmount] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const summary = useMemo(() => budgets.filter((budget) => budget.month === currentMonth).map((budget) => { const spent = expenses.filter((expense) => expense.category === budget.category).reduce((sum, expense) => sum + expense.amount, 0); return { ...budget, spent, remaining: budget.amount - spent, percentage: budget.amount ? (spent / budget.amount) * 100 : 0 }; }), [budgets, expenses]);
  const totalBudget = summary.reduce((sum, item) => sum + item.amount, 0);
  const totalSpent = summary.reduce((sum, item) => sum + item.spent, 0);
  function beginEdit(id: string, amount: number) { setEditingId(id); setDraftAmount(String(amount)); }
  function commitEdit(budget: (typeof budgets)[number]) { const amount = Number(draftAmount); if (!amount || amount < 0) return; saveBudget({ ...budget, amount }); setBudgets(getBudgets()); setEditingId(null); }
  function addBudget() { const amount = Number(newAmount); const category = newCategory.trim(); if (!category || !amount || amount < 0) return; saveBudget({ id: `budget-${Date.now()}`, category, amount, month: currentMonth }); setBudgets(getBudgets()); setNewCategory(''); setNewAmount(''); }
  function removeBudget(id: string) { deleteBudget(id); setBudgets(getBudgets()); }

  return (
    <div className="space-y-6">
      <header><p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-300">Plan together</p><h1 className="mt-2 text-3xl font-semibold text-white">Monthly budget</h1><p className="mt-2 text-sm text-slate-400">Set a ceiling, then make room for what matters.</p></header>
      <section className="grid gap-3 sm:grid-cols-3"><div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4"><div className="text-xs uppercase tracking-[0.16em] text-slate-400">Budgeted</div><div className="mt-2 text-2xl font-semibold text-white">{formatCurrency(totalBudget)}</div></div><div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4"><div className="text-xs uppercase tracking-[0.16em] text-slate-400">Spent</div><div className="mt-2 text-2xl font-semibold text-white">{formatCurrency(totalSpent)}</div></div><div className="rounded-[24px] border border-emerald-500/30 bg-emerald-500/10 p-4"><div className="text-xs uppercase tracking-[0.16em] text-emerald-200">Room left</div><div className="mt-2 text-2xl font-semibold text-white">{formatCurrency(totalBudget - totalSpent)}</div></div></section>
      <section className="space-y-3">{summary.map((item) => { const progress = Math.min(item.percentage, 100); const over = item.remaining < 0; return <div key={item.id} className="rounded-[24px] border border-white/10 bg-slate-900/80 p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="font-medium text-white">{item.category}</h2><p className="mt-1 text-xs text-slate-400">{formatCurrency(item.spent)} spent of {formatCurrency(item.amount)}</p></div><div className="flex items-center gap-1">{editingId === item.id ? <><input value={draftAmount} onChange={(event) => setDraftAmount(event.target.value)} type="number" min="0" className="w-28 rounded-xl border border-white/10 bg-slate-950 px-2 py-2 text-right text-sm text-white outline-none" /><button type="button" aria-label="Save budget" onClick={() => commitEdit(item)} className="rounded-xl p-2 text-emerald-300 hover:bg-emerald-500/10"><Check size={16} /></button></> : <><span className={`mr-1 text-sm font-medium ${over ? 'text-rose-300' : 'text-slate-200'}`}>{Math.round(item.percentage)}%</span><button type="button" aria-label={`Edit ${item.category} budget`} onClick={() => beginEdit(item.id, item.amount)} className="rounded-xl p-2 text-slate-500 hover:bg-white/5 hover:text-white"><Pencil size={15} /></button><button type="button" aria-label={`Delete ${item.category} budget`} onClick={() => removeBudget(item.id)} className="rounded-xl p-2 text-slate-500 hover:bg-rose-500/10 hover:text-rose-300"><Trash2 size={15} /></button></>}</div></div><div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-800"><div className={`h-full rounded-full ${over ? 'bg-rose-400' : progress >= 80 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${progress}%` }} /></div><div className={`mt-2 text-xs ${over ? 'text-rose-300' : 'text-slate-400'}`}>{over ? `${formatCurrency(Math.abs(item.remaining))} over limit` : `${formatCurrency(item.remaining)} remaining`}</div></div>; })}</section>
      <section className="rounded-[24px] border border-dashed border-white/20 bg-slate-900/50 p-4"><div className="mb-3 flex items-center gap-2 text-sm font-medium text-white"><Plus size={17} className="text-emerald-300" /> Add category</div><div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]"><input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Category name" className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500" /><input value={newAmount} onChange={(event) => setNewAmount(event.target.value)} type="number" min="0" placeholder="Monthly limit" className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500" /><button type="button" onClick={addBudget} className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">Add budget</button></div></section>
    </div>
  );
}

export default Budget;
