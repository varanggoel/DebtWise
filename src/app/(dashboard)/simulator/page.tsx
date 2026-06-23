"use client";

import { Calculator, TrendingDown, CreditCard, Info, Zap, Target, type LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import type { SimulatorResult } from "@/types";

interface SimulatorResponse {
  avalanche: SimulatorResult | null;
  snowball: SimulatorResult | null;
  debtCount?: number;
  extra?: number;
}

interface MethodContent {
  icon: LucideIcon;
  subtitle: string;
  body: string;
  pros: string[];
  con: string;
  best: string;
}

interface AccentClasses {
  icon: string;
  text: string;
  tag: string;
  iconBtn: string;
  tipFooter: string;
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <p className="text-xs font-medium mb-1 opacity-60">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

const TOOLTIP_CONTENT: Record<"avalanche" | "snowball", MethodContent> = {
  avalanche: {
    icon: Zap,
    subtitle: "Mathematically optimal",
    body: "Pay minimums on all debts, then put every extra rupee toward the highest interest rate debt first. Once cleared, roll that payment into the next highest-rate debt.",
    pros: ["Saves the most money overall", "Lowest total interest paid"],
    con: "May feel slow if the high-rate debt has a large balance",
    best: "Best for people motivated by numbers who want to minimize interest.",
  },
  snowball: {
    icon: Target,
    subtitle: "Psychologically rewarding",
    body: "Pay minimums on all debts, then put every extra rupee toward the smallest balance first. Once cleared, roll that payment into the next smallest balance.",
    pros: ["Quick wins keep you motivated", "Fewer monthly payments sooner"],
    con: "Usually pays slightly more total interest than Avalanche",
    best: "Best for people who need visible progress to stay on track.",
  },
};

function MethodSection({ method, label, payoff, interest, cardColor, accentClasses }: {
  method: "avalanche" | "snowball";
  label: string;
  payoff: string;
  interest: string;
  cardColor: string;
  accentClasses: AccentClasses;
}) {
  const [tipOpen, setTipOpen] = useState(false);
  const content = TOOLTIP_CONTENT[method];
  const Icon = content.icon;

  return (
    <div className="group/section">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${accentClasses.icon}`} />
        <span className={`text-sm font-semibold ${accentClasses.text}`}>{label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${accentClasses.tag}`}>{content.subtitle}</span>

        <div className="relative ml-auto opacity-0 group-hover/section:opacity-100 transition-opacity duration-150">
          <button
            onMouseEnter={() => setTipOpen(true)}
            onMouseLeave={() => setTipOpen(false)}
            className={`w-5 h-5 rounded-full flex items-center justify-center ${accentClasses.iconBtn}`}
            aria-label={`About ${label} method`}
          >
            <Info className="w-3 h-3" />
          </button>

          {tipOpen && (
            <div
              onMouseEnter={() => setTipOpen(true)}
              onMouseLeave={() => setTipOpen(false)}
              className="absolute right-0 top-7 z-30 w-72 bg-white border border-gray-200 rounded-xl shadow-xl p-4 text-left"
            >
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{content.body}</p>
              <div className="space-y-1 mb-3">
                {content.pros.map((p) => (
                  <div key={p} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <span className="text-green-500 mt-px">✓</span>
                    <span>{p}</span>
                  </div>
                ))}
                <div className="flex items-start gap-1.5 text-xs text-gray-500">
                  <span className="text-yellow-500 mt-px">~</span>
                  <span>{content.con}</span>
                </div>
              </div>
              <p className={`text-xs rounded-lg px-3 py-2 ${accentClasses.tipFooter}`}>{content.best}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Payoff Time" value={payoff} color={cardColor} />
        <StatCard label="Total Interest" value={interest} color={cardColor} />
      </div>
    </div>
  );
}

export default function SimulatorPage() {
  const [inputValue, setInputValue] = useState("0");
  const [extra, setExtra] = useState(0);
  const [data, setData] = useState<SimulatorResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async (extraAmt?: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/simulator?extraPayment=${extraAmt ?? extra}`);
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      toast.error("Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { run(0); }, []);

  const buildChartData = () => {
    if (!data?.avalanche?.schedule || !data.snowball?.schedule) return [];
    const av = data.avalanche.schedule;
    const sn = data.snowball.schedule;
    const maxLen = Math.max(av.length, sn.length);
    return Array.from({ length: Math.min(maxLen, 120) }, (_, i) => {
      const avTotal = av[i] ? av[i].balances.reduce((s, d) => s + d.balance, 0) : 0;
      const snTotal = sn[i] ? sn[i].balances.reduce((s, d) => s + d.balance, 0) : 0;
      return { month: i + 1, Avalanche: Math.round(avTotal), Snowball: Math.round(snTotal) };
    });
  };

  const fmtMonths = (m: number) => {
    if (!m) return "—";
    const y = Math.floor(m / 12);
    const mo = m % 12;
    return y > 0 ? `${y}y ${mo}m` : `${mo}m`;
  };
  const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

  const chartData = buildChartData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payoff Simulator</h1>
        <p className="text-gray-500 text-sm mt-0.5">Compare Snowball vs Avalanche strategies</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Extra monthly payment (₹)
        </label>
        <div className="flex gap-3">
          <input
            type="number"
            min="0"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const v = Math.max(0, Number(inputValue) || 0);
                setExtra(v);
                run(v);
              }
            }}
            className="w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0"
          />
          <button
            onClick={() => { const v = Math.max(0, Number(inputValue) || 0); setExtra(v); run(v); }}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Calculator className="w-4 h-4" />
            {loading ? "Calculating…" : "Calculate"}
          </button>
        </div>
      </div>

      {data && data.avalanche && data.snowball && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MethodSection
              method="avalanche"
              label="Avalanche"
              payoff={fmtMonths(data.avalanche.months)}
              interest={fmt(data.avalanche.totalInterest)}
              cardColor="bg-indigo-50 text-indigo-800 border-indigo-100"
              accentClasses={{
                icon: "text-indigo-500",
                text: "text-indigo-700",
                tag: "bg-indigo-100 text-indigo-600",
                iconBtn: "bg-indigo-100 text-indigo-600 hover:bg-indigo-200",
                tipFooter: "bg-indigo-50 text-indigo-700",
              }}
            />
            <MethodSection
              method="snowball"
              label="Snowball"
              payoff={fmtMonths(data.snowball.months)}
              interest={fmt(data.snowball.totalInterest)}
              cardColor="bg-purple-50 text-purple-800 border-purple-100"
              accentClasses={{
                icon: "text-purple-500",
                text: "text-purple-700",
                tag: "bg-purple-100 text-purple-600",
                iconBtn: "bg-purple-100 text-purple-600 hover:bg-purple-200",
                tipFooter: "bg-purple-50 text-purple-700",
              }}
            />
          </div>

          {data.avalanche.totalInterest < data.snowball.totalInterest && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">
                <strong>Avalanche saves you {fmt(data.snowball.totalInterest - data.avalanche.totalInterest)}</strong> in interest compared to Snowball.
              </p>
            </div>
          )}

          {chartData.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-5">Total Balance Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" label={{ value: "Month", position: "insideBottom", offset: -2 }} tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `₹${(Number(v) / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} />
                  <Legend />
                  <Line type="monotone" dataKey="Avalanche" stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Snowball" stroke="#a855f7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {data && !data.avalanche && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Add debts on the dashboard first to run a simulation.</p>
        </div>
      )}
    </div>
  );
}
