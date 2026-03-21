import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Nav } from "@/components/marketing/nav"
import { Hero } from "@/components/marketing/hero"
import { LogosBar } from "@/components/marketing/logos-bar"
import { ProblemSolution } from "@/components/marketing/problem-solution"
import { Features } from "@/components/marketing/features"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { Integrations } from "@/components/marketing/integrations"
import { Pricing } from "@/components/marketing/pricing"
import { FAQ } from "@/components/marketing/faq"
import { Footer } from "@/components/marketing/footer"

export const metadata = {
  title: "Nodebase — Automate anything. Built for Indian businesses.",
  description:
    "Connect Razorpay, WhatsApp, Gmail, Google Sheets and 30+ apps without writing code. Native support for Indian payment gateways and business tools.",
}

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session) {
    redirect("/workflows")
  }

  return (
    <main className="min-h-screen bg-white">
      <Nav />
      <Hero />
      <LogosBar />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      <Integrations />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  )
}
