import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Calendar, TrendingUp } from 'lucide-react';

const DEBT_TYPE_LABELS = {
  credit_card: 'Credit Card', student_loan: 'Student Loan', personal_loan: 'Personal Loan',
  mortgage: 'Home Loan', auto_loan: 'Car Loan', medical: 'Medical', other: 'Other',
};

function AprBadge({ rate }) {
  if (rate > 20) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium">High Interest</span>;
  if (rate >= 10) return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-medium">Moderate</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">Low Interest</span>;
}

const inr = (n) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

export default function DebtCard({ debt, onDelete, maxBalance }) {
  const navigate = useNavigate();
  const progress = maxBalance ? Math.round((debt.balance / maxBalance) * 100) : 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-base">{debt.name}</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full mt-1 inline-block">
            {DEBT_TYPE_LABELS[debt.type] || debt.type}
          </span>
        </div>
        <AprBadge rate={debt.interestRate} />
      </div>

      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
        {inr(debt.balance)}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Balance</span><span>{progress}% of largest</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
          <span>{debt.interestRate}% APR</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400 text-xs">Min:</span>
          <span>{inr(debt.minPayment)}/mo</span>
        </div>
        {debt.dueDate && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>Due {debt.dueDate}th</span>
          </div>
        )}
      </div>

      {debt.notes && <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-3 border-t border-gray-100 dark:border-gray-700 pt-3">{debt.notes}</p>}

      <div className="flex gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
        <button onClick={() => navigate(`/debts/${debt._id}/edit`)} className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
        <button onClick={() => { if (window.confirm(`Delete "${debt.name}"?`)) onDelete(debt._id); }} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium ml-auto">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}
