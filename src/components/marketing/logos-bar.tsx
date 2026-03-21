"use client"

import Image from "next/image"
import { useFadeUp } from "./use-fade-up"

// Logos confirmed in /public/logos/
const LOGOS = [
  { name: "Razorpay", src: "/logos/razorpay.svg" },
  { name: "WhatsApp", src: "/logos/whatsapp.svg" },
  { name: "Google", src: "/logos/google.svg" },
  { name: "Gmail", src: "/logos/gmail.svg" },
  { name: "Notion", src: "/logos/notion.svg" },
  { name: "Stripe", src: "/logos/stripe.svg" },
  { name: "Zoho", src: "/logos/zoho.svg" },
  { name: "MSG91", src: "/logos/msg91.svg" },
  { name: "Shiprocket", src: "/logos/shiprocket.svg" },
  { name: "Freshdesk", src: "/logos/freshdesk.svg" },
]

export function LogosBar() {
  const ref = useFadeUp()
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="fade-up py-12 border-y border-border bg-gray-50/50"
    >
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground text-center mb-8 font-semibold">
          Trusted integrations
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {LOGOS.map((logo) => (
            <div
              key={logo.name}
              className="opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-200 flex items-center justify-center"
            >
              <Image
                src={logo.src}
                alt={logo.name}
                width={80}
                height={24}
                className="h-6 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
