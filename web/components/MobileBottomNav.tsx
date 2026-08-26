"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/my-registration", label: "My Reg." },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="mobile-bottom-nav" aria-label="주요 메뉴 (모바일)">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="mnav-btn"
            aria-current={active ? "page" : undefined}
            data-active={active || undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
