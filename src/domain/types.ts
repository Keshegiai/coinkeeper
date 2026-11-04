export type TransactionType = 'income' | 'expense';

export type ISODate = string; // YYYY-MM-DD, always in the user's local calendar

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  /** Monthly spending limit. `null`/absent means "no budget". */
  budget?: number | null;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: ISODate;
  comment: string;
  createdAt: number;
}

export type TransactionDraft = Pick<Transaction, 'type' | 'amount' | 'categoryId' | 'date' | 'comment'>;
export type CategoryDraft = Pick<Category, 'name' | 'icon' | 'color'> & { budget?: number | null };

export const CURRENCIES = ['KZT', 'USD', 'EUR', 'RUB'] as const;
export type Currency = (typeof CURRENCIES)[number];

export interface Goal {
  id: string;
  userId: string;
  name: string;
  /** Amount to reach. */
  target: number;
  /** Amount put aside so far. */
  saved: number;
  /** Optional target date. */
  deadline: ISODate | null;
  icon: string;
  color: string;
  createdAt: number;
}

export type GoalDraft = Pick<Goal, 'name' | 'target' | 'saved' | 'deadline' | 'icon' | 'color'>;
