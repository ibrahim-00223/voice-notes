import type { Metadata } from "next";
import { Syne, Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Voice Notes — Ibrahim CISSE",
  description: "Enregistre ta voix, génère du contenu LinkedIn & Twitter.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${syne.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#080808] text-white">
        {/* Nav */}
        <nav
          className="sticky top-0 z-50 h-16 border-b border-[rgba(255,255,255,0.08)]"
          style={{ background: "rgba(8,8,8,0.92)", backdropFilter: "blur(12px)" }}
        >
          <div className="max-w-5xl mx-auto px-4 md:px-8 flex items-center gap-2 h-full">
            {/* Logo IC. */}
            <Link
              href="/"
              className="flex items-center mr-4"
              style={{ fontFamily: "var(--font-syne)", fontWeight: 700 }}
            >
              <span className="text-xl text-white tracking-tight">IC</span>
              <span className="text-xl" style={{ color: "#E6004C" }}>.</span>
            </Link>

            <Link
              href="/"
              className="px-3 py-1.5 text-sm rounded-md transition-colors"
              style={{ color: "rgba(255,255,255,0.55)" }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#fff";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              Enregistrements
            </Link>
            <Link
              href="/notes"
              className="px-3 py-1.5 text-sm rounded-md transition-colors"
              style={{ color: "rgba(255,255,255,0.55)" }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#fff";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              Notes
            </Link>
            <Link
              href="/posts"
              className="px-3 py-1.5 text-sm rounded-md transition-colors"
              style={{ color: "rgba(255,255,255,0.55)" }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#fff";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              Posts
            </Link>
          </div>
        </nav>

        {/* Content */}
        <main className="max-w-5xl mx-auto px-4 md:px-8 py-8">{children}</main>

        {/* Footer */}
        <footer className="max-w-5xl mx-auto px-4 md:px-8 py-8 border-t border-[rgba(255,255,255,0.08)] mt-16">
          <p
            className="text-xs"
            style={{
              color: "rgba(255,255,255,0.28)",
              fontFamily: "var(--font-jetbrains)",
              letterSpacing: "0.08em",
            }}
          >
            Conçu &amp; codé à la main
          </p>
        </footer>
      </body>
    </html>
  );
}
