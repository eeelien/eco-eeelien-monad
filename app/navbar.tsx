"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/reciclar", label: "Reciclar" },
  { href: "/retos", label: "Retos" },
  { href: "/vouchers", label: "Rewards" },
  { href: "/stats", label: "Stats" },
];

export function Navbar() {
  const path = usePathname();
  return (
    <nav style={{ borderBottom: "1px solid var(--border)", background: "rgba(13,31,22,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, var(--green-mid), var(--monad))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "white" }}>♻</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: "var(--text)" }}>eco eeelien</span>
        </Link>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {links.map(({ href, label }) => (
            <Link key={href} href={href} style={{
              color: path === href ? "var(--green-light)" : "var(--muted)",
              fontSize: 14, textDecoration: "none",
              padding: "6px 14px", borderRadius: 8,
              background: path === href ? "rgba(82,183,136,0.1)" : "transparent",
              fontWeight: path === href ? 600 : 400,
              transition: "all 0.15s",
            }}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
