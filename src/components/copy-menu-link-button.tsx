"use client";

import { useState } from "react";

type Props = {
  url: string;
  label?: string;
};

export function CopyMenuLinkButton({ url, label = "Copy menu link" }: Props) {
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
      className={`btn rounded-full border shadow-sm transition ${
        copied
          ? "border-emerald-300/60 bg-emerald-500 text-white hover:bg-emerald-400"
          : "border-sky-300/60 bg-sky-500 text-white hover:bg-sky-400"
      }`}
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
