"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavigationItem = {
  href: string;
  label: string;
};

export function MobileNavigation({ items }: { items: NavigationItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        aria-controls="mobile-navigation"
        aria-expanded={open}
        className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-costaatt-navy"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span aria-hidden="true" className="flex w-4 flex-col gap-1">
          <span className="h-0.5 w-full bg-current" />
          <span className="h-0.5 w-full bg-current" />
          <span className="h-0.5 w-full bg-current" />
        </span>
        Menu
      </button>
      {open ? (
        <nav
          aria-label="Mobile navigation"
          className="absolute inset-x-0 top-full border-b border-slate-200 bg-white p-4 shadow-lg"
          id="mobile-navigation"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-3 py-3 text-sm font-semibold ${
                    active
                      ? "bg-blue-50 text-costaatt-blue"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  href={item.href}
                  key={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
