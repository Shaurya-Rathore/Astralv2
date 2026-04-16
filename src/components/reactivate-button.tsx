"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reactivateCandidate } from "@/lib/store";
import { currentUser } from "@/lib/auth";

interface ReactivateButtonProps {
  candidateId: string;
  requestId: string;
  suggestionLabels?: string[];
  /** Called after mutation — parent can use to refresh local state */
  onReactivated?: () => void;
  size?: "sm" | "md";
}

export function ReactivateButton({
  candidateId,
  requestId,
  suggestionLabels,
  onReactivated,
  size = "sm",
}: ReactivateButtonProps) {
  const [done, setDone] = useState(false);
  const router = useRouter();

  function handleClick() {
    reactivateCandidate(candidateId, requestId, currentUser.name, {
      suggestionLabels,
    });
    setDone(true);
    onReactivated?.();
    router.refresh();
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400">
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="2.5 6 5 8.5 9.5 3.5" />
        </svg>
        Reactivated
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`rounded-md bg-violet-600 font-medium text-white transition-colors hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 ${
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
      }`}
    >
      Reactivate
    </button>
  );
}
