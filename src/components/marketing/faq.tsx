"use client"

import { useFadeUp } from "./use-fade-up"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQ_ITEMS = [
  {
    q: "Is Nodebase free to get started?",
    a: "Yes. Our free plan includes 50 workflow executions per month, 5 active workflows, and access to all 30+ integrations. No credit card required.",
  },
  {
    q: "How is Nodebase different from Zapier?",
    a: "Nodebase is built specifically for Indian businesses. We have native support for Razorpay, Cashfree, WhatsApp Business, MSG91, and Shiprocket — integrations that Zapier doesn't offer. We also price in INR with flat monthly plans, not per-task fees.",
  },
  {
    q: "Do I need to know how to code?",
    a: "No. Nodebase is a no-code platform. You build workflows by dragging nodes onto a canvas and connecting them. If you can use a spreadsheet, you can use Nodebase.",
  },
  {
    q: "How does Nodebase handle security?",
    a: "All credentials are encrypted with AES-256 before storage. We use OAuth2 for Google services so your passwords never touch our servers. Webhook secrets for payment gateways are encrypted at rest.",
  },
  {
    q: "What happens if a workflow fails?",
    a: "Failed workflows appear in your execution history with a full error message and the exact node that failed. You can inspect the input and output of every node to debug issues quickly.",
  },
  {
    q: "Can I connect Razorpay to WhatsApp?",
    a: "Yes — this is one of the most popular workflows on Nodebase. When a payment is received via Razorpay, automatically send a WhatsApp message to the customer with their receipt. Set it up in under 5 minutes.",
  },
  {
    q: "Is there a limit on the number of integrations I can use?",
    a: "No. All plans have access to all 30+ integrations. The only difference between plans is the number of workflow executions and active workflows.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes. Cancel from your billing portal at any time. Your plan stays active until the end of the billing period. No cancellation fees.",
  },
]

export function FAQ() {
  const labelRef = useFadeUp()
  const headlineRef = useFadeUp()
  const accordionRef = useFadeUp()

  return (
    <section id="faq" className="py-24 px-6 bg-gray-50/50">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <p
            ref={labelRef as React.RefObject<HTMLParagraphElement>}
            className="fade-up text-xs font-semibold uppercase tracking-widest text-primary mb-4"
          >
            FAQ
          </p>
          <h2
            ref={headlineRef as React.RefObject<HTMLHeadingElement>}
            className="fade-up text-4xl md:text-5xl font-bold tracking-tight text-foreground"
          >
            Common questions
          </h2>
        </div>

        <div
          ref={accordionRef as React.RefObject<HTMLDivElement>}
          className="fade-up"
        >
          <Accordion type="single" collapsible className="bg-white rounded-2xl border border-border overflow-hidden divide-y divide-border">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`item-${i}`}
                className="border-0"
              >
                <AccordionTrigger
                  id={`faq-item-${i}`}
                  className="px-6 py-5 text-sm font-semibold text-foreground hover:no-underline hover:bg-gray-50/80 transition-colors text-left"
                >
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
