"use client";

import React, { useRef } from "react";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { LayoutGroup } from "motion/react";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Spotlight } from "@/components/ui/spotlight";
import { HeroBeam } from "@/components/hero-beam";

export function LandingPage({ isAuthenticated }: { isAuthenticated: boolean }) {
    const navItems = [
        { name: "Home", link: "#" },
        { name: "Features", link: "#features" },
        { name: "Pricing", link: "#pricing" },
    ];

    return (
        <div className="relative w-full overflow-hidden bg-black">
            <Spotlight
                className="-top-40 left-0 md:left-60 md:-top-20"
                fill="white"
            />
            <FloatingNav navItems={navItems} isAuthenticated={isAuthenticated} />

            <main className="flex flex-col items-center justify-center w-full px-4 pt-40 pb-20">
                {/* Hero Headline */}
                <div className="h-[20rem] flex justify-center items-center w-full">
                    <LayoutTextFlip
                        text="Build"
                        words={["Workflows", "Automations", "Integrations", "Everything"]}
                        className="text-4xl md:text-7xl font-bold dark:text-white text-primary"
                    />
                </div>

                {/* Gradient Description */}
                <p className="mt-8 text-xl text-center max-w-2xl mx-auto bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 font-bold">
                    Build powerful workflows with ease. Connect your favorite apps and automate your business processes in minutes, not days.
                </p>
                {/* Text Hover Effect */}
                <div className="h-[20rem] flex items-center justify-center w-full ">
                    <TextHoverEffect text="NODEBASE" />
                </div>

                {/* Animated Beam Section */}
                <div className="w-full max-w-6xl mx-auto mt-20 p-4 border rounded-3xl bg-neutral-900/50 backdrop-blur-sm border-neutral-800 relative flex flex-col items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
                    <div className="relative z-10 w-full py-10">
                        <HeroBeam />
                    </div>
                </div>


                {/* Pricing Section */}
                <section id="pricing" className="mt-40 w-full max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 dark:text-white text-black">Simple Pricing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <PricingCard title="Starter" price="$0" features={["5 Workflows", "100 Executions/mo", "Community Support"]} />
                        <PricingCard title="Pro" price="$20" features={["Unlimited Workflows", "10,000 Executions/mo", "Priority Support"]} featured />
                        <PricingCard title="Enterprise" price="Custom" features={["Unlimited Everything", "Dedicated Deployment", "SLA"]} />
                    </div>
                </section>

            </main>
        </div>
    );
}

function PricingCard({ title, price, features, featured = false }: { title: string; price: string; features: string[], featured?: boolean }) {
    return (
        <CardSpotlight className="h-96 w-full relative z-20 cursor-pointer">
            <div className="relative z-20 h-full flex flex-col items-start p-6">
                <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
                <div className="text-4xl font-bold text-white mb-6">{price}<span className="text-lg font-normal text-neutral-400">/mo</span></div>
                <ul className="space-y-2 mb-8 flex-1">
                    {features.map((feature, idx) => (
                        <li key={idx} className="text-neutral-300 flex items-center">
                            <span className="mr-2 text-green-500">✓</span> {feature}
                        </li>
                    ))}
                </ul>
                <button className={`w-full py-2 rounded-lg font-semibold ${featured ? 'bg-white text-black' : 'bg-neutral-800 text-white border border-neutral-700'}`}>
                    Get Started
                </button>
            </div>
        </CardSpotlight>
    )
}
