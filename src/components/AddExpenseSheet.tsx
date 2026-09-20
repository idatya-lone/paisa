import { Check, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { parseExpenseInput } from '../services/expenseParser';
import { getExpenses, saveExpense } from '../services/storage';
import type { ExpenseType } from '../types/finance';

const DEFAULT_CATEGORY_OPTIONS = ['Food & Dining', 'Household', 'Travel', 'Shopping', 'Entertainment', 'Health', 'Other'];

interface AddExpenseSheetProps {
  onClose: () => void;
  onSaved: () => void;
}

export function AddExpenseSheet({ onClose, onSaved }: AddExpenseSheetProps) {
  const [input, setInput] = useState('₹850 dinner at barbeque nation with Aditya');
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const parsed = useMemo(() => parseExpenseInput(input), [input]);

  function handleSubmit() {
    const amount = Number(parsed.amount ?? 0);
    if (!input.trim()) {
      setError('Please enter an expense first.');
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter a valid amount greater than zero.');
      return;
    }

    if (!parsed.category) {
      setError('Choose a category for this expense.');
      return;
    }

    setError('');
    setShowConfirmation(true);
  }

  function saveConfirmedExpense() {
    const amount = Number(parsed.amount ?? 0);
    const nextExpense = {
      id: `exp-${Date.now()}`,
      amount,
      title: parsed.title || 'Expense',
      merchant: parsed.merchant || 'Unknown merchant',
      category: parsed.category || 'Other',
      subcategory: parsed.subcategory || 'General',
      paidBy: parsed.paidBy || 'shared',
      type: (parsed.type || 'shared') as ExpenseType,
      date: new Date().toISOString(),
    };

    const currentExpenses = getExpenses();
    saveExpense(nextExpense);
    if (currentExpenses.length === 0 && nextExpense.category) {
      localStorage.setItem('budget-app-expenses', JSON.stringify([nextExpense]));
    }
    onSaved();
  }

  const categoryOptions = DEFAULT_CATEGORY_OPTIONS.filter((option) => option !== parsed.category);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/75 p-3 backdrop-blur-sm lg:items-center lg:p-10">
      <div className="max-h-[calc(100vh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-[32px] border border-white/10 bg-slate-900 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.9)] sm:p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Quick add</div>
            <h3 className="mt-1 text-xl font-semibold text-white">Add expense</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 hover:bg-white/10" aria-label="Close add expense">
            <X size={18} />
          </button>
        </div>

        {!showConfirmation ? (
          <>
            <label className="block text-sm font-medium text-slate-200" htmlFor="expense-input">
              What did you spend?
            </label>
            <textarea
              id="expense-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3 text-base text-white outline-none transition focus:border-sky-400"
              placeholder="₹850 dinner at barbeque nation with Aditya"
            />

            {parsed.amount ? (
              <div className="mt-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-3 text-sm text-sky-100">
                <div className="font-semibold text-white">Detected</div>
                <div className="mt-1">Amount: ₹{parsed.amount}</div>
                <div>Category: {parsed.category}</div>
                {parsed.merchant ? <div>Merchant: {parsed.merchant}</div> : null}
                <div>Type: {parsed.type}</div>
              </div>
            ) : null}

            {error ? <div className="mt-3 text-sm text-rose-300">{error}</div> : null}

            <div className="mt-5 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/10">
                Cancel
              </button>
              <button type="button" onClick={handleSubmit} className="flex-1 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950">
                Review
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5">
              <div className="text-3xl font-semibold text-white">₹{parsed.amount ?? 0}</div>
              <div className="mt-3 text-sm text-slate-300">{parsed.category || 'Other'}</div>
              {parsed.subcategory ? <div className="text-sm text-slate-400">{parsed.subcategory}</div> : null}
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <div className="flex items-center gap-2"><span>👥</span> {parsed.type === 'shared' ? 'Shared' : 'Personal'}</div>
                <div className="flex items-center gap-2"><span>📅</span> Today</div>
                {parsed.merchant ? <div className="flex items-center gap-2"><span>🏪</span> {parsed.merchant}</div> : null}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-400">Category</div>
                <div className="flex flex-wrap gap-2">
                  {[parsed.category || 'Other', ...categoryOptions].slice(0, 6).map((option) => (
                    <button
                      key={option}
                      type="button"
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-200 hover:border-sky-400/70"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setShowConfirmation(false)} className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/10">
                Cancel
              </button>
              <button type="button" onClick={saveConfirmedExpense} className="flex-1 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950">
                <span className="inline-flex items-center gap-2"><Check size={16} /> Add Expense</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
