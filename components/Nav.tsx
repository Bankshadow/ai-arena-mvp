"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useTranslations } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", key: "home" as const },
  { href: "/challenge/executive-summary-battle", key: "challenge" as const },
  { href: "/agents", key: "agents" as const },
  { href: "/tournament", key: "tournament" as const },
  { href: "/battle", key: "battle" as const },
  { href: "/battles", key: "battles" as const },
  { href: "/arena", key: "arena" as const },
  { href: "/leaderboard", key: "leaderboard" as const },
  { href: "/workflows", key: "workflows" as const },
  { href: "/enterprise", key: "enterprise" as const },
  { href: "/admin", key: "admin" as const },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const t = useTranslations();

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
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                {t.nav[link.key]}
              </Link>
            );
          })}
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
          <div className="flex flex-col gap-1">
            {LINKS.map((link) => (
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
