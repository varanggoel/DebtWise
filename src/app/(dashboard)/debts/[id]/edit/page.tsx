"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import DebtForm, { type DebtFormValues } from "@/components/DebtForm";
import type { IDebt } from "@/types";

export default function EditDebtPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [initialValues, setInitialValues] = useState<IDebt | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch(`/api/debts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Debt not found");
        return res.json();
      })
      .then((data) => setInitialValues(data))
      .catch(() => {
        toast.error("Debt not found");
        router.push("/dashboard");
      })
      .finally(() => setFetching(false));
  }, [id, router]);

  const handleSubmit = async (form: DebtFormValues) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/debts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save debt");
      toast.success("Debt updated");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save debt");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.push("/dashboard")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </button>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Edit debt</h1>
        <p className="text-gray-500 text-sm mb-6">Update the details for this debt.</p>
        <DebtForm
          initialValues={initialValues ?? undefined}
          onSubmit={handleSubmit}
          loading={loading}
          mode="edit"
        />
      </div>
    </div>
  );
}
