// src/types/index.ts

export type DebtType =
  | "credit_card"
  | "student_loan"
  | "personal_loan"
  | "mortgage"
  | "auto_loan"
  | "medical"
  | "other";

export interface IDebt {
  _id: string;
  userId: string;
  name: string;
  type: DebtType;
  balance: number;
  interestRate: number;
  minPayment: number;
  dueDate?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  googleId?: string;
}

export interface DebtAlert {
  type: "danger" | "warning" | "info";
  message: string;
}

export interface SimulatorResult {
  months: number;
  totalInterest: number;
  schedule: Array<{
    month: number;
    balances: Array<{ id: string; name: string; balance: number }>;
  }>;
}
