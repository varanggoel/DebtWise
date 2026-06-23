import { TrendingDown, Bot, BarChart2, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

import { auth } from "@/lib/auth";

const features = [
  { icon: TrendingDown, title: "Debt Tracking", desc: "Track all your debts — credit cards, loans, mortgages — in one clean dashboard." },
  { icon: Bot, title: "AI Analyzer", desc: "Upload statements and loan documents for AI-powered analysis and debt-trap warnings." },
  { icon: BarChart2, title: "Payoff Simulator", desc: "Compare Snowball vs Avalanche strategies and see your exact debt-free date." },
];

const benefits = [
  "Snowball & Avalanche payoff simulations",
  "AI-powered document analysis",
  "Debt-trap risk detection alerts",
  "Visual charts & payoff timelines",
  "Secure email + Google OAuth login",
];

export default async function LandingPage() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Nav */}
      <nav className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-indigo-600 text-lg">
          <TrendingDown className="w-5 h-5" />
          DebtWise
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium">Sign in</Link>
              <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Get started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <span className="inline-block bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold px-3 py-1 rounded-full mb-6">
          AI-Powered Debt Management
        </span>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
          Get out of debt<br />
          <span className="text-indigo-600">smarter &amp; faster</span>
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
          DebtWise analyzes your debts, simulates payoff strategies, and uses AI to generate a personalized plan to reach financial freedom.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold text-base transition-colors"
          >
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-3 rounded-xl font-semibold text-base transition-colors"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-10 text-white">
          <h2 className="text-3xl font-bold mb-2">Everything you need</h2>
          <p className="text-indigo-200 mb-8">One app to track, simulate, and eliminate your debt.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-300 flex-shrink-0" />
                <span className="text-sm">{b}</span>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              Create free account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} DebtWise · Built with AI
      </footer>
    </div>
  );
}
