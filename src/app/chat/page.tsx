import { TrendingDown } from "lucide-react";
import Link from "next/link";

import { auth } from "@/lib/auth";

export default async function ChatPage() {
  const session = await auth();
  const isAuthenticated = !!session?.user;
  const base = process.env.NEXT_PUBLIC_STREAMLIT_URL;
  // Streamlit Cloud redirects in a loop inside iframes unless embed=true is set.
  const url = base ? `${base}${base.includes("?") ? "&" : "?"}embed=true` : undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-indigo-600 text-lg">
            <TrendingDown className="w-5 h-5" />
            DebtWise
          </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Sign in</Link>
                <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Create free account
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Debt Assistant</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Ask questions or upload a bank statement, CIBIL report, or loan document for AI analysis — no account needed.
          </p>
        </div>

        {url ? (
          <iframe
            src={url}
            className="w-full rounded-2xl border border-gray-200 bg-white"
            style={{ height: "80vh" }}
            title="AI Debt Assistant"
          />
        ) : (
          <div className="text-center py-20 text-gray-500">
            Streamlit URL not configured. Set{" "}
            <code className="px-1 py-0.5 rounded bg-gray-100">NEXT_PUBLIC_STREAMLIT_URL</code>.
          </div>
        )}
      </main>
    </div>
  );
}
