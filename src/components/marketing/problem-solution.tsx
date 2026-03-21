"use client"

import { X, Check } from "lucide-react"
import { useFadeUp } from "./use-fade-up"

const PROBLEMS = [
  {
    title: "Zapier doesn't support Razorpay natively",
    description:
      "You're stuck using complex workarounds for India's most popular payment gateway.",
  },
  {
    title: "n8n requires a developer to set up",
    description:
      "Self-hosting, Docker, reverse proxies — just to send a WhatsApp message.",
  },
  {
    title: "Expensive per-task pricing",
    description:
      "Zapier charges per task. Send 10,000 WhatsApp messages? Pay for 10,000 tasks.",
  },
  {
    title: "No Indian payment gateway support",
    description:
      "Cashfree, PayU, Razorpay — none of them work out of the box.",
  },
]

const SOLUTIONS = [
  {
    title: "Native Razorpay + Cashfree integration",
    description:
      "First-class support for Indian payment gateways. No workarounds needed.",
  },
  {
    title: "No code, no server, no DevOps",
    description:
      "Sign up, connect your apps, build your workflow. Live in minutes.",
  },
  {
    title: "Flat monthly pricing",
    description:
      "One price, unlimited workflows. Pay for the plan, not per execution count.",
  },
  {
    title: "Built for Indian business workflows",
    description:
      "WhatsApp Business, MSG91, Shiprocket, Delhivery — all in one platform.",
  },
]

export function ProblemSolution() {
  const labelRef = useFadeUp()
  const headlineRef = useFadeUp()
  const gridRef = useFadeUp()

  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p
            ref={labelRef as React.RefObject<HTMLParagraphElement>}
            className="fade-up text-xs font-semibold uppercase tracking-widest text-primary mb-4"
          >
            Why Nodebase
          </p>
          <h2
            ref={headlineRef as React.RefObject<HTMLHeadingElement>}
            className="fade-up text-4xl md:text-5xl font-bold tracking-tight text-foreground"
          >
            Stop paying for tools that{" "}
            <br className="hidden md:block" />
            don&apos;t understand India
          </h2>
        </div>

        <div
          ref={gridRef as React.RefObject<HTMLDivElement>}
          className="fade-up grid md:grid-cols-2 gap-8 md:gap-16 items-start"
        >
          {/* Problems */}
          <div className="rounded-2xl border border-red-100 bg-red-50/30 p-8">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              The old way
            </h3>
            <p className="text-sm text-muted-foreground mb-8">
              What you deal with using Zapier, n8n, or Make
            </p>
            <div className="flex flex-col gap-6">
              {PROBLEMS.map((item) => (
                <div key={item.title} className="flex gap-3 items-start">
                  <div className="shrink-0 mt-0.5">
                    <X className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-0.5">
                      {item.title}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div className="rounded-2xl border border-green-100 bg-green-50/30 p-8">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              The Nodebase way
            </h3>
            <p className="text-sm text-muted-foreground mb-8">
              Purpose-built for how Indian businesses operate
            </p>
            <div className="flex flex-col gap-6">
              {SOLUTIONS.map((item) => (
                <div key={item.title} className="flex gap-3 items-start">
                  <div className="shrink-0 mt-0.5">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-0.5">
                      {item.title}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
