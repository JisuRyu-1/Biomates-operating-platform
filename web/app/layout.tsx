import type { Metadata } from "next";
import localFont from "next/font/local";
import { Orbitron } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/lib/data-context";
import { ThemeProvider } from "@/lib/theme-context";
import { ToastProvider } from "@/components/Toast";
import { SiteHeader } from "@/components/SiteHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";

const pretendard = localFont({
  src: [
    { path: "../public/fonts/Pretendard-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Pretendard-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/Pretendard-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/Pretendard-Bold.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/Pretendard-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-pretendard",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-orbitron",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Biomates Event Operations Platform",
  description: "Biomates 행사 신청, 안내, Follow-up을 한 곳에서 관리하는 이벤트 운영 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${orbitron.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <DataProvider>
              <div className="page">
                <SiteHeader />
                <main className="app-shell">{children}</main>
              </div>
              <MobileBottomNav />
            </DataProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
