"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { formatEther } from "viem";
import Link from "next/link";
import { ECO_TOKEN_ADDRESS, ECO_TOKEN_ABI, RECYCLING_REGISTRY_ADDRESS, REGISTRY_ABI } from "@/lib/contracts";

const card = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: "24px",
};

export default function HomePage() {
  const { address, isConnected } = useAccount();

  const { data: balance } = useReadContract({
    address: ECO_TOKEN_ADDRESS, abi: ECO_TOKEN_ABI,
    functionName: "balanceOf", args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: stats } = useReadContract({
    address: RECYCLING_REGISTRY_ADDRESS, abi: REGISTRY_ABI,
    functionName: "getUserStats", args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: globalTotal } = useReadContract({
    address: RECYCLING_REGISTRY_ADDRESS, abi: REGISTRY_ABI,
    functionName: "globalTotalRecycled",
    query: { refetchInterval: 10000 },
  });

  const ecoBalance = balance ? Number(formatEther(balance)).toFixed(1) : "0";
  const bottlesRecycled = stats ? Number(stats[0]) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 60 }}>

      {/* Hero */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", padding: "40px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 100, padding: "6px 14px", width: "fit-content" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green-light)", boxShadow: "0 0 8px var(--green-light)" }} />
            <span style={{ fontSize: 13, color: "var(--green-light)" }}>Monad Testnet · Chain 10143</span>
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px" }}>
            Recicla.<br />
            <span style={{ color: "var(--green-light)" }}>Gana.</span><br />
            Impacta.
          </h1>
          <p style={{ fontSize: 17, color: "var(--muted)", lineHeight: 1.7, maxWidth: 420 }}>
            Una cámara inteligente detecta tus botellas recicladas y envía recompensas en ECO tokens directamente a tu wallet — sin intermediarios, on-chain en Monad.
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <ConnectButton label="Conectar Wallet" />
            {isConnected && (
              <Link href="/reciclar" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", padding: "10px 20px", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
                Registrar botella
              </Link>
            )}
          </div>
        </div>

        {/* ESP32 visual */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ ...card, background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)", textAlign: "center", padding: 40, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(82,183,136,0.15) 0%, transparent 70%)" }} />
            <div style={{ fontSize: 56, marginBottom: 12 }}>📷</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>ESP32-CAM</div>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>Contenedor inteligente</div>
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Detecta botella", status: "active" },
                { label: "Clasifica material", status: "active" },
                { label: "Llama al contrato", status: "active" },
                { label: "Tokens a tu wallet", status: "active" },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 12px", textAlign: "left" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--green-mid)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>✓</div>
                  <span style={{ fontSize: 13, color: "var(--text)" }}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats globales */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { value: globalTotal?.toString() ?? "0", label: "Botellas recicladas", accent: "var(--green-light)" },
          { value: "5 ECO", label: "Por botella plástica", accent: "var(--earth)" },
          { value: "10 ECO", label: "Por lata de aluminio", accent: "var(--monad)" },
        ].map((s, i) => (
          <div key={i} style={{ ...card, textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.accent, marginBottom: 6 }}>{s.value}</div>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Dashboard usuario */}
      {isConnected && (
        <section style={{ ...card, border: "1px solid var(--green-mid)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
            <div>
              <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 4 }}>Tu balance</div>
              <div style={{ fontSize: 42, fontWeight: 800, color: "var(--green-light)" }}>{ecoBalance} <span style={{ fontSize: 20, color: "var(--muted)" }}>ECO</span></div>
              <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>{bottlesRecycled} botellas recicladas</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Link href="/reciclar" style={{ background: "var(--green-mid)", color: "white", padding: "10px 20px", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
                + Registrar botella
              </Link>
              <Link href="/vouchers" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", padding: "10px 20px", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
                Canjear rewards
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Cómo funciona */}
      <section>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>¿Cómo funciona?</h2>
        <p style={{ color: "var(--muted)", marginBottom: 28 }}>Tecnología IoT + blockchain para incentivizar el reciclaje real</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { n: "01", title: "Conecta tu wallet", desc: "MetaMask u otra wallet EVM compatible con Monad" },
            { n: "02", title: "Ve al contenedor", desc: "El ESP32-CAM detecta y clasifica tu botella automáticamente" },
            { n: "03", title: "Registro on-chain", desc: "El smart contract registra el reciclaje en Monad Testnet" },
            { n: "04", title: "Recibe ECO tokens", desc: "Los tokens llegan directo a tu wallet, canjeables por descuentos reales" },
          ].map((s, i) => (
            <div key={i} style={{ ...card }}>
              <div style={{ fontSize: 13, color: "var(--green-light)", fontWeight: 700, marginBottom: 12, fontFamily: "monospace" }}>{s.n}</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{s.title}</div>
              <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Contrato verificado */}
      <div style={{ textAlign: "center" }}>
        <a href="https://monad-testnet.socialscan.io/address/0x18590Db5176e85785fb859b4b96E99b0A4D2f817" target="_blank" rel="noopener noreferrer"
          style={{ color: "var(--muted)", fontSize: 12, textDecoration: "none", fontFamily: "monospace" }}>
          Contrato verificado · RecyclingRegistry · 0x1859...0A4D2f817
        </a>
      </div>
    </div>
  );
}
