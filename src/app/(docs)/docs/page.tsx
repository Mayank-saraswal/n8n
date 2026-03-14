import {
  Code,
  CreditCard,
  FileText,
  Globe,
  Mail,
  MessageCircle,
  Repeat,
  Table,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Introduction" };

const cards = [
  {
    title: "Getting Started",
    desc: "Set up your account and build your first workflow in 5 minutes.",
    href: "/docs/getting-started",
    icon: FileText,
  },
  {
    title: "Nodes Reference",
    desc: "Explore every available node and its configuration options.",
    href: "/docs/nodes",
    icon: Code,
  },
];

const nodeCards = [
  { title: "HTTP Request", href: "/docs/nodes/http-request", icon: Globe },
  { title: "Notion", href: "/docs/nodes/notion", icon: FileText },
  { title: "WhatsApp", href: "/docs/nodes/whatsapp", icon: MessageCircle },
  { title: "Razorpay", href: "/docs/nodes/razorpay", icon: CreditCard },
  { title: "Loop", href: "/docs/nodes/loop", icon: Repeat },
  { title: "Google Sheets", href: "/docs/nodes/google-sheets", icon: Table },
  { title: "Gmail", href: "/docs/nodes/gmail", icon: Mail },
  { title: "Code", href: "/docs/nodes/code", icon: Code },
];

export default function DocsHomePage() {
  return (
    <>
      <h1 className="text-4xl font-bold tracking-tight">
        Nodebase Documentation
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Learn how to automate workflows, connect apps, and scale your business
        with Nodebase.
      </p>

      {/* Quick-start cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-orange/40 hover:bg-orange-subtle"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange/10 text-orange">
              <c.icon className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground group-hover:text-orange">
                {c.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Node grid */}
      <h2 id="popular-nodes" className="mt-14 text-2xl font-bold">
        Popular Nodes
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Jump directly to a node reference page.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {nodeCards.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="group flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-center transition-colors hover:border-orange/40 hover:bg-orange-subtle"
          >
            <n.icon className="size-6 text-muted-foreground group-hover:text-orange" />
            <span className="text-sm font-medium text-foreground group-hover:text-orange">
              {n.title}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
