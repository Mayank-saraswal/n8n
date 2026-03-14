"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CodeBlock({
  code,
  language = "text",
  title,
}: {
  code: string;
  language?: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group my-4 overflow-hidden rounded-lg border border-border bg-[#1e1e2e]">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs text-white/60">
            {language}
          </span>
          {title && <span className="text-xs text-white/40">{title}</span>}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors",
            copied ? "text-green-400" : "text-white/40 hover:text-white/70",
          )}
        >
          {copied ? (
            <>
              <Check className="size-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <pre className="overflow-x-auto p-4">
        <code className="font-mono text-sm leading-relaxed text-white/90">
          {code}
        </code>
      </pre>
    </div>
  );
}
