import type { Budget, Expense, Goal, Household, Income, User } from '../types/finance';

export const householdMembers: User[] = [
  { id: 'janhavi', name: 'Janhavi' },
  { id: 'aditya', name: 'Aditya' },
];

export const household: Household = {
  id: 'couple-household',
  name: 'Janhavi & Aditya',
  members: householdMembers,
};

export const incomeData: Income[] = [
  {
    id: 'inc-1',
    amount: 300000,
    personId: 'janhavi',
    source: 'Salary',
    date: '2026-09-01',
  },
];

export const goalData: Goal[] = [
  { id: 'goal-1', title: 'Japan trip', targetAmount: 180000, savedAmount: 72000, deadline: '2027-04-01', color: 'blue' },
  { id: 'goal-2', title: 'Emergency fund', targetAmount: 300000, savedAmount: 95000, deadline: '2027-01-01', color: 'violet' },
];

export const budgetData: Budget[] = [
  { id: 'budget-1', category: 'Housing', amount: 34000, month: '2026-09' },
  { id: 'budget-2', category: 'Food & Dining', amount: 15000, month: '2026-09' },
  { id: 'budget-3', category: 'Travel', amount: 6000, month: '2026-09' },
  { id: 'budget-4', category: 'Shopping', amount: 10000, month: '2026-09' },
  { id: 'budget-5', category: 'Household', amount: 30000, month: '2026-09' },
  { id: 'budget-6', category: 'Entertainment', amount: 5000, month: '2026-09' },
  { id: 'budget-7', category: 'Health', amount: 5000, month: '2026-09' },
  { id: 'budget-8', category: 'Other', amount: 5000, month: '2026-09' },
];

export const sampleExpenses: Expense[] = [
  {
    id: 'exp-1',
    amount: 34000,
    title: 'Rent',
    merchant: 'Flat Rent',
    category: 'Housing',
    subcategory: 'Rent',
    paidBy: 'shared',
    type: 'shared',
    date: '2026-09-01',
    notes: 'September rent',
  },
  {
    id: 'exp-2',
    amount: 1240,
    title: 'Groceries',
    merchant: 'Monthly groceries',
    category: 'Food & Dining',
    subcategory: 'Groceries',
    paidBy: 'shared',
    type: 'shared',
    date: '2026-09-05',
  },
  {
    id: 'exp-3',
    amount: 850,
    title: 'Dinner',
    merchant: 'Barbeque Nation',
    category: 'Food & Dining',
    subcategory: 'Eating Out',
    paidBy: 'shared',
    type: 'shared',
    date: '2026-09-20',
  },
  {
    id: 'exp-4',
    amount: 320,
    title: 'Uber',
    merchant: 'Office → Home',
    category: 'Travel',
    subcategory: 'Ride',
    paidBy: 'janhavi',
    type: 'personal',
    date: '2026-09-20',
  },
  {
    id: 'exp-5',
    amount: 2400,
    title: 'Shopping',
    merchant: 'Myntra',
    category: 'Shopping',
    subcategory: 'Clothes',
    paidBy: 'aditya',
    type: 'personal',
    date: '2026-09-18',
  },
  {
    id: 'exp-6',
    amount: 1250,
    title: 'Electricity',
    merchant: 'BESCOM',
    category: 'Household',
    subcategory: 'Utilities',
    paidBy: 'shared',
    type: 'shared',
    date: '2026-09-10',
  },
  {
    id: 'exp-7',
    amount: 4500,
    title: 'Household',
    merchant: 'Home essentials',
    category: 'Household',
    subcategory: 'Maintenance',
    paidBy: 'shared',
    type: 'shared',
    date: '2026-09-12',
  },
  {
    id: 'exp-8',
    amount: 1200,
    title: 'Movie night',
    merchant: 'PVR',
    category: 'Entertainment',
    subcategory: 'Cinema',
    paidBy: 'aditya',
    type: 'personal',
    date: '2026-09-16',
  },
];
