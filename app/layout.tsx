import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "prodlog — the progress log for solo founders",
    template: "%s · prodlog",
  },
  description:
    "Track every idea from a spark to a launch. Log progress, document your infra, share curated portfolios.",
  keywords: [
    "progress log",
    "idea tracker",
    "founder journal",
    "build in public",
    "portfolio",
  ],
  authors: [{ name: "prodlog" }],
  openGraph: {
    title: "prodlog — the progress log for solo founders",
    description:
      "Track every idea from a spark to a launch. Log progress, document your infra, share curated portfolios.",
    type: "website",
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: "prodlog — the progress log for solo founders",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "prodlog — the progress log for solo founders",
    description:
      "Track every idea from a spark to a launch. Log progress, document your infra, share curated portfolios.",
    images: ["/og"],
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500;1,9..144,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-bg text-text antialiased">
        {children}
      </body>
    </html>
  );
}
