export interface User {
  id: string;
  name: string;
}

export type ExpenseType = 'shared' | 'personal';

export interface Expense {
  id: string;
  amount: number;
  title: string;
  merchant?: string;
  category: string;
  subcategory?: string;
  paidBy: string;
  type: ExpenseType;
  date: string;
  notes?: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string;
}

export interface Income {
  id: string;
  amount: number;
  personId: string;
  source: string;
  date: string;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline?: string;
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Household {
  id: string;
  name: string;
  members: User[];
}

export interface ParsedExpenseInput {
  amount?: number;
  category?: string;
  subcategory?: string;
  merchant?: string;
  paidBy?: string;
  type?: ExpenseType;
  date?: string;
  title?: string;
}

export interface LearnedCategoryMap {
  [merchant: string]: string;
}
