import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ui/theme-provider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-clash-display",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Glint — Your Campus, In One Place",
    template: "%s | Glint",
  },
  description:
    "Connect, discover, buy, share, and experience campus life beautifully. The private social platform for your college.",
  keywords: ["campus social", "college platform", "student community", "campus marketplace"],
  authors: [{ name: "Glint" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "Glint — Your Campus, In One Place",
    description: "The premium social platform built exclusively for your campus.",
    siteName: "Glint",
  },
  twitter: {
    card: "summary_large_image",
    title: "Glint — Your Campus, In One Place",
    description: "The premium social platform built exclusively for your campus.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${dmSans.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className:
                "!bg-white dark:!bg-slate-900 !text-slate-900 dark:!text-white !border !border-slate-200 dark:!border-slate-700 !shadow-xl !rounded-xl",
              duration: 4000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
