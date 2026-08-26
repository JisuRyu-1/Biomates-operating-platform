"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/theme-context";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/my-registration", label: "My Registration" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <Link href="/" className="brand">
        <Image
          className="brand-mark-light header-logo"
          src="/brand/biomates-logo-dark-navy.png"
          alt="Biomates"
          width={2038}
          height={306}
          priority
        />
        <Image
          className="brand-mark-dark header-logo"
          src="/brand/biomates-logo-white.png"
          alt="Biomates"
          width={2038}
          height={306}
          priority
        />
      </Link>
      <nav className="topbar-nav" aria-label="주요 메뉴">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="nav-link" aria-current={active ? "page" : undefined}>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        className="icon-btn"
        onClick={toggleTheme}
        aria-pressed={isDark}
        aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      >
        {isDark ? "☀︎" : "☾"}
      </button>
    </header>
  );
}
