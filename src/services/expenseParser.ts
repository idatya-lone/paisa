import type { ParsedExpenseInput } from '../types/finance';
import { classifyCategory } from './categoryClassifier';

const PERSON_LABELS = ['janhavi', 'aditya'];

function extractAmount(text: string): number | undefined {
  const matches = text.match(/₹\s*([0-9,]+(?:\.\d{1,2})?)/i) ?? text.match(/([0-9,]+(?:\.\d{1,2})?)/);
  if (!matches) return undefined;

  const value = matches[1]?.replace(/,/g, '') || matches[0]?.replace(/,/g, '');
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function extractMerchant(text: string): string | undefined {
  const atMatch = text.match(/at\s+([a-zA-Z0-9 &-]+)/i);
  if (atMatch) return atMatch[1].trim();

  const withMatch = text.match(/with\s+([a-zA-Z0-9 &-]+)/i);
  if (withMatch) return withMatch[1].trim();

  const extras = text.replace(/₹\s*[0-9,]+(?:\.\d{1,2})?/gi, '').trim();
  const cleaned = extras.replace(/(with|at|for|on)/gi, '').replace(/\s+/g, ' ').trim();
  return cleaned.length ? cleaned : undefined;
}

function extractTitle(text: string): string {
  const withoutAmount = text.replace(/₹\s*[0-9,]+(?:\.\d{1,2})?/gi, '').trim();
  const title = withoutAmount
    .replace(/(with|at|for|on)\s+[a-zA-Z0-9 &-]+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return title || 'Expense';
}

function determineType(text: string): 'shared' | 'personal' {
  const lower = text.toLowerCase();
  if (lower.includes('with ') || lower.includes('shared')) return 'shared';
  return 'personal';
}

function determinePaidBy(text: string): string {
  const lower = text.toLowerCase();
  const personMatch = PERSON_LABELS.find((person) => lower.includes(person));
  if (personMatch) return personMatch;
  return 'shared';
}

export function parseExpenseInput(input: string): ParsedExpenseInput {
  const trimmed = input.trim();
  if (!trimmed) {
    return {};
  }

  const amount = extractAmount(trimmed);
  const category = classifyCategory(trimmed);
  const merchant = extractMerchant(trimmed);
  const title = extractTitle(trimmed);
  const paidBy = determinePaidBy(trimmed);
  const type = determineType(trimmed);

  return {
    amount,
    category,
    merchant,
    title,
    paidBy,
    type,
    date: new Date().toISOString(),
  };
}
