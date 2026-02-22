import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "./navbar";

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
          <Navbar />
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
