import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { DocsShell } from "@/components/docs/docs-shell";

const syne = Syne({
  variable: "--font-docs-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-docs-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Nodebase Docs",
    default: "Nodebase Docs",
  },
  description: "Documentation for Nodebase — visual workflow automation",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${syne.variable} ${dmSans.variable}`}>
      <style>{`
        /* Docs-scoped typography */
        #docs-content h1,
        #docs-content h2,
        #docs-content h3,
        #docs-content h4 {
          font-family: var(--font-docs-heading), sans-serif;
          scroll-margin-top: 80px;
        }
        #docs-content {
          font-family: var(--font-docs-body), sans-serif;
        }
      `}</style>
      <DocsShell>{children}</DocsShell>
    </div>
  );
}
