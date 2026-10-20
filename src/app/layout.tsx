import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { getMetadataBase, siteConfig } from "@/lib/site";
import "./globals.css";
import MonetagPopup from "@/components/MonetagPopup";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const ORG_ID = `${siteConfig.baseUrl}#organization`;
const SITE_ID = `${siteConfig.baseUrl}#website`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": SITE_ID,
      name: siteConfig.name,
      url: siteConfig.baseUrl,
      description: siteConfig.description,
      inLanguage: "pt-BR",
      publisher: { "@id": ORG_ID },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteConfig.baseUrl}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: siteConfig.name,
      url: siteConfig.baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.baseUrl}/logo/og-image.png`,
        width: 1200,
        height: 630,
      },
      sameAs: [
        "https://twitter.com/futemax",
      ],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "FuteMax site OFICIAL ✔️",
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.baseUrl }],
  keywords: [
    "futebol",
    "jogos ao vivo",
    "jogos de hoje",
    "canais de tv",
    "esportes",
  ],
  alternates: {
    canonical: siteConfig.baseUrl,
  },
  openGraph: {
    title: "FuteMax — Acompanhe jogos e canais esportivos ao vivo",
    description: siteConfig.description,
    url: siteConfig.baseUrl,
    siteName: siteConfig.name,
    images: [
      {
        url: "/logo/og-image.png",
        width: 1200,
        height: 630,
        alt: "FuteMax — imagem de compartilhamento",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FuteMax — Jogos e canais esportivos",
    description: siteConfig.description,
    creator: "@futemax",
    images: ["/logo/og-image.png"],
  },
  icons: {
    icon: "/logo/favicon.ico",
    shortcut: "/logo/favicon-16x16.png",
    apple: "/logo/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

function StructuredData({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-br" className={inter.variable}>
      <head>
        <meta name="monetag" content="281834bbc07a85c9f35956e78fc3cd35"></meta>
      </head>
      <body>
        {children}
        <StructuredData data={jsonLd} />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-44GL33WR5P"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-44GL33WR5P');
          `}
        </Script>
        <MonetagPopup />
      </body>
    </html>
  );
}
