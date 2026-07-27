import Image from "next/image";
import Link from "next/link";
import { MobileNavigation } from "@/components/MobileNavigation";

const navItems = [
  { href: "/chat", label: "Student" },
  { href: "/moodle-embed-generator", label: "Moodle/LMS" },
  { href: "/support-handoff-center", label: "Support" },
  { href: "/knowledge-base-review", label: "Knowledge Base" },
  { href: "/provider-console", label: "AI Providers" },
  { href: "/phase-2-command-center", label: "Governance" },
  { href: "/deployment-wizard", label: "Deployment" },
  { href: "/reports", label: "Reports" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 lg:py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            alt="COSTAATT logo"
            className="h-12 w-auto"
            height={53}
            src="/costaatt-logo.png"
            width={120}
          />
          <div className="min-w-0">
            <p className="font-bold text-costaatt-navy">FYEC100 AI Support</p>
            <p className="hidden text-sm font-medium text-slate-600 sm:block">
              AI Academic Support Assistant
            </p>
          </div>
        </Link>
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 text-sm font-semibold text-slate-700 lg:flex"
        >
          {navItems.map((item) => (
            <Link
              className="rounded-md px-3 py-2 hover:bg-slate-100 hover:text-costaatt-blue"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <MobileNavigation items={navItems} />
      </div>
    </header>
  );
}
