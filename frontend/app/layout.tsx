import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Link from "next/link";

const geist = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "eco eeelien ♻️ | Recicla y Gana en Monad",
  description: "Registra tus botellas recicladas y gana ECO tokens en Monad Testnet",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${geist.className} bg-gray-950 text-white min-h-screen`}>
        <Providers>
          {/* Navbar */}
          <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-50">
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                <span>♻️</span>
                <span className="text-green-400">eco eeelien</span>
              </Link>
              <div className="flex items-center gap-3">
                <Link href="/" className="text-gray-400 hover:text-white text-sm transition">Inicio</Link>
                <Link href="/reciclar" className="text-gray-400 hover:text-white text-sm transition">♻️ Reciclar</Link>
                <Link href="/retos" className="text-gray-400 hover:text-white text-sm transition">🏆 Retos</Link>
                <Link href="/vouchers" className="text-gray-400 hover:text-white text-sm transition">🎁 Rewards</Link>
                <Link href="/stats" className="text-gray-400 hover:text-white text-sm transition">📊 Stats</Link>
              </div>
            </div>
          </nav>
          <main className="max-w-4xl mx-auto px-4 py-8">
            {children}
          </main>
          {/* Footer */}
          <footer className="text-center text-gray-600 text-xs py-6 border-t border-gray-800 mt-12">
            eco eeelien — Monad Blitz CDMX 2025 · Monad Testnet (Chain 10143)
          </footer>
        </Providers>
      </body>
    </html>
  );
}
