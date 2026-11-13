export const CATEGORIES = [
  'Food & Drinks',
  'Transport',
  'Accommodation',
  'Activities',
  'Shopping',
  'Utilities',
  'Other',
]

export const DEFAULT_CATEGORY = 'Other'

// Expenses saved before categories existed (or with an unknown value) count as "Other".
export function categoryOf(expense) {
  return CATEGORIES.includes(expense?.category) ? expense.category : DEFAULT_CATEGORY
}
