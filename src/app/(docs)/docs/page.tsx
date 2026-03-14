import {
  Bot,
  Code,
  FileText,
  Globe,
  Mail,
  MessageCircle,
  Repeat,
  SlidersHorizontal,
  Table,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Introduction" };

const quickCards = [
  {
    title: "Getting Started",
    desc: "Set up your account and build your first workflow in 5 minutes.",
    href: "/docs/getting-started",
    icon: FileText,
  },
  {
    title: "All Nodes (29)",
    desc: "Explore every node — triggers, AI, messaging, payments, and more.",
    href: "/docs/nodes",
    icon: Zap,
  },
];

const popularNodes = [
  { title: "Razorpay", href: "/docs/nodes/razorpay", logo: "/logos/razorpay.svg" },
  { title: "WhatsApp", href: "/docs/nodes/whatsapp", icon: MessageCircle },
  { title: "Notion", href: "/docs/nodes/notion", icon: FileText },
  { title: "HTTP Request", href: "/docs/nodes/http-request", icon: Globe },
  { title: "Gmail", href: "/docs/nodes/gmail", icon: Mail },
  { title: "Google Sheets", href: "/docs/nodes/google-sheets", icon: Table },
  { title: "Code", href: "/docs/nodes/code", icon: Code },
  { title: "Loop", href: "/docs/nodes/loop", icon: Repeat },
];

const categories = [
  {
    title: "Triggers",
    desc: "5 trigger types — manual, webhook, schedule, Google Forms, Stripe",
    href: "/docs/nodes#triggers",
    color: "bg-green-100 text-green-700",
  },
  {
    title: "AI Nodes",
    desc: "7 providers — Gemini, OpenAI, Anthropic, xAI, DeepSeek, Perplexity, Groq",
    href: "/docs/nodes#ai-nodes",
    color: "bg-purple-100 text-purple-700",
  },
  {
    title: "Messaging",
    desc: "5 channels — WhatsApp, Discord, Slack, Telegram, X",
    href: "/docs/nodes#messaging",
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Google Workspace",
    desc: "Gmail, Google Sheets, Google Drive",
    href: "/docs/nodes#google-workspace",
    color: "bg-red-100 text-red-700",
  },
  {
    title: "Payments & SaaS",
    desc: "Razorpay (28 ops), Notion (11 ops), Workday",
    href: "/docs/nodes#payments-saas",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    title: "Utility & Logic",
    desc: "HTTP Request, If/Else, Set Variable, Code, Loop",
    href: "/docs/nodes#utility-logic",
    color: "bg-gray-100 text-gray-700",
  },
];

export default function DocsHomePage() {
  return (
    <>
      <h1 className="text-4xl font-bold tracking-tight">
        Nodebase Documentation
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Learn how to automate workflows, connect apps, and scale your business
        with Nodebase — the visual workflow automation platform built for Indian teams.
      </p>

      {/* Quick-start cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {quickCards.map((c) => (
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

      {/* Node categories */}
      <h2 id="categories" className="mt-14 text-2xl font-bold">
        Node Categories
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        29 nodes across 6 categories — click to explore.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="group rounded-lg border border-border p-4 transition-colors hover:border-orange/40 hover:bg-orange-subtle"
          >
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${cat.color}`}
            >
              {cat.title}
            </span>
            <p className="mt-2 text-sm text-muted-foreground">{cat.desc}</p>
          </Link>
        ))}
      </div>

      {/* Popular Nodes */}
      <h2 id="popular-nodes" className="mt-14 text-2xl font-bold">
        Popular Nodes
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Jump directly to a node&apos;s detailed reference page.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {popularNodes.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="group flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-center transition-colors hover:border-orange/40 hover:bg-orange-subtle"
          >
            {n.logo ? (
                 <img src={n.logo} alt={n.title} className="size-6 object-contain rounded-sm opacity-50 group-hover:opacity-100 transition-opacity" />
            ) : n.icon ? (
                 <n.icon className="size-6 text-muted-foreground group-hover:text-orange" />
            ) : null}
            <span className="text-sm font-medium text-foreground group-hover:text-orange">
              {n.title}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
