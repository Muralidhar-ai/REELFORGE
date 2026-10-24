import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RoleProvider } from "@/context/RoleContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { FeedbackWidget } from "@/components/common/FeedbackWidget";

export const metadata: Metadata = {
  title: "ReelForge — Production Desk for Hiring AI Creators",
  description: "Marketplace where brands find and hire AI filmmakers, animators, and generative designers with verified workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Fonts loaded via link tag — works offline in dev, graceful degradation at build */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-paper text-ink font-sans">
        <LanguageProvider>
          <RoleProvider>
            <Header />
            <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-8">{children}</main>
            <Footer />
            <FeedbackWidget />
          </RoleProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
