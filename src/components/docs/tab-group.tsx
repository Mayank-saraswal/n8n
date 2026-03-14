"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  label: string;
  content: React.ReactNode;
}

export function TabGroup({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="my-4">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {tabs.map((tab, i) => (
          <button
            type="button"
            key={tab.label}
            onClick={() => setActive(i)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              active === i
                ? "border-b-2 border-orange text-orange"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="pt-4">{tabs[active]?.content}</div>
    </div>
  );
}
