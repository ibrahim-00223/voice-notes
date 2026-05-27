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
      <body className="min-h-full" style={{ background: "#080808", color: "#fff" }}>
        {/* Nav */}
        <nav
          className="sticky top-0 z-50 h-16"
          style={{
            background: "rgba(8,8,8,0.92)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="max-w-5xl mx-auto px-4 flex items-center gap-2 h-full">
            {/* Logo IC. */}
            <Link
              href="/"
              className="flex items-center mr-4"
              style={{ fontFamily: "var(--font-syne)", fontWeight: 700, textDecoration: "none" }}
            >
              <span style={{ fontSize: "1.25rem", color: "#fff", letterSpacing: "-0.02em" }}>IC</span>
              <span style={{ fontSize: "1.25rem", color: "#E6004C" }}>.</span>
            </Link>

            <Link href="/" className="nav-link px-3 py-1.5 text-sm rounded-md">
              Enregistrements
            </Link>
            <Link href="/notes" className="nav-link px-3 py-1.5 text-sm rounded-md">
              Notes
            </Link>
            <Link href="/posts" className="nav-link px-3 py-1.5 text-sm rounded-md">
              Posts
            </Link>
          </div>
        </nav>

        {/* Content */}
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>

        {/* Footer */}
        <footer
          className="max-w-5xl mx-auto px-4 py-8 mt-16"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.28)",
              fontFamily: "var(--font-jetbrains)",
              fontSize: "0.75rem",
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
