"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/participants", label: "Participants" },
  { href: "/admin/team", label: "Team" },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="tabbar" role="tablist" aria-label="운영자 메뉴">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link key={tab.href} href={tab.href} role="tab" aria-selected={active} className="tab brand-font">
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
