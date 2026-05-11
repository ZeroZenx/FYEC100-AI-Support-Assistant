import Image from "next/image";
import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "Chat" },
  { href: "/about", label: "About" },
  { href: "/roadmap", label: "Roadmap" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            alt="COSTAATT logo"
            className="h-12 w-auto"
            height={53}
            src="/costaatt-logo.png"
            width={120}
          />
          <div>
            <p className="font-bold text-costaatt-navy">FYEC100 AI Support</p>
            <p className="text-sm font-medium text-slate-600">
              AI Academic Support Assistant
            </p>
          </div>
        </Link>
        <nav className="flex flex-wrap gap-2 text-sm font-medium text-slate-700">
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
      </div>
    </header>
  );
}
