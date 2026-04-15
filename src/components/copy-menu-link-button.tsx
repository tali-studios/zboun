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
      className="btn border border-white/50 text-white"
    >
      {copied ? "Copied" : "Copy menu link"}
    </button>
  );
}
