import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "./navbar";

export const metadata = {
  title: "Eco Eeelien — Recicla y Gana en Monad",
  description: "Plataforma de recompensas por reciclaje en Monad. Registra tus botellas y gana ECO tokens.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen">
        <Providers>
          <Navbar />
          <main className="max-w-5xl mx-auto px-6 py-10 relative z-10">
            {children}
          </main>
          <footer className="border-t border-[#1e3a24] mt-16">
            <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <div className="w-5 h-5 rounded-full eco-gradient"></div>
                <span>Eco Eeelien</span>
              </div>
              <div className="text-gray-600 text-xs">
                Construido en Monad · Monad Blitz CDMX 2025
              </div>
              <div className="flex gap-4 text-xs text-gray-600">
                <a href="https://github.com/eeelien/eco-eeelien-monad" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition">
                  GitHub
                </a>
                <a href="https://monad-testnet.socialscan.io/address/0x03b5e6F27E1b1A1ae5aA990074209FcFaE473222" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition">
                  Contratos
                </a>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
