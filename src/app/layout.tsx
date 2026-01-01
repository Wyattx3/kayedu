import type { Metadata } from "next";
import { Outfit, JetBrains_Mono, Great_Vibes } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CookieConsent } from "@/components/ui/cookie-consent";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-handwriting",
});

export const metadata: Metadata = {
  title: "Kabyar - Your Intelligent Study Companion",
  description: "AI-powered learning assistant for GED, IGCSE, OTHM and all students. Essays, tutoring, homework help, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense Verification */}
        <meta name="google-adsense-account" content="ca-pub-4199720806695409" />
        
        {/* Google Analytics - with consent mode */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SGJZ5YFVY1"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics-consent"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              
              // Default consent - granted by default
              gtag('consent', 'default', {
                analytics_storage: 'granted',
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted',
              });
              
              gtag('js', new Date());
              gtag('config', 'G-SGJZ5YFVY1');
            `,
          }}
        />
        
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4199720806695409"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${outfit.variable} ${jetbrainsMono.variable} ${greatVibes.variable} font-sans antialiased`}>
        {children}
        <Toaster />
        <CookieConsent />
      </body>
    </html>
  );
}
