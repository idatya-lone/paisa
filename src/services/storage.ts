import { budgetData, goalData, household, incomeData, sampleExpenses } from '../data/sampleData';
import { createClient } from '@supabase/supabase-js';
import type { Budget, Expense, Goal, Household, Income, LearnedCategoryMap } from '../types/finance';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
const HOUSEHOLD_ID = 'couple-household';

const STORAGE_KEYS = {
  household: 'budget-app-household',
  expenses: 'budget-app-expenses',
  income: 'budget-app-income',
  budgets: 'budget-app-budgets',
  goals: 'budget-app-goals',
  categoryLearn: 'budget-app-learned-categories',
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getHousehold(): Household | null {
  const raw = localStorage.getItem(STORAGE_KEYS.household);
  return safeParse<Household | null>(raw, null);
}

export function saveHousehold(household: Household) {
  localStorage.setItem(STORAGE_KEYS.household, JSON.stringify(household));
}

export function getExpenses(): Expense[] {
  const raw = localStorage.getItem(STORAGE_KEYS.expenses);
  return safeParse<Expense[]>(raw, []);
}

export function saveExpense(expense: Expense) {
  const expenses = getExpenses();
  const nextExpenses = [...expenses.filter((item) => item.id !== expense.id), expense];
  localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(nextExpenses));
  void syncStateToCloud();
}

export function deleteExpense(id: string) {
  const expenses = getExpenses().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses));
  void syncStateToCloud();
}

export function getIncome(): Income[] {
  const raw = localStorage.getItem(STORAGE_KEYS.income);
  return safeParse<Income[]>(raw, []);
}

export function saveIncome(income: Income) {
  const incomes = getIncome();
  const nextIncomes = [...incomes.filter((item) => item.id !== income.id), income];
  localStorage.setItem(STORAGE_KEYS.income, JSON.stringify(nextIncomes));
  void syncStateToCloud();
}

export function getBudgets(): Budget[] {
  const raw = localStorage.getItem(STORAGE_KEYS.budgets);
  return safeParse<Budget[]>(raw, []);
}

export function saveBudget(budget: Budget) {
  const budgets = getBudgets();
  const nextBudgets = [...budgets.filter((item) => item.id !== budget.id), budget];
  localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(nextBudgets));
  void syncStateToCloud();
}

export function deleteBudget(id: string) {
  const budgets = getBudgets().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(budgets));
  void syncStateToCloud();
}

export function getGoals(): Goal[] {
  const raw = localStorage.getItem(STORAGE_KEYS.goals);
  return safeParse<Goal[]>(raw, []);
}

export function saveGoal(goal: Goal) {
  const goals = getGoals();
  const nextGoals = [...goals.filter((item) => item.id !== goal.id), goal];
  localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(nextGoals));
  void syncStateToCloud();
}

export function deleteGoal(id: string) {
  const goals = getGoals().filter((goal) => goal.id !== id);
  localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals));
  void syncStateToCloud();
}

export async function syncStateFromCloud() {
  if (!supabase) return { changed: false, newExpenses: [] as Expense[] };

  const previousExpenses = getExpenses();

  const { data, error } = await supabase
    .from('household_state')
    .select('expenses, budgets, goals, income')
    .eq('id', HOUSEHOLD_ID)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    await syncStateToCloud();
    return { changed: false, newExpenses: [] as Expense[] };
  }

  const hasCloudData = data.expenses.length || data.budgets.length || data.goals.length || data.income.length;
  if (!hasCloudData) {
    await syncStateToCloud();
    return { changed: false, newExpenses: [] as Expense[] };
  }

  localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(data.expenses));
  localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(data.budgets));
  localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(data.goals));
  localStorage.setItem(STORAGE_KEYS.income, JSON.stringify(data.income));
  const previousExpenseIds = new Set(previousExpenses.map((expense) => expense.id));
  const cloudExpenses = data.expenses as Expense[];
  const newExpenses = cloudExpenses.filter((expense: Expense) => !previousExpenseIds.has(expense.id));
  return { changed: true, newExpenses };
}

export async function syncStateToCloud() {
  if (!supabase) return false;

  const { error } = await supabase.from('household_state').upsert({
    id: HOUSEHOLD_ID,
    expenses: getExpenses(),
    budgets: getBudgets(),
    goals: getGoals(),
    income: getIncome(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Could not sync household data:', error.message);
    return false;
  }

  return true;
}

export function getLearnedCategoryMap(): LearnedCategoryMap {
  const raw = localStorage.getItem(STORAGE_KEYS.categoryLearn);
  return safeParse<LearnedCategoryMap>(raw, {});
}

export function saveLearnedCategoryMap(map: LearnedCategoryMap) {
  localStorage.setItem(STORAGE_KEYS.categoryLearn, JSON.stringify(map));
}

export function initializeDefaultStorage() {
  const existingHousehold = safeParse<Household | null>(localStorage.getItem(STORAGE_KEYS.household), null);
  if (!existingHousehold) {
    localStorage.setItem(STORAGE_KEYS.household, JSON.stringify(household));
  }

  const currentExpenses = safeParse<Expense[]>(localStorage.getItem(STORAGE_KEYS.expenses), []);
  if (currentExpenses.length === 0) {
    localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(sampleExpenses));
  }

  const currentBudgets = safeParse<Budget[]>(localStorage.getItem(STORAGE_KEYS.budgets), []);
  if (currentBudgets.length === 0) {
    localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(budgetData));
  }

  const currentIncome = safeParse<Income[]>(localStorage.getItem(STORAGE_KEYS.income), []);
  if (currentIncome.length === 0) {
    localStorage.setItem(STORAGE_KEYS.income, JSON.stringify(incomeData));
  }

  const currentGoals = safeParse<Goal[]>(localStorage.getItem(STORAGE_KEYS.goals), []);
  if (currentGoals.length === 0) {
    localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goalData));
  }
}
