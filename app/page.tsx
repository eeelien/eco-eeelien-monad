"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { formatEther } from "viem";
import Link from "next/link";
import { ECO_TOKEN_ADDRESS, ECO_TOKEN_ABI, RECYCLING_REGISTRY_ADDRESS, REGISTRY_ABI } from "@/lib/contracts";

export default function HomePage() {
  const { address, isConnected } = useAccount();

  const { data: balance } = useReadContract({
    address: ECO_TOKEN_ADDRESS, abi: ECO_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 6000 },
  });

  const { data: stats } = useReadContract({
    address: RECYCLING_REGISTRY_ADDRESS, abi: REGISTRY_ABI,
    functionName: "getUserStats",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 6000 },
  });

  const { data: globalTotal } = useReadContract({
    address: RECYCLING_REGISTRY_ADDRESS, abi: REGISTRY_ABI,
    functionName: "globalTotalRecycled",
    query: { refetchInterval: 15000 },
  });

  const ecoBalance = balance ? Number(formatEther(balance)).toFixed(1) : "0";
  const bottlesRecycled = stats ? Number(stats[0]) : 0;

  const S = {
    surface: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16 } as React.CSSProperties,
    badge: { display: "inline-flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid var(--border)", padding: "5px 14px", borderRadius: 20, fontSize: 12, color: "var(--green-light)", marginBottom: 28, letterSpacing: "0.5px", textTransform: "uppercase" as const },
    dot: { width: 6, height: 6, borderRadius: "50%", background: "var(--green-light)", display: "inline-block" },
  };

  return (
    <div>
      {/* Hero */}
      <section style={{ padding: "72px 0 56px", maxWidth: 760 }}>
        <div style={S.badge}>
          <span style={S.dot} />
          Monad Testnet · Contratos en vivo
        </div>
        <h1 style={{ fontSize: "clamp(38px, 6vw, 66px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-2px", marginBottom: 24 }}>
          Recicla.<br />
          <span style={{ color: "var(--green-light)" }}>Gana tokens.</span><br />
          <span style={{ color: "var(--muted)" }}>Cuida el planeta.</span>
        </h1>
        <p style={{ fontSize: 18, color: "var(--muted)", lineHeight: 1.65, maxWidth: 540, marginBottom: 40 }}>
          Una cámara ESP32 detecta tus botellas recicladas y registra la recompensa directamente en Monad.
          Sin intermediarios. Sin papel. Sin excusas.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <ConnectButton label="Conectar wallet" />
          {isConnected && (
            <Link href="/reciclar" style={{ padding: "12px 22px", borderRadius: 10, fontSize: 15, fontWeight: 600, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", textDecoration: "none" }}>
              Registrar botella
            </Link>
          )}
        </div>
      </section>

      {/* Métricas globales */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 72 }}>
        {[
          { value: globalTotal?.toString() ?? "0", label: "Botellas globales", sub: "registradas en la red" },
          { value: "5 ECO", label: "Por plástico", sub: "recompensa base" },
          { value: "10 ECO", label: "Por aluminio", sub: "recompensa base" },
        ].map((s, i) => (
          <div key={i} style={{ ...S.surface, padding: "26px 22px" }}>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-1px", color: "var(--text)", marginBottom: 6 }}>{s.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--green-light)", marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{s.sub}</div>
          </div>
        ))}
      </section>

      {/* Dashboard usuario */}
      {isConnected && (
        <section style={{ ...S.surface, borderColor: "var(--green-mid)", padding: 30, marginBottom: 72 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 18 }}>Tu actividad</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
            <div style={{ background: "var(--surface-2)", borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ fontSize: 38, fontWeight: 800, color: "var(--green-light)", letterSpacing: "-1px" }}>{ecoBalance}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>ECO tokens</div>
            </div>
            <div style={{ background: "var(--surface-2)", borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ fontSize: 38, fontWeight: 800, color: "var(--text)", letterSpacing: "-1px" }}>{bottlesRecycled}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Botellas recicladas</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/reciclar" style={{ flex: 1, padding: 14, borderRadius: 10, fontWeight: 700, fontSize: 14, background: "var(--green-mid)", color: "white", textDecoration: "none", textAlign: "center" as const }}>
              Registrar reciclaje
            </Link>
            <Link href="/vouchers" style={{ flex: 1, padding: 14, borderRadius: 10, fontWeight: 700, fontSize: 14, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", textDecoration: "none", textAlign: "center" as const }}>
              Ver recompensas
            </Link>
          </div>
        </section>
      )}

      {/* Cómo funciona */}
      <section style={{ marginBottom: 72 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 6 }}>Tecnología + Naturaleza</h2>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 36 }}>El ESP32-CAM es el corazón del sistema. Un contenedor inteligente sin apps adicionales.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {[
            { n: "01", title: "Cámara detecta", desc: "El ESP32-CAM escanea la botella al insertarla y la clasifica automáticamente por tipo de material.", accent: "var(--green-light)" },
            { n: "02", title: "Monad registra", desc: "El contenedor llama al smart contract — la transacción queda on-chain en milisegundos.", accent: "var(--monad)" },
            { n: "03", title: "Tú recibes", desc: "Los ECO tokens llegan directo a tu wallet. 5 ECO por plástico, 10 ECO por aluminio.", accent: "var(--earth)" },
          ].map((item) => (
            <div key={item.n} style={{ ...S.surface, padding: "26px 22px", position: "relative", overflow: "hidden" }}>
              <div style={{ fontSize: 52, fontWeight: 900, color: "var(--border)", position: "absolute", top: -6, right: 14, letterSpacing: "-2px", lineHeight: 1 }}>{item.n}</div>
              <div style={{ width: 3, height: 28, background: item.accent, borderRadius: 2, marginBottom: 18 }} />
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: "var(--text)" }}>{item.title}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Contratos */}
      <section style={{ ...S.surface, padding: "22px 26px" }}>
        <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Contratos verificados · Monad Testnet</div>
        {[
          { name: "EcoToken (ECO)", addr: "0x03b5e6F27E1b1A1ae5aA990074209FcFaE473222" },
          { name: "RecyclingRegistry", addr: "0x18590Db5176e85785fb859b4b96E99b0A4D2f817" },
          { name: "ChallengeManager", addr: "0x1507eFa34a2f9E33ed491526132BfAf6A5C50c97" },
          { name: "VoucherNFT", addr: "0x188496b92FB6580Dfd9159C40FD5Bf4Fb438d729" },
        ].map((c) => (
          <a key={c.addr} href={`https://monad-testnet.socialscan.io/address/${c.addr}`} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none", padding: "10px 12px", background: "var(--surface-2)", borderRadius: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--green-light)" }}>{c.name}</span>
            <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>{c.addr.slice(0,8)}...{c.addr.slice(-6)}</span>
          </a>
        ))}
      </section>
    </div>
  );
}
