"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useTranslations } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

const PUBLIC_LINKS = [
  { href: "/", key: "home" as const },
  { href: "/agents", key: "agents" as const },
  { href: "/tournament", key: "tournament" as const },
  { href: "/leaderboard", key: "leaderboard" as const },
  { href: "/marketplace", key: "marketplace" as const },
  { href: "/stack-builder", key: "stackBuilder" as const },
];

const LAB_LINKS = [
  { href: "/memory", key: "memory" as const },
  { href: "/components", key: "components" as const },
  { href: "/workflows", key: "workflows" as const },
  { href: "/account", key: "account" as const },
  { href: "/admin", key: "admin" as const },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [labOpen, setLabOpen] = useState(false);
  const t = useTranslations();

  const labActive = LAB_LINKS.some((l) => isActive(pathname, l.href));

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030303]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-sm font-medium tracking-widest"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/40 bg-gradient-to-br from-cyan-500/20 to-violet-600/20 text-xs text-cyan-300">
            AI
          </span>
          <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
            ARENA
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {PUBLIC_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition",
                isActive(pathname, link.href)
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white",
              )}
            >
              {t.nav[link.key]}
            </Link>
          ))}

          <div className="relative">
            <button
              type="button"
              onClick={() => setLabOpen((o) => !o)}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition",
                labActive
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white",
              )}
            >
              {t.nav.lab}
              <ChevronDown className={cn("size-4 transition", labOpen && "rotate-180")} />
            </button>
            {labOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40"
                  aria-label="Close menu"
                  onClick={() => setLabOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[11rem] rounded-xl border border-white/10 bg-[#0a0a0a] py-1 shadow-xl">
                  {LAB_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setLabOpen(false)}
                      className={cn(
                        "block px-4 py-2 text-sm transition",
                        isActive(pathname, link.href)
                          ? "bg-violet-500/15 text-violet-100"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      {t.nav[link.key]}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          <LanguageSwitcher className="ml-2" />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher compact />
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10"
            onClick={() => setOpen((o) => !o)}
            aria-label={t.nav.toggleMenu}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-white/10 px-4 py-3 md:hidden">
          <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            {t.nav.home}
          </p>
          <div className="flex flex-col gap-1">
            {PUBLIC_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                {t.nav[link.key]}
              </Link>
            ))}
          </div>
          <p className="mb-2 mt-4 px-3 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            {t.nav.lab}
          </p>
          <div className="flex flex-col gap-1">
            {LAB_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                {t.nav[link.key]}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
