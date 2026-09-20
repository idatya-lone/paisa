import { CalendarDays, Search, Trash2, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import { deleteExpense, getExpenses } from '../services/storage';
import { formatCurrency, getRelativeDateLabel } from '../utils/formatters';

const categories = ['All categories', 'Housing', 'Food & Dining', 'Travel', 'Shopping', 'Household', 'Entertainment', 'Health', 'Other'];

function Expenses() {
  const [expenses, setExpenses] = useState(getExpenses);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const [type, setType] = useState<'all' | 'shared' | 'personal'>('all');
  const filteredExpenses = useMemo(() => {
    const search = query.trim().toLowerCase();
    return expenses.filter((expense) => category === 'All categories' || expense.category === category).filter((expense) => type === 'all' || expense.type === type).filter((expense) => !search || `${expense.title} ${expense.merchant ?? ''} ${expense.category}`.toLowerCase().includes(search)).sort((a, b) => b.date.localeCompare(a.date));
  }, [category, expenses, query, type]);
  const visibleTotal = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  function handleDelete(id: string) { deleteExpense(id); setExpenses(getExpenses()); }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium uppercase tracking-[0.18em] text-sky-300">Money trail</p><h1 className="mt-2 text-3xl font-semibold text-white">Expenses</h1><p className="mt-2 text-sm text-slate-400">Every purchase, in one calm place.</p></div><div className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 sm:text-right"><div className="text-xs uppercase tracking-[0.16em] text-slate-400">Showing</div><div className="mt-1 text-lg font-semibold text-white">{formatCurrency(visibleTotal)}</div></div></header>
      <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-4"><div className="grid gap-3 md:grid-cols-[1fr_190px_150px]"><label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 px-3"><Search size={17} className="text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search expenses" className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-500" /></label><select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-3 text-sm text-slate-200 outline-none">{categories.map((item) => <option key={item} className="bg-slate-900">{item}</option>)}</select><select value={type} onChange={(event) => setType(event.target.value as typeof type)} className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-3 text-sm text-slate-200 outline-none"><option value="all" className="bg-slate-900">All types</option><option value="shared" className="bg-slate-900">Shared</option><option value="personal" className="bg-slate-900">Personal</option></select></div></section>
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80"><div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-5"><div><h2 className="font-semibold text-white">All expenses</h2><p className="mt-1 text-xs text-slate-400">{filteredExpenses.length} records</p></div><WalletCards size={20} className="text-sky-300" /></div><div className="divide-y divide-white/10">{filteredExpenses.map((expense) => <div key={expense.id} className="flex items-center gap-2 px-3 py-4 transition hover:bg-white/[0.03] sm:gap-3 sm:px-5"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-sky-400/10 text-sm font-semibold text-sky-200 sm:h-10 sm:w-10">{expense.title.slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium text-white">{expense.title}</div><div className="mt-1 truncate text-xs text-slate-400">{expense.merchant || expense.category} · {expense.category}</div></div><div className="hidden text-right sm:block"><div className="text-xs text-slate-400">{getRelativeDateLabel(expense.date)}</div><div className="mt-1 text-[11px] text-slate-500">{expense.type} · {expense.paidBy}</div></div><div className="shrink-0 text-right"><div className="text-sm font-semibold text-white">{formatCurrency(expense.amount)}</div><div className="mt-1 hidden items-center justify-end gap-1 text-[11px] text-slate-500 sm:flex"><CalendarDays size={12} />{expense.date}</div></div><button type="button" onClick={() => handleDelete(expense.id)} aria-label={`Delete ${expense.title}`} className="shrink-0 rounded-xl p-2 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-300"><Trash2 size={16} /></button></div>)}{filteredExpenses.length === 0 && <div className="px-5 py-12 text-center text-sm text-slate-400">No expenses match these filters.</div>}</div></section>
    </div>
  );
}

export default Expenses;
