"use client";

import React, { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";

const Circle = forwardRef<
    HTMLDivElement,
    { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
                className,
            )}
        >
            {children}
        </div>
    );
});

Circle.displayName = "Circle";

export function HeroBeam() {
    const containerRef = useRef<HTMLDivElement>(null);
    const div1Ref = useRef<HTMLDivElement>(null);
    const div2Ref = useRef<HTMLDivElement>(null);
    const div3Ref = useRef<HTMLDivElement>(null);
    const div4Ref = useRef<HTMLDivElement>(null);
    const div5Ref = useRef<HTMLDivElement>(null);
    const div6Ref = useRef<HTMLDivElement>(null);
    const div7Ref = useRef<HTMLDivElement>(null);

    // Logos as images from public/logos
    const GoogleLogo = () => <img src="/logos/google.svg" alt="Google" className="w-full h-full" />;
    const GithubLogo = () => <img src="/logos/github.svg" alt="GitHub" className="w-full h-full" />;
    const TelegramLogo = () => <img src="/logos/telegram.svg" alt="Telegram" className="w-full h-full" />;
    const OpenAILogo = () => <img src="/logos/openai.svg" alt="OpenAI" className="w-full h-full" />;
    const NotionLogo = () => <img src="/logos/notion.svg" alt="Notion" className="w-full h-full" />; // Assuming notion.svg exists or similar
    const N8nLogo = () => <img src="/logos/logo.svg" alt="Nodebase" className="w-full h-full" />;
    const UserIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-black"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
        </svg>
    );


    return (
        <div
            className="relative flex h-[500px] w-full items-center justify-center overflow-hidden rounded-lg bg-transparent p-10 md:shadow-xl"
            ref={containerRef}
        >
            <div className="flex size-full flex-col max-w-lg max-h-[200px] items-stretch justify-between gap-10">
                <div className="flex flex-row items-center justify-between">
                    <Circle ref={div1Ref}>
                        <GoogleLogo />
                    </Circle>
                    <Circle ref={div5Ref}>
                        <GithubLogo />
                    </Circle>
                </div>
                <div className="flex flex-row items-center justify-between">
                    <Circle ref={div2Ref}>
                        <TelegramLogo />
                    </Circle>
                    <Circle ref={div4Ref} className="size-16">
                        <N8nLogo />
                    </Circle>
                    <Circle ref={div6Ref}>
                        <OpenAILogo />
                    </Circle>
                </div>
                <div className="flex flex-row items-center justify-between">
                    <Circle ref={div3Ref}>
                        <img src="/logos/slack.svg" alt="Slack" className="w-full h-full" />
                    </Circle>
                    <Circle ref={div7Ref}>
                        <UserIcon />
                    </Circle>
                </div>
            </div>

            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div1Ref}
                toRef={div4Ref}
                duration={6}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div2Ref}
                toRef={div4Ref}
                duration={4}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div3Ref}
                toRef={div4Ref}
                duration={5}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div4Ref}
                toRef={div6Ref}
                duration={7}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div6Ref}
                toRef={div7Ref}
                duration={3}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div4Ref}
                toRef={div5Ref}
                curvature={-75}
                endYOffset={-10}
                duration={5}
            />
        </div>
    );
}
