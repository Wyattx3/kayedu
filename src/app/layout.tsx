import type { Metadata } from "next";
import { Outfit, JetBrains_Mono, Great_Vibes } from "next/font/google";
import Script from "next/script";
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
        {/* Google AdSense Verification */}
        <meta name="google-adsense-account" content="ca-pub-4199720806695409" />
        
        {/* Silktide Cookie Consent Manager */}
        <link
          rel="stylesheet"
          href="https://cdn.silktide.com/cookie-banner/v1/silktide-consent-manager.css"
        />
        
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
              
              // Default consent - denied until user accepts
              gtag('consent', 'default', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
              });
              
              gtag('js', new Date());
              gtag('config', 'G-SGJZ5YFVY1');
            `,
          }}
        />
        
        {/* Silktide Cookie Banner Script */}
        <Script
          src="https://cdn.silktide.com/cookie-banner/v1/silktide-consent-manager.js"
          strategy="afterInteractive"
        />
        <Script
          id="silktide-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof silktideCookieBannerManager !== 'undefined') {
                silktideCookieBannerManager.updateCookieBannerConfig({
                  background: {
                    showBackground: true
                  },
                  cookieIcon: {
                    position: "bottomLeft"
                  },
                  cookieTypes: [
                    {
                      id: "necessary",
                      name: "Necessary",
                      description: "<p>These cookies are necessary for the website to function properly and cannot be switched off.</p>",
                      required: true,
                      onAccept: function() {
                        console.log('Necessary cookies accepted');
                      }
                    },
                    {
                      id: "analytics",
                      name: "Analytics",
                      description: "<p>These cookies help us improve the site by tracking which pages are most popular.</p>",
                      defaultValue: true,
                      onAccept: function() {
                        gtag('consent', 'update', {
                          analytics_storage: 'granted',
                        });
                        dataLayer.push({
                          'event': 'consent_accepted_analytics',
                        });
                      },
                      onReject: function() {
                        gtag('consent', 'update', {
                          analytics_storage: 'denied',
                        });
                      }
                    },
                    {
                      id: "advertising",
                      name: "Advertising",
                      description: "<p>These cookies provide extra features and personalization for ads.</p>",
                      onAccept: function() {
                        gtag('consent', 'update', {
                          ad_storage: 'granted',
                          ad_user_data: 'granted',
                          ad_personalization: 'granted',
                        });
                        dataLayer.push({
                          'event': 'consent_accepted_advertising',
                        });
                      },
                      onReject: function() {
                        gtag('consent', 'update', {
                          ad_storage: 'denied',
                          ad_user_data: 'denied',
                          ad_personalization: 'denied',
                        });
                      }
                    }
                  ],
                  text: {
                    banner: {
                      description: "<p>We use cookies to enhance your experience and analyze our traffic. <a href='/privacy' target='_blank'>Privacy Policy</a></p>",
                      acceptAllButtonText: "Accept all",
                      acceptAllButtonAccessibleLabel: "Accept all cookies",
                      rejectNonEssentialButtonText: "Reject non-essential",
                      rejectNonEssentialButtonAccessibleLabel: "Reject non-essential",
                      preferencesButtonText: "Preferences",
                      preferencesButtonAccessibleLabel: "Toggle preferences"
                    },
                    preferences: {
                      title: "Cookie Preferences",
                      description: "<p>You can choose which cookies to allow. Your preferences will apply across our website.</p>",
                      creditLinkText: "",
                      creditLinkAccessibleLabel: ""
                    }
                  },
                  position: {
                    banner: "bottomRight"
                  }
                });
              }
            `,
          }}
        />
        
        {/* Google AdSense - Load early for verification */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4199720806695409"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${outfit.variable} ${jetbrainsMono.variable} ${greatVibes.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

