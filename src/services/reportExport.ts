import * as XLSX from 'xlsx';
import { getExpenses, getIncome } from './storage';

export interface MonthlyReportSummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  sharedExpenses: number;
  janhaviPaid: number;
  adityaPaid: number;
  categoryBreakdown: Array<{
    category: string;
    total: number;
  }>;
}

export interface MonthlyReportData {
  summary: MonthlyReportSummary;
  expenses: Array<{
    Date: string;
    Title: string;
    Merchant: string;
    Amount: number;
    Category: string;
    Subcategory: string;
    PaidBy: string;
    Type: string;
    Notes: string;
  }>;
}

const headerStyle = {
  font: { bold: true, color: { rgb: 'FFFFFF' } },
  fill: { fgColor: { rgb: '2563EB' } },
  alignment: { vertical: 'center' },
};

const titleStyle = {
  font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 16 },
  fill: { fgColor: { rgb: '111827' } },
  alignment: { vertical: 'center' },
};

function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

export function buildMonthlyReport(monthKey: string): MonthlyReportData {
  const expenses = getExpenses().filter((expense) => getMonthKey(expense.date) === monthKey);
  const incomes = getIncome().filter((income) => getMonthKey(income.date) === monthKey);

  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const savings = totalIncome - totalExpenses;

  const sharedExpenses = expenses
    .filter((expense) => expense.type === 'shared')
    .reduce((sum, item) => sum + item.amount, 0);

  const janhaviPaid = expenses
    .filter((expense) => expense.paidBy === 'janhavi' && expense.type === 'personal')
    .reduce((sum, item) => sum + item.amount, 0);

  const adityaPaid = expenses
    .filter((expense) => expense.paidBy === 'aditya' && expense.type === 'personal')
    .reduce((sum, item) => sum + item.amount, 0);

  const categoryMap = new Map<string, number>();
  expenses.forEach((expense) => {
    categoryMap.set(expense.category, (categoryMap.get(expense.category) ?? 0) + expense.amount);
  });

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  return {
    summary: {
      month: monthKey,
      totalIncome,
      totalExpenses,
      savings,
      sharedExpenses,
      janhaviPaid,
      adityaPaid,
      categoryBreakdown,
    },
    expenses: expenses.map((expense) => ({
      Date: new Date(expense.date).toISOString().slice(0, 10),
      Title: expense.title,
      Merchant: expense.merchant ?? '',
      Amount: expense.amount,
      Category: expense.category,
      Subcategory: expense.subcategory ?? '',
      PaidBy: expense.paidBy,
      Type: expense.type,
      Notes: expense.notes ?? '',
    })),
  };
}

export function buildMonthlyReportWorkbook(monthKey: string) {
  const report = buildMonthlyReport(monthKey);
  const workbook = XLSX.utils.book_new();
  const monthLabel = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date(`${monthKey}-01T00:00:00`));

  const summarySheet = XLSX.utils.aoa_to_sheet([
    ['Janhavi & Aditya | Monthly Finance Report'],
    ['Reporting period', monthLabel],
    [],
    ['Metric', 'Amount'],
    ['Total income', report.summary.totalIncome],
    ['Total expenses', report.summary.totalExpenses],
    ['Savings', report.summary.savings],
    ['Shared expenses', report.summary.sharedExpenses],
    ['Janhavi paid', report.summary.janhaviPaid],
    ['Aditya paid', report.summary.adityaPaid],
  ]);
  summarySheet['A1'].s = titleStyle;
  summarySheet['B1'].s = titleStyle;
  summarySheet['A4'].s = headerStyle;
  summarySheet['B4'].s = headerStyle;
  for (let row = 5; row <= 10; row += 1) summarySheet[`B${row}`].z = '₹#,##0';
  summarySheet['!cols'] = [{ wch: 24 }, { wch: 18 }];
  summarySheet['!rows'] = [{ hpt: 28 }];

  const totalExpenses = report.summary.totalExpenses || 1;
  const categoryRows = report.summary.categoryBreakdown.map((row) => [row.category, row.total, row.total / totalExpenses]);
  const categorySheet = XLSX.utils.aoa_to_sheet([
    ['Category breakdown'],
    ['Category', 'Total', 'Share of spend'],
    ...categoryRows,
  ]);
  categorySheet['A1'].s = titleStyle;
  categorySheet['B1'].s = titleStyle;
  categorySheet['C1'].s = titleStyle;
  ['A2', 'B2', 'C2'].forEach((cell) => { categorySheet[cell].s = headerStyle; });
  categoryRows.forEach((_, index) => {
    const rowNumber = index + 3;
    categorySheet[`B${rowNumber}`].z = '₹#,##0';
    categorySheet[`C${rowNumber}`].z = '0%';
  });
  categorySheet['!cols'] = [{ wch: 24 }, { wch: 16 }, { wch: 16 }];
  categorySheet['!autofilter'] = { ref: `A2:C${Math.max(categoryRows.length + 2, 2)}` };
  categorySheet['!freeze'] = { xSplit: 0, ySplit: 2 };

  const expenseSheet = XLSX.utils.json_to_sheet(report.expenses);
  const expenseHeaders = ['Date', 'Title', 'Merchant', 'Amount', 'Category', 'Subcategory', 'PaidBy', 'Type', 'Notes'];
  expenseHeaders.forEach((_, index) => { expenseSheet[`${XLSX.utils.encode_col(index)}1`].s = headerStyle; });
  report.expenses.forEach((_, index) => {
    const rowNumber = index + 2;
    expenseSheet[`A${rowNumber}`].z = 'dd mmm yyyy';
    expenseSheet[`D${rowNumber}`].z = '₹#,##0';
  });
  expenseSheet['!cols'] = [
    { wch: 15 }, { wch: 18 }, { wch: 24 }, { wch: 14 }, { wch: 18 },
    { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 30 },
  ];
  expenseSheet['!autofilter'] = { ref: `A1:I${Math.max(report.expenses.length + 1, 1)}` };
  expenseSheet['!freeze'] = { xSplit: 0, ySplit: 1 };

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Breakdown');
  XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expenses');
  return workbook;
}

export function buildMonthlyReportWorkbookBuffer(monthKey: string): ArrayBuffer {
  return XLSX.write(buildMonthlyReportWorkbook(monthKey), { type: 'array', bookType: 'xlsx', cellStyles: true }).buffer;
}

export function exportMonthlyReport(monthKey: string, fileName = `janhavi-aditya-${monthKey}-report.xlsx`) {
  XLSX.writeFile(buildMonthlyReportWorkbook(monthKey), fileName, { cellStyles: true });
  return buildMonthlyReport(monthKey);
}
