import { budgetData, goalData, household, incomeData, sampleExpenses } from '../data/sampleData';
import type { Budget, Expense, Goal, Household, Income, LearnedCategoryMap } from '../types/finance';

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
}

export function deleteExpense(id: string) {
  const expenses = getExpenses().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses));
}

export function getIncome(): Income[] {
  const raw = localStorage.getItem(STORAGE_KEYS.income);
  return safeParse<Income[]>(raw, []);
}

export function saveIncome(income: Income) {
  const incomes = getIncome();
  const nextIncomes = [...incomes.filter((item) => item.id !== income.id), income];
  localStorage.setItem(STORAGE_KEYS.income, JSON.stringify(nextIncomes));
}

export function getBudgets(): Budget[] {
  const raw = localStorage.getItem(STORAGE_KEYS.budgets);
  return safeParse<Budget[]>(raw, []);
}

export function saveBudget(budget: Budget) {
  const budgets = getBudgets();
  const nextBudgets = [...budgets.filter((item) => item.id !== budget.id), budget];
  localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(nextBudgets));
}

export function deleteBudget(id: string) {
  const budgets = getBudgets().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(budgets));
}

export function getGoals(): Goal[] {
  const raw = localStorage.getItem(STORAGE_KEYS.goals);
  return safeParse<Goal[]>(raw, []);
}

export function saveGoal(goal: Goal) {
  const goals = getGoals();
  const nextGoals = [...goals.filter((item) => item.id !== goal.id), goal];
  localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(nextGoals));
}

export function deleteGoal(id: string) {
  const goals = getGoals().filter((goal) => goal.id !== id);
  localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals));
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
