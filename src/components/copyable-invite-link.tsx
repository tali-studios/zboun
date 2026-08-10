"use client";

import { useState } from "react";

type Props = {
  link: string;
  tone?: "amber" | "red";
};

export function CopyableInviteLink({ link, tone = "amber" }: Props) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  const border = tone === "red" ? "border-red-300" : "border-amber-300";
  const bg = tone === "red" ? "bg-red-50" : "bg-amber-50";
  const text = tone === "red" ? "text-red-900" : "text-amber-900";

  return (
    <div className="mt-1 flex items-stretch gap-2">
      <input
        type="text"
        readOnly
        value={link}
        onFocus={(e) => e.currentTarget.select()}
        className={`w-full rounded border ${border} ${bg} px-2 py-1 text-xs font-mono ${text}`}
      />
      <button
        type="button"
        onClick={onCopy}
        className={`shrink-0 rounded border ${border} ${bg} px-3 py-1 text-xs font-semibold ${text} transition hover:brightness-95`}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
