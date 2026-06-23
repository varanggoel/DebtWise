"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import DebtForm, { type DebtFormValues } from "@/components/DebtForm";

export default function NewDebtPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (form: DebtFormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save debt");
      toast.success("Debt added");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save debt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.push("/dashboard")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </button>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Add new debt</h1>
        <p className="text-gray-500 text-sm mb-6">Enter the details of a debt you want to track.</p>
        <DebtForm onSubmit={handleSubmit} loading={loading} mode="create" />
      </div>
    </div>
  );
}
