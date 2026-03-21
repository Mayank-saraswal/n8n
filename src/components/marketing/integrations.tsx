"use client"

import { useState } from "react"
import Image from "next/image"
import { useFadeUp } from "./use-fade-up"

type Category = "All" | "Payments" | "Communication" | "Productivity" | "Logistics" | "AI"

const CATEGORIES: Category[] = [
  "All",
  "Payments",
  "Communication",
  "Productivity",
  "Logistics",
  "AI",
]

// Only logos confirmed to exist in /public/logos/
const INTEGRATIONS: {
  name: string
  logo: string | null
  category: Exclude<Category, "All">
}[] = [
  { name: "Razorpay", logo: "/logos/razorpay.svg", category: "Payments" },
  { name: "Stripe", logo: "/logos/stripe.svg", category: "Payments" },
  { name: "WhatsApp", logo: "/logos/whatsapp.svg", category: "Communication" },
  { name: "Gmail", logo: "/logos/gmail.svg", category: "Communication" },
  { name: "Slack", logo: "/logos/slack.svg", category: "Communication" },
  { name: "Telegram", logo: "/logos/telegram.svg", category: "Communication" },
  { name: "Discord", logo: "/logos/discord.svg", category: "Communication" },
  { name: "MSG91", logo: "/logos/msg91.svg", category: "Communication" },
  { name: "Google Sheets", logo: "/logos/googlesheets.svg", category: "Productivity" },
  { name: "Google Drive", logo: "/logos/google-drive.svg", category: "Productivity" },
  { name: "Google Forms", logo: "/logos/googleform.svg", category: "Productivity" },
  { name: "Notion", logo: "/logos/notion.svg", category: "Productivity" },
  { name: "Zoho CRM", logo: "/logos/zoho.svg", category: "Productivity" },
  { name: "Freshdesk", logo: "/logos/freshdesk.svg", category: "Productivity" },
  { name: "GitHub", logo: "/logos/github.svg", category: "Productivity" },
  { name: "Shiprocket", logo: "/logos/shiprocket.svg", category: "Logistics" },
  { name: "OpenAI", logo: "/logos/openai.svg", category: "AI" },
  { name: "Anthropic", logo: "/logos/anthropic.svg", category: "AI" },
  { name: "Gemini", logo: "/logos/gemini.svg", category: "AI" },
  { name: "Groq", logo: "/logos/groq.svg", category: "AI" },
  { name: "DeepSeek", logo: "/logos/deepseek.svg", category: "AI" },
  { name: "Perplexity", logo: "/logos/perplexity.svg", category: "AI" },
  { name: "xAI", logo: "/logos/xai.svg", category: "AI" },
]

export function Integrations() {
  const [activeCategory, setActiveCategory] = useState<Category>("All")
  const labelRef = useFadeUp()
  const headlineRef = useFadeUp()
  const subRef = useFadeUp()
  const gridRef = useFadeUp()

  const filtered =
    activeCategory === "All"
      ? INTEGRATIONS
      : INTEGRATIONS.filter((i) => i.category === activeCategory)

  return (
    <section id="integrations" className="py-24 bg-gray-50/50 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <p
            ref={labelRef as React.RefObject<HTMLParagraphElement>}
            className="fade-up text-xs font-semibold uppercase tracking-widest text-primary mb-4"
          >
            Integrations
          </p>
          <h2
            ref={headlineRef as React.RefObject<HTMLHeadingElement>}
            className="fade-up text-4xl md:text-5xl font-bold tracking-tight text-foreground"
          >
            Connect the tools Indian businesses use
          </h2>
          <p
            ref={subRef as React.RefObject<HTMLParagraphElement>}
            className="fade-up mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Native support for payment gateways, logistics, communication, and
            productivity tools.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`integrations-tab-${cat.toLowerCase()}`}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-white border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div
          ref={gridRef as React.RefObject<HTMLDivElement>}
          className="fade-up grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {filtered.map((integration) => (
            <IntegrationCard key={integration.name} integration={integration} />
          ))}
        </div>

        <p className="text-muted-foreground text-sm mt-8 text-center">
          Don&apos;t see your tool? We&apos;re adding new integrations weekly.
        </p>
      </div>
    </section>
  )
}

function IntegrationCard({
  integration,
}: {
  integration: (typeof INTEGRATIONS)[number]
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 flex flex-col items-center text-center gap-2 group">
      <div className="h-10 w-10 flex items-center justify-center">
        {integration.logo ? (
          <Image
            src={integration.logo}
            alt={integration.name}
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
        ) : (
          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
            <span className="text-sm font-bold text-muted-foreground">
              {integration.name[0]}
            </span>
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-foreground">{integration.name}</p>
      <span className="text-xs text-muted-foreground">{integration.category}</span>
    </div>
  )
}
