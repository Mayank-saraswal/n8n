"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Zap } from "lucide-react"
import { useFadeUp } from "./use-fade-up"

export function Hero() {
  const headlineRef = useFadeUp()
  const subRef = useFadeUp()
  const ctaRef = useFadeUp()
  const imageRef = useFadeUp()

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Orange glow top-right */}
      <div className="pointer-events-none absolute -top-48 -right-48 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute top-32 -left-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-6 pt-28 pb-20 text-center">
        {/* Top badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 mb-8">
          <Zap className="h-3 w-3 text-orange-500" />
          Now with AI-powered nodes
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef as React.RefObject<HTMLHeadingElement>}
          className="fade-up text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]"
        >
          Automate anything.
          <br />
          <span className="text-primary">Built for Indian businesses.</span>
        </h1>

        {/* Subheadline */}
        <p
          ref={subRef as React.RefObject<HTMLParagraphElement>}
          className="fade-up mt-6 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Connect Razorpay, WhatsApp, Gmail, Google Sheets and 30+ apps without
          writing code. Built for the way Indian businesses actually work.
        </p>

        {/* CTA buttons */}
        <div
          ref={ctaRef as React.RefObject<HTMLDivElement>}
          className="fade-up mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/signup"
            id="hero-cta-primary"
            className="h-12 px-8 rounded-lg bg-primary text-primary-foreground text-base font-medium hover:bg-orange-600 transition-colors inline-flex items-center justify-center"
          >
            Start for free
          </Link>
          <a
            href="#how-it-works"
            id="hero-cta-secondary"
            className="h-12 px-8 rounded-lg border border-border text-base font-medium text-foreground hover:bg-accent transition-colors inline-flex items-center justify-center gap-2 group"
          >
            See how it works
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* Trust line */}
        <p className="mt-6 text-sm text-muted-foreground">
          Free plan includes 50 executions/month. No credit card required.
        </p>

        {/* Hero illustration — workflow canvas mockup */}
        <div
          ref={imageRef as React.RefObject<HTMLDivElement>}
          className="fade-up mt-16 relative mx-auto max-w-4xl"
        >
          <div className="rounded-2xl border border-border shadow-2xl overflow-hidden bg-white">
            {/* Toolbar strip */}
            <div className="flex items-center gap-1.5 border-b border-border bg-gray-50/80 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-4 text-xs text-muted-foreground font-mono">
                Razorpay Payment Flow — Active
              </span>
              <span className="ml-auto flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500 orange-dot-pulse" />
                <span className="text-xs text-muted-foreground">Live</span>
              </span>
            </div>

            {/* Canvas area */}
            <div
              className="relative bg-white px-8 py-10 min-h-[300px]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            >
              {/* Workflow nodes */}
              <div className="flex items-center justify-center gap-0">
                {/* Node: Razorpay Trigger */}
                <WorkflowNode
                  logo="/logos/razorpay.svg"
                  title="Razorpay Trigger"
                  subtitle="payment.captured"
                  status="success"
                />

                <NodeConnector />

                {/* Node: Filter */}
                <WorkflowNodeIcon
                  title="Filter"
                  subtitle="amount &gt; 1000"
                  status="success"
                  color="#6366f1"
                  letter="F"
                />

                <NodeConnector />

                {/* Node: Gmail */}
                <WorkflowNode
                  logo="/logos/gmail.svg"
                  title="Gmail"
                  subtitle="Send receipt"
                  status="success"
                />

                <NodeConnector />

                {/* Node: Google Sheets */}
                <WorkflowNode
                  logo="/logos/googlesheets.svg"
                  title="Google Sheets"
                  subtitle="Append row"
                  status="loading"
                />
              </div>

              {/* Execution trace below */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <div className="rounded-lg border border-green-100 bg-green-50 px-3 py-1.5 text-xs text-green-700 font-mono">
                  3 of 4 nodes complete
                </div>
                <div className="rounded-lg border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs text-orange-700 font-mono">
                  Execution #1284 running...
                </div>
              </div>
            </div>

            {/* Gradient overlay at bottom */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* Internal sub-components for the hero canvas mockup */
function WorkflowNode({
  logo,
  title,
  subtitle,
  status,
}: {
  logo: string
  title: string
  subtitle: string
  status: "idle" | "loading" | "success"
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm min-w-[160px] transition-all ${
        status === "success"
          ? "border-green-200"
          : status === "loading"
            ? "border-primary/30"
            : "border-border"
      }`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">
        <Image src={logo} alt={title} width={20} height={20} className="h-5 w-5 object-contain" />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-foreground truncate">
          {title}
        </div>
        <div className="text-[10px] text-muted-foreground truncate">
          {subtitle}
        </div>
      </div>
      <StatusPip status={status} />
    </div>
  )
}

function WorkflowNodeIcon({
  title,
  subtitle,
  status,
  color,
  letter,
}: {
  title: string
  subtitle: string
  status: "idle" | "loading" | "success"
  color: string
  letter: string
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm min-w-[140px] transition-all ${
        status === "success"
          ? "border-green-200"
          : status === "loading"
            ? "border-primary/30"
            : "border-border"
      }`}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold"
        style={{ backgroundColor: color }}
      >
        {letter}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-foreground">{title}</div>
        <div className="text-[10px] text-muted-foreground">{subtitle}</div>
      </div>
      <StatusPip status={status} />
    </div>
  )
}

function NodeConnector() {
  return (
    <div className="flex items-center mx-1">
      <div className="h-px w-8 bg-primary/30 node-connector" />
      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
      <div className="h-px w-2 bg-primary/30" />
    </div>
  )
}

function StatusPip({ status }: { status: "idle" | "loading" | "success" }) {
  if (status === "success") {
    return <span className="ml-auto h-2 w-2 rounded-full bg-green-500 shrink-0" />
  }
  if (status === "loading") {
    return (
      <span className="ml-auto shrink-0 relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
    )
  }
  return <span className="ml-auto h-2 w-2 rounded-full bg-muted shrink-0" />
}
