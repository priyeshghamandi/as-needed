"use client";

import { useState } from "react";
import { Icon } from "@/components/primitives";

export function InviteLinkCopy({
  url,
  label = "Invite link",
  compact = false,
}: {
  url: string;
  label?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="inline-flex items-center gap-1 text-[11px] font-mono text-teal-700 hover:text-teal-900"
      >
        <Icon name={copied ? "check" : "copy"} className="w-3 h-3" />
        {copied ? "Copied" : "Copy link"}
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-ink-200 bg-paper/40 p-3 space-y-2">
      <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500">{label}</div>
      <div className="flex items-center gap-2 min-w-0">
        <input
          type="text"
          readOnly
          value={url}
          className="flex-1 min-w-0 h-9 px-2 rounded-md border border-ink-200 bg-white text-[12px] font-mono text-ink-700 truncate"
          onFocus={(e) => e.target.select()}
        />
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="shrink-0 h-9 px-3 rounded-md border border-ink-200 bg-white text-[12px] font-medium hover:bg-ink-50 inline-flex items-center gap-1.5"
        >
          <Icon name={copied ? "check" : "copy"} className="w-3.5 h-3.5" />
          {copied ? "Copied" : "Copy"}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 h-9 px-3 rounded-md border border-ink-200 bg-white text-[12px] font-medium hover:bg-ink-50 inline-flex items-center gap-1.5"
        >
          <Icon name="external-link" className="w-3.5 h-3.5" />
          Open
        </a>
      </div>
      <p className="text-[11px] text-ink-500">
        Share this link with the invitee. It expires in 7 days.
      </p>
    </div>
  );
}
