"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Minus } from "lucide-react"
import { useFadeUp } from "./use-fade-up"
import { Badge } from "@/components/ui/badge"

type BillingCycle = "monthly" | "annual"

const PLANS = [
  {
    name: "Free",
    subtitle: "Forever free",
    monthlyPrice: 0,
    annualPrice: 0,
    featured: false,
    features: [
      { text: "50 workflow executions/month", included: true },
      { text: "5 active workflows", included: true },
      { text: "All 30+ integrations", included: true },
      { text: "Execution history", included: true },
      { text: "Email support", included: false },
      { text: "Webhook deduplication", included: false },
    ],
    cta: "Get started free",
    ctaHref: "/signup",
  },
  {
    name: "Starter",
    subtitle: "For growing businesses",
    monthlyPrice: 999,
    annualPrice: 799,
    featured: true,
    badge: "Most popular",
    features: [
      { text: "5,000 executions/month", included: true },
      { text: "Unlimited active workflows", included: true },
      { text: "All 30+ integrations", included: true },
      { text: "Execution history", included: true },
      { text: "Priority email support", included: true },
      { text: "Webhook deduplication", included: true },
    ],
    cta: "Start free trial",
    ctaHref: "/signup",
  },
  {
    name: "Growth",
    subtitle: "For scaling teams",
    monthlyPrice: 2999,
    annualPrice: 2399,
    featured: false,
    features: [
      { text: "Unlimited executions", included: true },
      { text: "Unlimited active workflows", included: true },
      { text: "All 30+ integrations", included: true },
      { text: "Full execution history", included: true },
      { text: "Dedicated support", included: true },
      { text: "Webhook deduplication", included: true },
      { text: "Custom integrations on request", included: true },
    ],
    cta: "Start free trial",
    ctaHref: "/signup",
  },
]

export function Pricing() {
  const [billing, setBilling] = useState<BillingCycle>("monthly")
  const labelRef = useFadeUp()
  const headlineRef = useFadeUp()
  const subRef = useFadeUp()

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <p
            ref={labelRef as React.RefObject<HTMLParagraphElement>}
            className="fade-up text-xs font-semibold uppercase tracking-widest text-primary mb-4"
          >
            Pricing
          </p>
          <h2
            ref={headlineRef as React.RefObject<HTMLHeadingElement>}
            className="fade-up text-4xl md:text-5xl font-bold tracking-tight text-foreground"
          >
            Simple, transparent pricing
          </h2>
          <p
            ref={subRef as React.RefObject<HTMLParagraphElement>}
            className="fade-up mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            No per-task fees. No surprise bills. One flat monthly price.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-border p-1 bg-white">
            <button
              id="pricing-toggle-monthly"
              onClick={() => setBilling("monthly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                billing === "monthly"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              id="pricing-toggle-annual"
              onClick={() => setBilling("annual")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                billing === "annual"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annual
              <span
                className={`text-xs rounded-full px-2 py-0.5 ${
                  billing === "annual"
                    ? "bg-white/20 text-primary-foreground"
                    : "bg-green-100 text-green-700"
                }`}
              >
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan, i) => (
            <PricingCard key={plan.name} plan={plan} billing={billing} delay={i * 100} />
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          All prices in INR. GST applicable. Cancel anytime.
        </p>
      </div>
    </section>
  )
}

function PricingCard({
  plan,
  billing,
  delay,
}: {
  plan: (typeof PLANS)[number]
  billing: BillingCycle
  delay: number
}) {
  const ref = useFadeUp()
  const price = billing === "annual" ? plan.annualPrice : plan.monthlyPrice

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`fade-up flex flex-col rounded-2xl p-8 bg-white ${
        plan.featured
          ? "border-2 border-primary shadow-xl scale-[1.02]"
          : "border border-border"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Plan name + badge */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
        {plan.badge && (
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
            {plan.badge}
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-6">{plan.subtitle}</p>

      {/* Price */}
      <div className="mb-8">
        {price === 0 ? (
          <div className="flex items-end gap-1">
            <span className="text-4xl font-bold text-foreground">Free</span>
          </div>
        ) : (
          <div className="flex items-end gap-1">
            <span className="text-2xl font-medium text-muted-foreground">
              &#8377;
            </span>
            <span className="text-4xl font-bold text-foreground">
              {price.toLocaleString("en-IN")}
            </span>
            <span className="text-muted-foreground text-sm mb-1">/mo</span>
          </div>
        )}
        {billing === "annual" && price > 0 && (
          <p className="text-xs text-green-600 mt-1 font-medium">
            Billed annually — save &#8377;{((plan.monthlyPrice - plan.annualPrice) * 12).toLocaleString("en-IN")}/yr
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="flex flex-col gap-3 mb-8 flex-1">
        {plan.features.map((feature) => (
          <li key={feature.text} className="flex items-start gap-3">
            {feature.included ? (
              <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
            ) : (
              <Minus className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
            )}
            <span
              className={`text-sm ${
                feature.included
                  ? "text-foreground"
                  : "text-muted-foreground/60"
              }`}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={plan.ctaHref}
        id={`pricing-cta-${plan.name.toLowerCase()}`}
        className={`w-full py-3 rounded-lg text-sm font-semibold text-center transition-colors ${
          plan.featured
            ? "bg-primary text-primary-foreground hover:bg-orange-600"
            : "border border-border text-foreground hover:bg-accent"
        }`}
      >
        {plan.cta}
      </Link>
    </div>
  )
}
