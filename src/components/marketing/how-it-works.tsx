"use client"

import Link from "next/link"
import { Link as LinkIcon, GitBranch, PlayCircle } from "lucide-react"
import { useFadeUp } from "./use-fade-up"
import type { LucideIcon } from "lucide-react"

const STEPS: {
  number: string
  icon: LucideIcon
  title: string
  description: string
}[] = [
  {
    number: "01",
    icon: LinkIcon,
    title: "Connect your apps",
    description:
      "Add credentials for Razorpay, Gmail, WhatsApp and any other apps you use. OAuth2 login — no API keys to copy and paste.",
  },
  {
    number: "02",
    icon: GitBranch,
    title: "Build your workflow",
    description:
      "Drag nodes onto the canvas and connect them. Set conditions, filters, and transformations without writing code.",
  },
  {
    number: "03",
    icon: PlayCircle,
    title: "Go live instantly",
    description:
      "Activate your workflow. It runs automatically on triggers — payment received, message sent, form submitted.",
  },
]

export function HowItWorks() {
  const labelRef = useFadeUp()
  const headlineRef = useFadeUp()
  const stepsRef = useFadeUp()
  const ctaRef = useFadeUp()

  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <p
            ref={labelRef as React.RefObject<HTMLParagraphElement>}
            className="fade-up text-xs font-semibold uppercase tracking-widest text-primary mb-4"
          >
            Get started in minutes
          </p>
          <h2
            ref={headlineRef as React.RefObject<HTMLHeadingElement>}
            className="fade-up text-4xl md:text-5xl font-bold tracking-tight text-foreground"
          >
            Three steps to automate your business
          </h2>
        </div>

        {/* Steps */}
        <div
          ref={stepsRef as React.RefObject<HTMLDivElement>}
          className="fade-up relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0"
        >
          {/* Horizontal dashed connector — desktop only */}
          <div className="pointer-events-none absolute top-8 left-[20%] right-[20%] hidden md:block">
            <div className="h-px border-t-2 border-dashed border-primary/20" />
          </div>

          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center px-4"
              >
                {/* Step number background */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[80px] font-bold text-primary/6 leading-none select-none pointer-events-none z-0">
                  {step.number}
                </div>

                {/* Icon circle */}
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 mb-6">
                  <Icon className="h-7 w-7" />
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-3 relative z-10">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed relative z-10">
                  {step.description}
                </p>

                {/* Mobile vertical connector */}
                {i < STEPS.length - 1 && (
                  <div className="md:hidden mt-8 mb-2 flex justify-center">
                    <div className="h-8 border-l-2 border-dashed border-primary/20" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div
          ref={ctaRef as React.RefObject<HTMLDivElement>}
          className="fade-up mt-16 text-center"
        >
          <Link
            href="/signup"
            id="how-it-works-cta"
            className="h-12 px-8 rounded-lg bg-primary text-primary-foreground text-base font-medium hover:bg-orange-600 transition-colors inline-flex items-center justify-center"
          >
            Start building for free
          </Link>
        </div>
      </div>
    </section>
  )
}
