import { CalendarDays, Check, PiggyBank, Plus, Target, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { deleteGoal, getGoals, saveGoal } from '../services/storage';
import type { Goal } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

const goalColors = {
  blue: { card: 'from-blue-500/20 to-cyan-500/5', bar: 'from-blue-500 to-cyan-300', icon: 'bg-blue-500/15 text-blue-200' },
  violet: { card: 'from-violet-500/20 to-fuchsia-500/5', bar: 'from-violet-500 to-fuchsia-300', icon: 'bg-violet-500/15 text-violet-200' },
  green: { card: 'from-emerald-500/20 to-teal-500/5', bar: 'from-emerald-500 to-teal-300', icon: 'bg-emerald-500/15 text-emerald-200' },
};

function Goals() {
  const [goals, setGoals] = useState(getGoals);
  const [contributions, setContributions] = useState<Record<string, string>>({});
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const totals = useMemo(() => goals.reduce((result, goal) => ({ target: result.target + goal.targetAmount, saved: result.saved + goal.savedAmount }), { target: 0, saved: 0 }), [goals]);

  function addGoal() {
    const amount = Number(targetAmount);
    if (!title.trim() || !Number.isFinite(amount) || amount <= 0) return;
    saveGoal({ id: `goal-${Date.now()}`, title: title.trim(), targetAmount: amount, savedAmount: 0, deadline, color: 'blue' });
    setGoals(getGoals());
    setTitle('');
    setTargetAmount('');
    setDeadline('');
  }

  function addContribution(goal: Goal) {
    const amount = Number(contributions[goal.id]);
    if (!Number.isFinite(amount) || amount <= 0) return;
    saveGoal({ ...goal, savedAmount: Math.min(goal.targetAmount, goal.savedAmount + amount) });
    setGoals(getGoals());
    setContributions((current) => ({ ...current, [goal.id]: '' }));
  }

  function removeGoal(id: string) {
    deleteGoal(id);
    setGoals(getGoals());
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-300">Build toward something</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Goals</h1>
        <p className="mt-2 text-sm text-slate-400">Turn the money you save into a plan you can see.</p>
      </header>

      <section className="rounded-[28px] bg-gradient-to-br from-[#142351] via-[#101a38] to-[#211444] p-5 shadow-[0_20px_50px_rgba(30,64,175,0.18)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-blue-200"><PiggyBank size={18} /> Total saved</div>
            <div className="mt-2 text-3xl font-semibold text-white">{formatCurrency(totals.saved)}</div>
            <div className="mt-1 text-sm text-slate-400">of {formatCurrency(totals.target)} across {goals.length} goals</div>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-blue-200"><Target size={25} /></div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-violet-400" style={{ width: `${totals.target ? Math.min((totals.saved / totals.target) * 100, 100) : 0}%` }} /></div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {goals.map((goal) => {
          const theme = goalColors[(goal.color as keyof typeof goalColors) || 'blue'] || goalColors.blue;
          const percentage = goal.targetAmount ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100) : 0;
          const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);
          return (
            <article key={goal.id} className={`rounded-[26px] bg-gradient-to-br ${theme.card} p-5`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${theme.icon}`}><Target size={20} /></div><div className="min-w-0"><h2 className="truncate font-semibold text-white">{goal.title}</h2><p className="mt-1 text-xs text-slate-400">{goal.deadline ? `Target ${new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(goal.deadline))}` : 'No deadline set'}</p></div></div>
                <button type="button" onClick={() => removeGoal(goal.id)} aria-label={`Delete ${goal.title}`} className="rounded-xl p-2 text-slate-500 hover:bg-white/10 hover:text-rose-300"><Trash2 size={16} /></button>
              </div>
              <div className="mt-6 flex items-end justify-between"><div><div className="text-2xl font-semibold text-white">{formatCurrency(goal.savedAmount)}</div><div className="mt-1 text-xs text-slate-400">saved of {formatCurrency(goal.targetAmount)}</div></div><div className="text-right text-sm font-semibold text-blue-200">{Math.round(percentage)}%</div></div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-black/20"><div className={`h-full rounded-full bg-gradient-to-r ${theme.bar}`} style={{ width: `${percentage}%` }} /></div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400"><span>{formatCurrency(remaining)} left</span>{goal.deadline && <span className="flex items-center gap-1"><CalendarDays size={13} /> {goal.deadline}</span>}</div>
              <div className="mt-5 flex gap-2"><input value={contributions[goal.id] || ''} onChange={(event) => setContributions((current) => ({ ...current, [goal.id]: event.target.value }))} type="number" min="1" placeholder="Add savings" className="min-w-0 flex-1 rounded-xl bg-black/20 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500" /><button type="button" onClick={() => addContribution(goal)} className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/20"><Check size={15} /> Save</button></div>
            </article>
          );
        })}
      </section>

      <section className="rounded-[26px] bg-slate-900/75 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2"><Plus size={18} className="text-blue-300" /><h2 className="font-semibold text-white">Create a goal</h2></div>
        <div className="grid gap-3 sm:grid-cols-[1fr_170px_170px_auto]"><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Goal name" className="rounded-xl bg-slate-950/70 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500" /><input value={targetAmount} onChange={(event) => setTargetAmount(event.target.value)} type="number" min="1" placeholder="Target amount" className="rounded-xl bg-slate-950/70 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500" /><input value={deadline} onChange={(event) => setDeadline(event.target.value)} type="date" className="rounded-xl bg-slate-950/70 px-3 py-3 text-sm text-slate-300 outline-none" /><button type="button" onClick={addGoal} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-400"><Plus size={16} /> Add goal</button></div>
      </section>
    </div>
  );
}

export default Goals;
