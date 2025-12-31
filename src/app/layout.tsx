import type { Metadata } from "next";
import { Outfit, JetBrains_Mono, Great_Vibes } from "next/font/google";
import Script from "next/script"; // Ezoic SDK
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SGJZ5YFVY1"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-SGJZ5YFVY1');
            `,
          }}
        />
      </head>
      <body className={`${outfit.variable} ${jetbrainsMono.variable} ${greatVibes.variable} font-sans antialiased`}>
        {children}
        <Toaster />
        
        {/* Ezoic Integration - https://docs.ezoic.com/docs/ezoicads/integration/ */}
        {/* Step 1: Privacy Scripts (must load first) */}
        <Script
          src="https://cmp.gatekeeperconsent.com/min.js"
          data-cfasync="false"
          strategy="beforeInteractive"
        />
        <Script
          src="https://the.gatekeeperconsent.com/cmp.min.js"
          data-cfasync="false"
          strategy="beforeInteractive"
        />
        
        {/* Step 2: Header Script */}
        <Script
          src="//www.ezojs.com/ezoic/sa.min.js"
          strategy="afterInteractive"
        />
        <Script
          id="ezoic-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.ezstandalone = window.ezstandalone || {};
              ezstandalone.cmd = ezstandalone.cmd || [];
            `,
          }}
        />
        
        {/* Step 3: Rewarded Ads Init - https://docs.ezoic.com/docs/ezoicadsadvanced/rewarded/ */}
        <Script
          id="ezoic-rewarded-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.ezstandalone = window.ezstandalone || {};
              ezstandalone.cmd = ezstandalone.cmd || [];
              ezstandalone.cmd.push(function() {
                ezstandalone.initRewardedAds();
              });
              
              window.ezRewardedAds = window.ezRewardedAds || {};
              window.ezRewardedAds.cmd = window.ezRewardedAds.cmd || [];
            `,
          }}
        />
      </body>
    </html>
  );
}

