"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import { useAdminAuth } from "@/lib/auth-context";
import { useDevicePreview } from "@/lib/device-preview-context";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/my-registration", label: "My Registration" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const { currentAdmin, logout } = useAdminAuth();
  const { isPreview, toggle: togglePreview } = useDevicePreview();
  const onAdminRoute = pathname.startsWith("/admin");

  async function handleLogout() {
    await logout();
    router.push("/");
  }

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
      {!onAdminRoute && (
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
      )}
      <div className="topbar-controls">
        {onAdminRoute && currentAdmin ? (
          <>
            <span className="faint">{currentAdmin.name}님</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => void handleLogout()}>
              로그아웃
            </button>
          </>
        ) : (
          <Link href="/admin/dashboard" className="btn btn-ghost btn-sm" aria-current={onAdminRoute ? "page" : undefined}>
            Admin
          </Link>
        )}
        <button
          type="button"
          className="btn btn-ghost btn-sm preview-toggle"
          onClick={togglePreview}
          aria-pressed={isPreview}
        >
          {isPreview ? "데스크톱 화면으로 보기" : "모바일 화면 미리보기"}
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={toggleTheme}
          aria-pressed={isDark}
          aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
        >
          {isDark ? "☀︎" : "☾"}
        </button>
      </div>
    </header>
  );
}
