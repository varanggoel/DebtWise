import { AlertTriangle, Info } from "lucide-react";

import type { DebtAlert } from "@/types";

const styles: Record<DebtAlert["type"], string> = {
  danger: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

export default function AlertBanner({ alert }: { alert: DebtAlert }) {
  const Icon = alert.type === "info" ? Info : AlertTriangle;
  return (
    <div className={`flex items-start gap-3 border rounded-xl px-4 py-3 ${styles[alert.type]}`}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <p className="text-sm">{alert.message}</p>
    </div>
  );
}
