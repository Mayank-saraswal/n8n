"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"

const NAV_LINKS = [
  { label: "Integrations", href: "#integrations" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/60 bg-white/90 backdrop-blur-sm shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 group">
          <Image
            src="/logos/logo.svg"
            alt="Nodebase"
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <span className="text-lg font-bold text-foreground tracking-tight">
            Nodebase
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-accent"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="h-9 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-orange-600 inline-flex items-center"
          >
            Start free
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          id="nav-mobile-menu-btn"
          className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-border bg-white px-6 pb-6 md:hidden">
          <div className="flex flex-col gap-1 pt-4">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="py-3 text-base font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg px-2"
              >
                {l.label}
              </Link>
            ))}
            <div className="border-t border-border my-2" />
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="py-3 text-base font-medium text-muted-foreground px-2"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="mt-1 rounded-lg bg-primary py-3 text-center text-sm font-medium text-primary-foreground hover:bg-orange-600 transition-colors"
            >
              Start free
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
