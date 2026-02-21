import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "eco eeelien — Recicla y Gana en Monad",
  description: "Registra tus botellas recicladas y gana ECO tokens en Monad Testnet",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className} style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
        <Providers>
          <nav style={{ borderBottom: "1px solid var(--border)", background: "rgba(13,31,22,0.92)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, var(--green-mid), var(--monad))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>♻</div>
                <span style={{ fontWeight: 700, fontSize: 18, color: "var(--text)" }}>eco eeelien</span>
              </Link>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {[
                  { href: "/", label: "Inicio" },
                  { href: "/reciclar", label: "Reciclar" },
                  { href: "/retos", label: "Retos" },
                  { href: "/vouchers", label: "Rewards" },
                  { href: "/stats", label: "Stats" },
                ].map(({ href, label }) => (
                  <Link key={href} href={href} style={{ color: "var(--muted)", fontSize: 14, textDecoration: "none", padding: "6px 12px", borderRadius: 6, transition: "all 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
          <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
            {children}
          </main>
          <footer style={{ textAlign: "center", color: "var(--muted)", fontSize: 12, padding: "32px 0", borderTop: "1px solid var(--border)", marginTop: 60 }}>
            eco eeelien · Monad Blitz CDMX 2025 · Chain 10143
          </footer>
        </Providers>
      </body>
    </html>
  );
}
