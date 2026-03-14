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
import { Breadcrumb, PrevNextLinks } from "@/components/docs/docs-shell";

export const metadata: Metadata = { title: "Nodes Overview" };

const nodes = [
  {
    title: "HTTP Request",
    desc: "Make HTTP requests to any API or webhook endpoint.",
    href: "/docs/nodes/http-request",
    icon: Globe,
  },
  {
    title: "Notion",
    desc: "Interact with Notion databases, pages, blocks, and users.",
    href: "/docs/nodes/notion",
    icon: FileText,
  },
  {
    title: "WhatsApp",
    desc: "Send messages via WhatsApp Cloud API (Meta).",
    href: "/docs/nodes/whatsapp",
    icon: MessageCircle,
  },
  {
    title: "Razorpay",
    desc: "Manage orders, payments, refunds, subscriptions, and more.",
    href: "/docs/nodes/razorpay",
    icon: CreditCard,
  },
  {
    title: "Loop",
    desc: "Iterate over an array and execute downstream nodes for each item.",
    href: "/docs/nodes/loop",
    icon: Repeat,
  },
  {
    title: "Google Sheets",
    desc: "Read, write, and manage Google Sheets spreadsheets.",
    href: "/docs/nodes/google-sheets",
    icon: Table,
  },
  {
    title: "Gmail",
    desc: "Send and manage emails through Gmail.",
    href: "/docs/nodes/gmail",
    icon: Mail,
  },
  {
    title: "Code",
    desc: "Write custom JavaScript to transform data or add logic.",
    href: "/docs/nodes/code",
    icon: Code,
  },
];

export default function NodesOverviewPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Nodes" }]} />

      <h1 className="text-4xl font-bold tracking-tight">Nodes</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Nodes are the building blocks of every Nodebase workflow. Each node
        performs a specific action — from calling an API to sending a WhatsApp
        message.
      </p>

      <h2 id="how-nodes-work" className="mt-10 text-2xl font-bold">
        How Nodes Work
      </h2>
      <p className="mt-3 leading-relaxed text-foreground/80">
        Every node receives the workflow <strong>context</strong>, performs its
        action, and merges the result back into context. Downstream nodes can
        then reference upstream outputs using template variables like{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
          {"{{variableName.httpResponse.data}}"}
        </code>
        .
      </p>

      <h2 id="available-nodes" className="mt-10 text-2xl font-bold">
        Available Nodes
      </h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {nodes.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="group flex gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-orange/40 hover:bg-orange-subtle"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange/10 text-orange">
              <n.icon className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground group-hover:text-orange">
                {n.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{n.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <PrevNextLinks />
    </>
  );
}
