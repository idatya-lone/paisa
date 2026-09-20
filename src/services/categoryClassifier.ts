import { getLearnedCategoryMap } from './storage';

const DEFAULT_CATEGORY_MAP: Record<string, string> = {
  pizza: 'Food & Dining',
  restaurant: 'Food & Dining',
  dinner: 'Food & Dining',
  lunch: 'Food & Dining',
  breakfast: 'Food & Dining',
  swiggy: 'Food & Dining',
  zomato: 'Food & Dining',
  coffee: 'Food & Dining',
  cafe: 'Food & Dining',
  food: 'Food & Dining',
  uber: 'Travel',
  ola: 'Travel',
  auto: 'Travel',
  taxi: 'Travel',
  train: 'Travel',
  flight: 'Travel',
  metro: 'Travel',
  bus: 'Travel',
  amazon: 'Shopping',
  myntra: 'Shopping',
  shopping: 'Shopping',
  clothes: 'Shopping',
  rent: 'Housing',
  electricity: 'Household',
  maid: 'Household',
  cleaning: 'Household',
  house: 'Household',
  movie: 'Entertainment',
  netflix: 'Entertainment',
  concert: 'Entertainment',
  medicine: 'Health',
  doctor: 'Health',
  pharmacy: 'Health',
};

export function classifyCategory(input: string, fallback = 'Other'): string {
  const normalized = input.toLowerCase();
  const learnedMap = getLearnedCategoryMap();

  const keys = Object.keys(learnedMap).map((key) => key.toLowerCase());
  const matchedKey = keys.find((key) => normalized.includes(key));
  if (matchedKey) {
    return learnedMap[matchedKey] ?? fallback;
  }

  const defaultMatch = Object.entries(DEFAULT_CATEGORY_MAP).find(([key]) =>
    normalized.includes(key),
  );

  return defaultMatch?.[1] ?? fallback;
}
