import type { Metadata } from "next";
import localFont from "next/font/local";
import { Orbitron } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/lib/data-context";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { ToastProvider } from "@/components/Toast";
import { SiteHeader } from "@/components/SiteHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { DevicePreviewProvider } from "@/lib/device-preview-context";
import { DevicePreviewFrame } from "@/components/DevicePreviewFrame";

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

const SITE_TITLE = "Biomates Event Operations Platform";
const SITE_DESCRIPTION = "Biomates 행사 신청, 안내, Follow-up을 한 곳에서 관리하는 이벤트 운영 플랫폼";
const SITE_URL = "https://biomates.org";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Biomates",
    images: [{ url: "/brand/biomates-og-image.png", width: 2608, height: 2608 }],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/brand/biomates-og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${orbitron.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <DataProvider>
                <DevicePreviewProvider>
                  <div className="page">
                    <SiteHeader />
                    <main className="app-shell">
                      <DevicePreviewFrame>{children}</DevicePreviewFrame>
                    </main>
                  </div>
                  <MobileBottomNav />
                </DevicePreviewProvider>
              </DataProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
