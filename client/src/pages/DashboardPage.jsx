import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PlusCircle, DollarSign, TrendingUp, CreditCard, Bot, AlertTriangle, Info, Calculator } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import DebtCard from '../components/DebtCard';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
const inr = (n) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function AlertBanner({ alert }) {
  const styles = {
    danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
  };
  const Icon = alert.type === 'info' ? Info : AlertTriangle;
  return (
    <div className={`flex items-start gap-3 border rounded-xl px-4 py-3 ${styles[alert.type]}`}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <p className="text-sm">{alert.message}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [debts, setDebts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/debts'),
      api.get('/ai/alerts').catch(() => ({ data: { alerts: [] } })),
    ])
      .then(([debtsRes, alertsRes]) => {
        setDebts(debtsRes.data);
        setAlerts(alertsRes.data.alerts || []);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/debts/${id}`);
      setDebts((prev) => prev.filter((d) => d._id !== id));
      toast.success('Debt deleted');
    } catch { toast.error('Failed to delete debt'); }
  };

  const totalBalance = debts.reduce((s, d) => s + d.balance, 0);
  const totalMin = debts.reduce((s, d) => s + d.minPayment, 0);
  const highestApr = debts.length ? debts.reduce((a, b) => (a.interestRate > b.interestRate ? a : b)) : null;
  const maxBalance = debts.length ? Math.max(...debts.map((d) => d.balance)) : 0;

  const pieData = debts.map((d, i) => ({ name: d.name, value: Math.round(d.balance), color: COLORS[i % COLORS.length] }));

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Debts</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{debts.length} debt{debts.length !== 1 ? 's' : ''} tracked</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/simulator')} className="hidden sm:flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors">
            <Calculator className="w-4 h-4" /> Simulate
          </button>
          <button onClick={() => navigate('/ai')} className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Bot className="w-4 h-4" /> AI Advice
          </button>
          <button onClick={() => navigate('/debts/new')} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
            <PlusCircle className="w-4 h-4" /> Add Debt
          </button>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => <AlertBanner key={i} alert={a} />)}
        </div>
      )}

      {debts.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard icon={DollarSign} label="Total Debt" value={inr(totalBalance)} color="bg-red-50 dark:bg-red-900/20 text-red-600" />
            <SummaryCard icon={CreditCard} label="Monthly Minimums" value={inr(totalMin)} color="bg-orange-50 dark:bg-orange-900/20 text-orange-600" />
            <SummaryCard icon={TrendingUp} label="Highest APR" value={highestApr ? `${highestApr.interestRate}%` : '—'} color="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600" />
          </div>

          {debts.length >= 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Debt Breakdown</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {debts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">No debts yet</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">Add your first debt to start tracking and getting AI advice.</p>
          <button onClick={() => navigate('/debts/new')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">
            <PlusCircle className="w-4 h-4" /> Add your first debt
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {debts.map((debt) => <DebtCard key={debt._id} debt={debt} onDelete={handleDelete} maxBalance={maxBalance} />)}
        </div>
      )}
    </div>
  );
}
