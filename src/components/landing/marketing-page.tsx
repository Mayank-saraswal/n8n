"use client";

import {
  ArrowRight,
  Bot,
  Brain,
  CheckCircle,
  Clock,
  Cpu,
  CreditCard,
  Database,
  GitBranch,
  Globe,
  Hash,
  Link2,
  Mail,
  Menu,
  MessageSquare,
  Play,
  Send,
  Shield,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { DM_Mono, DM_Sans, Syne } from "next/font/google";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

// ─── Fonts ────────────────────────────────────────────────────────────────────
const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});

import type { LucideIcon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type NodeItem = {
  icon: LucideIcon;
  label: string;
  sublabel: string;
};

type LogoItem = {
  icon: LucideIcon;
  name: string;
};

type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type PricingTier = {
  title: string;
  price: string;
  sub: string;
  features: string[];
  featured?: boolean;
  cta: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Integrations", href: "#integrations" },
  { label: "Pricing", href: "#pricing" },
  { label: "vs Zapier", href: "#compare" },
];

const FLOW_NODES: NodeItem[] = [
  { icon: Link2, label: "Webhook", sublabel: "on POST" },
  { icon: Bot, label: "OpenAI", sublabel: "gpt-4o" },
  { icon: MessageSquare, label: "Slack", sublabel: "#alerts" },
  { icon: Mail, label: "Email", sublabel: "SMTP" },
];

const LOGOS: LogoItem[] = [
  { icon: Bot, name: "OpenAI" },
  { icon: Brain, name: "Anthropic" },
  { icon: Send, name: "Telegram" },
  { icon: Hash, name: "Slack" },
  { icon: CreditCard, name: "Stripe" },
  { icon: Globe, name: "Google" },
  { icon: MessageSquare, name: "Discord" },
  { icon: Database, name: "Supabase" },
  { icon: Mail, name: "Gmail" },
  { icon: GitBranch, name: "GitHub" },
];

const FEATURES: FeatureItem[] = [
  {
    icon: Workflow,
    title: "Visual drag-and-drop editor",
    description:
      "Build complex automation flows with an intuitive canvas. Connect nodes, branch on conditions, and loop over collections — no code required.",
  },
  {
    icon: Zap,
    title: "Trigger on anything",
    description:
      "Webhooks, schedules, database changes, file uploads, API polls — Nodebase listens so you don't have to.",
  },
  {
    icon: Cpu,
    title: "AI-native actions",
    description:
      "First-class support for OpenAI, Anthropic, Google Gemini, and Groq. Summarise, classify, generate, and reason — right inside your workflow.",
  },
  {
    icon: Shield,
    title: "Credentials vault",
    description:
      "All API keys are encrypted at rest and never exposed in logs or workflow definitions. Share credentials across workflows safely.",
  },
  {
    icon: Clock,
    title: "Execution history",
    description:
      "Every run is logged with full input/output data, timing, and error traces. Retry failed steps in one click.",
  },
  {
    icon: GitBranch,
    title: "Branching & loops",
    description:
      "If/else branches, switch nodes, forEach loops, and wait nodes give you full programmatic control without writing a line of code.",
  },
];

const STATS = [
  { value: "20+", label: "Node types" },
  { value: "∞", label: "Workflows on Pro" },
  { value: "0ms", label: "Setup time" },
  { value: "₹0", label: "To get started" },
];

const PRICING: PricingTier[] = [
  {
    title: "Starter",
    price: "₹0",
    sub: "forever free",
    features: [
      "5 active workflows",
      "100 executions / month",
      "Community support",
      "3 credential slots",
    ],
    cta: "Start for Free",
  },
  {
    title: "Pro",
    price: "₹999",
    sub: "per month",
    features: [
      "Unlimited workflows",
      "10 000 executions / month",
      "Priority support",
      "Unlimited credential slots",
      "Execution history (30 days)",
    ],
    featured: true,
    cta: "Upgrade to Pro",
  },
  {
    title: "Enterprise",
    price: "Custom",
    sub: "contact us",
    features: [
      "Everything in Pro",
      "Dedicated cloud instance",
      "SSO / SAML",
      "99.9% uptime SLA",
      "Custom integrations",
    ],
    cta: "Talk to Sales",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Small logo-mark SVG used in the nav */
function LogoMark() {
  return (
    <span
      className="inline-flex items-center justify-center rounded-lg"
      style={{
        width: 32,
        height: 32,
        background: "#F97316",
        flexShrink: 0,
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        aria-hidden="true"
      >
        {/* Central node */}
        <circle cx="9" cy="9" r="2.5" fill="white" />
        {/* Satellite nodes */}
        <circle cx="3" cy="4" r="1.8" fill="white" opacity="0.85" />
        <circle cx="15" cy="4" r="1.8" fill="white" opacity="0.85" />
        <circle cx="3" cy="14" r="1.8" fill="white" opacity="0.85" />
        <circle cx="15" cy="14" r="1.8" fill="white" opacity="0.85" />
        {/* Edges */}
        <line
          x1="4.6"
          y1="5.3"
          x2="7.4"
          y2="7.7"
          stroke="white"
          strokeWidth="1.2"
          opacity="0.7"
        />
        <line
          x1="13.4"
          y1="5.3"
          x2="10.6"
          y2="7.7"
          stroke="white"
          strokeWidth="1.2"
          opacity="0.7"
        />
        <line
          x1="4.6"
          y1="12.7"
          x2="7.4"
          y2="10.3"
          stroke="white"
          strokeWidth="1.2"
          opacity="0.7"
        />
        <line
          x1="13.4"
          y1="12.7"
          x2="10.6"
          y2="10.3"
          stroke="white"
          strokeWidth="1.2"
          opacity="0.7"
        />
      </svg>
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function MarketingLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeNode, setActiveNode] = useState(0);

  // Nav scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cycle active node in canvas mockup
  useEffect(() => {
    const timer = setInterval(
      () => setActiveNode((n) => (n + 1) % FLOW_NODES.length),
      1600,
    );
    return () => clearInterval(timer);
  }, []);

  // Fade-up on scroll via IntersectionObserver
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".fade-up");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    for (const el of els) {
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const closeMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <div
      className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}
      style={{
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
        backgroundColor: "#0A0A0A",
        color: "#E5E5E5",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          backgroundColor: scrolled
            ? "rgba(10,10,10,0.85)"
            : "rgba(10,10,10,0.55)",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.07)"
            : "1px solid transparent",
          transition: "background-color 0.3s, border-color 0.3s",
        }}
      >
        <nav
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <LogoMark />
            <span
              style={{
                fontFamily: "var(--font-syne), sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: "#FFFFFF",
                letterSpacing: "-0.01em",
              }}
            >
              Nodebase
            </span>
          </Link>

          {/* Desktop nav links */}
          <ul
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
            className="hidden md:flex"
          >
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "#FFFFFF";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "rgba(255,255,255,0.6)";
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              href="/login"
              className="hidden md:inline-flex"
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                padding: "8px 16px",
                borderRadius: 8,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(255,255,255,0.7)";
              }}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                backgroundColor: "#F97316",
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                padding: "8px 18px",
                borderRadius: 8,
                whiteSpace: "nowrap",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                  "#EA6C0A";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                  "#F97316";
              }}
            >
              Start for Free
              <ArrowRight size={14} />
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              style={{
                background: "none",
                border: "none",
                color: "#FFFFFF",
                padding: 4,
                cursor: "pointer",
              }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              backgroundColor: "rgba(10,10,10,0.97)",
              padding: "16px 24px 24px",
            }}
          >
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {NAV_LINKS.map((link) => (
                <li key={link.href} style={{ marginBottom: 4 }}>
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    style={{
                      display: "block",
                      padding: "10px 0",
                      color: "rgba(255,255,255,0.75)",
                      textDecoration: "none",
                      fontSize: 15,
                      fontWeight: 500,
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li style={{ marginTop: 16 }}>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  style={{
                    display: "block",
                    padding: "10px 0",
                    color: "rgba(255,255,255,0.6)",
                    textDecoration: "none",
                    fontSize: 15,
                  }}
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          paddingTop: 140,
          paddingBottom: 80,
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* Dot-grid background */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            pointerEvents: "none",
          }}
        />
        {/* Orange radial glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            height: "60%",
            background:
              "radial-gradient(ellipse at center, rgba(249,115,22,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            maxWidth: 900,
            margin: "0 auto",
            padding: "0 24px",
          }}
        >
          {/* Beta badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "rgba(249,115,22,0.10)",
              border: "1px solid rgba(249,115,22,0.28)",
              borderRadius: 9999,
              padding: "5px 14px",
              marginBottom: 32,
              color: "#F97316",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "var(--font-dm-mono), monospace",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <Zap size={12} />
            Now in beta — free while we build
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontWeight: 800,
              fontSize: "clamp(44px, 7vw, 88px)",
              lineHeight: 1.06,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
              margin: "0 0 16px",
            }}
          >
            Automate anything.
            <br />
            <span
              style={{
                color: "#F97316",
                position: "relative",
                display: "inline-block",
              }}
            >
              No limits.
              {/* Underline decoration */}
              <svg
                aria-hidden="true"
                style={{
                  position: "absolute",
                  bottom: "-6px",
                  left: 0,
                  width: "100%",
                  height: "6px",
                  overflow: "visible",
                }}
                viewBox="0 0 100 6"
                preserveAspectRatio="none"
              >
                <path
                  d="M 0 4 Q 25 0 50 4 Q 75 8 100 4"
                  stroke="#F97316"
                  strokeWidth="2.5"
                  fill="none"
                  opacity="0.65"
                />
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              color: "rgba(255,255,255,0.55)",
              maxWidth: 580,
              margin: "28px auto 40px",
              lineHeight: 1.65,
            }}
          >
            Build powerful automation workflows with a visual drag-and-drop
            editor. Connect any API, trigger on any event, run on any schedule.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/signup"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "#F97316",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                padding: "13px 26px",
                borderRadius: 10,
                transition: "background-color 0.2s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.backgroundColor = "#EA6C0A";
                el.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.backgroundColor = "#F97316";
                el.style.transform = "translateY(0)";
              }}
            >
              Start for Free
              <ArrowRight size={16} />
            </Link>
            <a
              href="#features"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.8)",
                fontWeight: 500,
                fontSize: 15,
                textDecoration: "none",
                padding: "13px 26px",
                borderRadius: 10,
                transition: "background-color 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.backgroundColor = "rgba(255,255,255,0.1)";
                el.style.borderColor = "rgba(255,255,255,0.22)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.backgroundColor = "rgba(255,255,255,0.06)";
                el.style.borderColor = "rgba(255,255,255,0.12)";
              }}
            >
              <Play size={15} />
              See how it works
            </a>
          </div>

          {/* Stats bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 0,
              marginTop: 48,
              borderTop: "1px solid rgba(255,255,255,0.07)",
              paddingTop: 28,
            }}
          >
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "0 32px",
                  borderRight:
                    i < STATS.length - 1
                      ? "1px solid rgba(255,255,255,0.10)"
                      : "none",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-syne), sans-serif",
                    fontWeight: 700,
                    fontSize: 26,
                    color: "#F97316",
                    lineHeight: 1.2,
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "var(--font-dm-mono), monospace",
                    marginTop: 2,
                  }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas Mockup */}
        <div
          style={{
            maxWidth: 900,
            margin: "56px auto 0",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(18,18,20,0.85)",
              boxShadow:
                "0 0 0 1px rgba(0,0,0,0.6), 0 40px 80px -16px rgba(0,0,0,0.7)",
            }}
          >
            {/* Browser chrome bar */}
            <div
              style={{
                backgroundColor: "#1A1A1E",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {/* Traffic lights */}
              <div style={{ display: "flex", gap: 6 }}>
                {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
                  <span
                    key={c}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: c,
                      display: "block",
                    }}
                  />
                ))}
              </div>
              {/* Fake URL bar */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: 6,
                  padding: "4px 12px",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.35)",
                  fontFamily: "var(--font-dm-mono), monospace",
                  textAlign: "center",
                  maxWidth: 400,
                  margin: "0 auto",
                }}
              >
                nodebase.app/workflows/my-automation
              </div>
            </div>

            {/* Workflow canvas */}
            <div
              style={{
                padding: "40px 32px 44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0,
                overflowX: "auto",
              }}
            >
              {FLOW_NODES.map((node, i) => {
                const Icon = node.icon;
                const isActive = activeNode === i;
                return (
                  <div
                    key={node.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {/* Node card */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "14px 20px",
                        borderRadius: 12,
                        backgroundColor: isActive
                          ? "rgba(249,115,22,0.10)"
                          : "rgba(255,255,255,0.04)",
                        border: isActive
                          ? "1.5px solid rgba(249,115,22,0.6)"
                          : "1.5px solid rgba(255,255,255,0.09)",
                        minWidth: 90,
                        transition: "all 0.4s ease",
                        boxShadow: isActive
                          ? "0 0 18px rgba(249,115,22,0.15)"
                          : "none",
                        position: "relative",
                      }}
                    >
                      {isActive && (
                        <span
                          className="orange-dot-pulse"
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            backgroundColor: "#F97316",
                          }}
                        />
                      )}
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          backgroundColor: isActive
                            ? "rgba(249,115,22,0.22)"
                            : "rgba(255,255,255,0.07)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 8,
                        }}
                      >
                        <Icon
                          size={18}
                          color={isActive ? "#F97316" : "rgba(255,255,255,0.6)"}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.7)",
                        }}
                      >
                        {node.label}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          color: "rgba(255,255,255,0.35)",
                          fontFamily: "var(--font-dm-mono), monospace",
                          marginTop: 2,
                        }}
                      >
                        {node.sublabel}
                      </span>
                    </div>

                    {/* Connector line */}
                    {i < FLOW_NODES.length - 1 && (
                      <div
                        className="node-connector"
                        style={{
                          width: 44,
                          height: 2,
                          background:
                            "linear-gradient(90deg, rgba(249,115,22,0.6), rgba(249,115,22,0.25))",
                          borderRadius: 2,
                          position: "relative",
                          flexShrink: 0,
                        }}
                      >
                        {/* Arrow head */}
                        <span
                          style={{
                            position: "absolute",
                            right: -1,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 0,
                            height: 0,
                            borderTop: "4px solid transparent",
                            borderBottom: "4px solid transparent",
                            borderLeft: "6px solid rgba(249,115,22,0.5)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Logos strip ───────────────────────────────────────────────────── */}
      <section
        id="integrations"
        style={{ padding: "60px 24px", textAlign: "center" }}
        className="fade-up"
      >
        <p
          style={{
            fontSize: 11,
            fontFamily: "var(--font-dm-mono), monospace",
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          Works with the tools you already use
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 10,
            maxWidth: 780,
            margin: "0 auto",
          }}
        >
          {LOGOS.map(({ icon: Icon, name }) => (
            <div
              key={name}
              className="mkt-logo-chip"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                border: "1px solid",
                borderRadius: 8,
                padding: "7px 14px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "default",
              }}
            >
              <Icon size={14} />
              {name}
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section
        id="features"
        style={{
          padding: "80px 24px",
          maxWidth: 1120,
          margin: "0 auto",
        }}
      >
        <div
          className="fade-up"
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <h2
            style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontWeight: 800,
              fontSize: "clamp(30px, 4.5vw, 52px)",
              letterSpacing: "-0.025em",
              color: "#FFFFFF",
              margin: "0 0 16px",
            }}
          >
            Everything you need to automate
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "rgba(255,255,255,0.45)",
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            A complete toolkit for building production-grade workflows — no
            DevOps degree required.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
            gap: 16,
          }}
        >
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="fade-up mkt-feature-card"
                style={{
                  border: "1px solid",
                  borderRadius: 14,
                  padding: "28px 28px",
                  transitionDelay: `${i * 60}ms`,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    backgroundColor: "rgba(249,115,22,0.12)",
                    border: "1px solid rgba(249,115,22,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Icon size={20} color="#F97316" />
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-syne), sans-serif",
                    fontWeight: 700,
                    fontSize: 17,
                    color: "#FFFFFF",
                    margin: "0 0 10px",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── vs Zapier comparison ──────────────────────────────────────────── */}
      <section
        id="compare"
        style={{
          padding: "80px 24px",
          maxWidth: 800,
          margin: "0 auto",
          textAlign: "center",
        }}
        className="fade-up"
      >
        <h2
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontWeight: 800,
            fontSize: "clamp(28px, 4vw, 46px)",
            letterSpacing: "-0.025em",
            color: "#FFFFFF",
            margin: "0 0 12px",
          }}
        >
          Why Nodebase over Zapier?
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.45)",
            marginBottom: 40,
          }}
        >
          Zapier charges by the task. Nodebase charges by the workflow.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            textAlign: "left",
          }}
        >
          {[
            ["Visual canvas editor", true, false],
            ["Unlimited steps per workflow", true, false],
            ["AI-native nodes built-in", true, false],
            ["Self-hostable (coming soon)", true, false],
            ["Task-based pricing", false, true],
            ["Locked to 100 tasks/month (Free)", false, true],
          ].map(([label, nb]) => (
            <div
              key={String(label)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                backgroundColor: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  marginTop: 1,
                  flexShrink: 0,
                  color: nb ? "#22C55E" : "#EF4444",
                }}
              >
                <CheckCircle size={15} />
              </div>
              <span
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.5,
                }}
              >
                <strong
                  style={{
                    color: "#FFFFFF",
                    fontWeight: 600,
                    display: "block",
                  }}
                >
                  {nb ? "Nodebase" : "Zapier"}
                </strong>
                {String(label)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section
        id="pricing"
        style={{
          padding: "80px 24px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div
          className="fade-up"
          style={{ textAlign: "center", marginBottom: 52 }}
        >
          <h2
            style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontWeight: 800,
              fontSize: "clamp(30px, 4.5vw, 52px)",
              letterSpacing: "-0.025em",
              color: "#FFFFFF",
              margin: "0 0 12px",
            }}
          >
            Simple, transparent pricing
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.45)",
            }}
          >
            No hidden fees. No per-task billing. Pick a plan and automate
            freely.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
            gap: 20,
          }}
        >
          {PRICING.map((tier) => (
            <div
              key={tier.title}
              className="fade-up"
              style={{
                backgroundColor: tier.featured
                  ? "rgba(249,115,22,0.07)"
                  : "rgba(255,255,255,0.03)",
                border: tier.featured
                  ? "1.5px solid rgba(249,115,22,0.45)"
                  : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "32px 28px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {tier.featured && (
                <span
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    backgroundColor: "#F97316",
                    color: "#FFFFFF",
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: "var(--font-dm-mono), monospace",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    borderRadius: 6,
                    padding: "3px 8px",
                  }}
                >
                  Most popular
                </span>
              )}
              <h3
                style={{
                  fontFamily: "var(--font-syne), sans-serif",
                  fontWeight: 700,
                  fontSize: 20,
                  color: "#FFFFFF",
                  margin: "0 0 8px",
                }}
              >
                {tier.title}
              </h3>
              <div style={{ marginBottom: 24 }}>
                <span
                  style={{
                    fontFamily: "var(--font-syne), sans-serif",
                    fontWeight: 800,
                    fontSize: 40,
                    color: tier.featured ? "#F97316" : "#FFFFFF",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {tier.price}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.4)",
                    marginLeft: 6,
                  }}
                >
                  {tier.sub}
                </span>
              </div>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 28px",
                  flex: 1,
                }}
              >
                {tier.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 9,
                      marginBottom: 10,
                      fontSize: 14,
                      color: "rgba(255,255,255,0.65)",
                    }}
                  >
                    <CheckCircle
                      size={15}
                      color="#22C55E"
                      style={{ marginTop: 1, flexShrink: 0 }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`mkt-pricing-link ${tier.featured ? "mkt-pricing-link-featured" : "mkt-pricing-link-default"}`}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "12px",
                  borderRadius: 9,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                  backgroundColor: tier.featured
                    ? "#F97316"
                    : "rgba(255,255,255,0.07)",
                  color: "#FFFFFF",
                  border: tier.featured
                    ? "none"
                    : "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "80px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
        className="fade-up"
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(249,115,22,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", maxWidth: 620, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontWeight: 800,
              fontSize: "clamp(30px, 5vw, 52px)",
              letterSpacing: "-0.025em",
              color: "#FFFFFF",
              margin: "0 0 16px",
              lineHeight: 1.1,
            }}
          >
            Start automating today.
            <br />
            <span style={{ color: "#F97316" }}>It takes 30 seconds.</span>
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.45)",
              marginBottom: 36,
            }}
          >
            No credit card required. Free forever on the Starter plan.
          </p>
          <Link
            href="/signup"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "#F97316",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: 16,
              textDecoration: "none",
              padding: "15px 32px",
              borderRadius: 10,
              transition: "background-color 0.2s, transform 0.15s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.backgroundColor = "#EA6C0A";
              el.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.backgroundColor = "#F97316";
              el.style.transform = "translateY(0)";
            }}
          >
            Create your free account
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "36px 24px",
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LogoMark />
          <span
            style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            Nodebase
          </span>
        </div>

        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.25)",
            fontFamily: "var(--font-dm-mono), monospace",
            margin: 0,
          }}
        >
          &copy; {new Date().getFullYear()} Nodebase. Built with{" "}
          <span style={{ color: "#F97316" }}>&#9829;</span>
        </p>

        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Contact"].map((item) => (
            <Link
              key={item}
              href="#"
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.35)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(255,255,255,0.7)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(255,255,255,0.35)";
              }}
            >
              {item}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
