"use client";

import { useState } from "react";

import type { DebtType, IDebt } from "@/types";

const DEBT_TYPES: { value: DebtType; label: string }[] = [
  { value: "credit_card", label: "Credit Card" },
  { value: "student_loan", label: "Student Loan (Education)" },
  { value: "personal_loan", label: "Personal Loan" },
  { value: "mortgage", label: "Home Loan" },
  { value: "auto_loan", label: "Car Loan" },
  { value: "medical", label: "Medical Loan" },
  { value: "other", label: "Other" },
];

// Average APR in India by loan type
const AVG_APR: Record<DebtType, number> = {
  credit_card: 40,
  student_loan: 9.5,
  personal_loan: 14,
  mortgage: 9,
  auto_loan: 10,
  medical: 15,
  other: 12,
};

export interface DebtFormValues {
  name: string;
  type: DebtType;
  balance: string;
  interestRate: string;
  minPayment: string;
  dueDate: string;
  notes: string;
}

interface DebtFormProps {
  initialValues?: Partial<IDebt>;
  onSubmit: (form: DebtFormValues) => void;
  loading?: boolean;
  mode?: "create" | "edit";
}

export default function DebtForm({ initialValues, onSubmit, loading, mode = "create" }: DebtFormProps) {
  const [form, setForm] = useState<DebtFormValues>(() => ({
    name: initialValues?.name ?? "",
    type: (initialValues?.type as DebtType) ?? "credit_card",
    balance: initialValues?.balance?.toString() ?? "",
    interestRate: initialValues?.interestRate?.toString() ?? "",
    minPayment: initialValues?.minPayment?.toString() ?? "",
    dueDate: initialValues?.dueDate?.toString() ?? "",
    notes: initialValues?.notes ?? "",
  }));
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    // Auto-fill interest rate when type changes (only in create mode with empty rate)
    if (name === "type" && mode === "create" && !form.interestRate) {
      updated.interestRate = (AVG_APR[value as DebtType] ?? "").toString();
    }
    setForm(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Debt name is required");
    if (Number(form.balance) < 0) return setError("Balance cannot be negative");
    if (Number(form.interestRate) < 0 || Number(form.interestRate) > 100) return setError("Interest rate must be between 0 and 100");
    if (Number(form.minPayment) < 0) return setError("Minimum payment cannot be negative");
    if (form.dueDate && (Number(form.dueDate) < 1 || Number(form.dueDate) > 31)) return setError("Due date must be between 1 and 31");
    onSubmit(form);
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  const avgRate = AVG_APR[form.type];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Debt Name *</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. HDFC Credit Card" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
          <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
            {DEBT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Balance (₹) *</label>
          <input type="number" name="balance" value={form.balance} onChange={handleChange} required min="0" step="1" placeholder="e.g. 50000" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interest Rate (APR %) *
            {avgRate && (
              <span className="ml-2 text-xs text-indigo-500 font-normal">India avg: ~{avgRate}%</span>
            )}
          </label>
          <input type="number" name="interestRate" value={form.interestRate} onChange={handleChange} required min="0" max="100" step="0.01" placeholder={`${avgRate ?? 12}`} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Monthly Payment (₹) *</label>
          <input type="number" name="minPayment" value={form.minPayment} onChange={handleChange} required min="0" step="1" placeholder="e.g. 2500" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (day of month)</label>
          <input type="number" name="dueDate" value={form.dueDate} onChange={handleChange} min="1" max="31" placeholder="e.g. 5" className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} maxLength={500} placeholder="Optional notes…" className={`${inputClass} resize-none`} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
      >
        {loading ? "Saving…" : mode === "edit" ? "Save changes" : "Add debt"}
      </button>
    </form>
  );
}
