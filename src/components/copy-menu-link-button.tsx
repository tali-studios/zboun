"use client";

import { useState } from "react";

type Props = {
  url: string;
};

export function CopyMenuLinkButton({ url }: Props) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
    >
      {copied ? "Copied" : "Copy menu link"}
    </button>
  );
}
