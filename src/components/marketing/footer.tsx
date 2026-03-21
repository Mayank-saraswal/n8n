import Link from "next/link"
import Image from "next/image"
import { Github, Twitter, Linkedin } from "lucide-react"

const PRODUCT_LINKS = [
  { label: "Integrations", href: "#integrations" },
  { label: "Pricing", href: "#pricing" },
  { label: "Changelog", href: "/changelog" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Status", href: "/status" },
]

const COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
]

export function Footer() {
  return (
    <footer className="border-t border-border py-16 bg-white px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
          {/* Column 1 — Brand */}
          <div>
            <Link href="/" className="flex items-center gap-1.5 mb-4">
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
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Automation built for Indian businesses.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://github.com/nodebase"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/nodebase"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/company/nodebase"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2 — Product */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Product
            </h4>
            <ul className="flex flex-col gap-3">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Company */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Company
            </h4>
            <ul className="flex flex-col gap-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Contact
            </h4>
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">Built in India</p>
              <a
                href="mailto:support@nodebase.tech"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                support@nodebase.tech
              </a>
              <p className="text-sm text-muted-foreground">
                Jaipur, Rajasthan
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            2025 Nodebase. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">Made with care in India</p>
        </div>
      </div>
    </footer>
  )
}
