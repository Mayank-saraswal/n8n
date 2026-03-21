"use client"

import {
  Zap,
  Shield,
  RefreshCw,
  PlugZap,
  Clock,
  IndianRupee,
} from "lucide-react"
import { useFadeUp } from "./use-fade-up"
import type { LucideIcon } from "lucide-react"

const FEATURES: {
  icon: LucideIcon
  title: string
  description: string
}[] = [
  {
    icon: Zap,
    title: "Visual workflow builder",
    description:
      "Drag and drop nodes to build complex automations. No code required. What you see is what executes.",
  },
  {
    icon: Shield,
    title: "Enterprise-grade security",
    description:
      "AES-256 encryption for all credentials. OAuth2 for Google, encrypted webhook secrets for payment gateways.",
  },
  {
    icon: RefreshCw,
    title: "Reliable execution",
    description:
      "Webhook deduplication prevents double charges. Automatic retries with exponential backoff. 99.9% uptime.",
  },
  {
    icon: PlugZap,
    title: "30+ native integrations",
    description:
      "Razorpay, WhatsApp, Gmail, Google Sheets, Notion, Cashfree, Delhivery, MSG91 and growing every week.",
  },
  {
    icon: Clock,
    title: "Real-time monitoring",
    description:
      "Watch your workflows execute in real time. Full execution history with per-node input and output inspection.",
  },
  {
    icon: IndianRupee,
    title: "India-first pricing",
    description:
      "Priced in INR. Plans that make sense for Indian startups, agencies, and growing businesses.",
  },
]

export function Features() {
  const labelRef = useFadeUp()
  const headlineRef = useFadeUp()
  const subRef = useFadeUp()

  return (
    <section id="features" className="py-24 bg-gray-50/50 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p
            ref={labelRef as React.RefObject<HTMLParagraphElement>}
            className="fade-up text-xs font-semibold uppercase tracking-widest text-primary mb-4"
          >
            Everything you need
          </p>
          <h2
            ref={headlineRef as React.RefObject<HTMLHeadingElement>}
            className="fade-up text-4xl md:text-5xl font-bold tracking-tight text-foreground"
          >
            Powerful automation, zero complexity
          </h2>
          <p
            ref={subRef as React.RefObject<HTMLParagraphElement>}
            className="fade-up mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Every feature you need to automate your business workflows, without
            the learning curve.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  feature,
  delay,
}: {
  feature: (typeof FEATURES)[number]
  delay: number
}) {
  const ref = useFadeUp()
  const Icon = feature.icon

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="fade-up bg-white rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow duration-200 group"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="bg-orange-50 rounded-lg p-2.5 w-fit mb-4 group-hover:bg-orange-100 transition-colors">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {feature.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {feature.description}
      </p>
    </div>
  )
}
