import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TabNap — Snooze browser tabs, reopen them later",
  description:
    "Free Chrome extension to snooze tabs. Close tabs now, they reopen automatically at the time you choose. Recurring snooze, wake-up sounds, history, dark mode — all free.",
  keywords: [
    "tab snooze",
    "snooze tabs",
    "chrome extension",
    "tab manager",
    "browser tabs",
    "tab snooze extension",
    "reopen tabs",
    "tab scheduler",
    "free tab snooze",
  ],
  authors: [{ name: "TabNap" }],
  openGraph: {
    title: "TabNap — Snooze browser tabs, reopen them later",
    description:
      "Free Chrome extension to snooze tabs. Close tabs now, they reopen automatically at the time you choose.",
    url: "https://tabnap.dev",
    siteName: "TabNap",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TabNap — Give your tabs a little nap",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TabNap — Snooze browser tabs, reopen them later",
    description:
      "Free Chrome extension to snooze tabs. Close tabs now, they reopen automatically at the time you choose.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark:bg-chrome-900`}
      >
        <ThemeProvider>
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
