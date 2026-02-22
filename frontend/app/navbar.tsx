"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <nav className="border-b border-[#1e3a24] bg-[#0c1a0e]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full eco-gradient flex items-center justify-center text-sm font-bold text-[#0c1a0e]">
            E
          </div>
          <span className="text-lg font-bold text-white group-hover:text-emerald-400 transition">
            eco eeelien
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-emerald-400 transition">
            Inicio
          </Link>
          <Link href="/esp32" className="text-sm text-gray-400 hover:text-emerald-400 transition">
            ESP32
          </Link>
          <Link href="/reciclar" className="text-sm text-gray-400 hover:text-emerald-400 transition">
            Reciclar
          </Link>
          <Link href="/retos" className="text-sm text-gray-400 hover:text-emerald-400 transition">
            Retos
          </Link>
          <Link href="/vouchers" className="text-sm text-gray-400 hover:text-emerald-400 transition">
            Rewards
          </Link>
          <Link href="/stats" className="text-sm text-gray-400 hover:text-emerald-400 transition">
            Impacto
          </Link>
        </div>
      </div>
    </nav>
  );
}
