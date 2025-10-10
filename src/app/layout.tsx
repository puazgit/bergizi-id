import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/shared/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Bergizi-ID | Enterprise SPPG Management Platform",
  description: "Modern enterprise SaaS platform for comprehensive SPPG (Satuan Pelayanan Pemenuhan Gizi) management across Indonesia",
  keywords: ["SPPG", "nutrition", "enterprise", "SaaS", "Indonesia", "food management"],
  authors: [{ name: "Bergizi-ID Team" }],
  creator: "Bergizi-ID",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://bergizi.id",
    title: "Bergizi-ID | Enterprise SPPG Management Platform",
    description: "Modern enterprise SaaS platform for comprehensive SPPG management",
    siteName: "Bergizi-ID"
  },
  twitter: {
    card: "summary_large_image",
    title: "Bergizi-ID | Enterprise SPPG Management Platform",
    description: "Modern enterprise SaaS platform for comprehensive SPPG management",
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
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
