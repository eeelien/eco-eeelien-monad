"use client";

import { useAccount, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import Link from "next/link";
import { ECO_TOKEN_ADDRESS, ECO_TOKEN_ABI, RECYCLING_REGISTRY_ADDRESS, REGISTRY_ABI } from "@/lib/contracts";

const card = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px" };

export default function StatsPage() {
  const { address, isConnected } = useAccount();

  const { data: balance } = useReadContract({ address: ECO_TOKEN_ADDRESS, abi: ECO_TOKEN_ABI, functionName: "balanceOf", args: address ? [address] : undefined, query: { enabled: !!address, refetchInterval: 5000 } });
  const { data: stats } = useReadContract({ address: RECYCLING_REGISTRY_ADDRESS, abi: REGISTRY_ABI, functionName: "getUserStats", args: address ? [address] : undefined, query: { enabled: !!address, refetchInterval: 5000 } });
  const { data: globalTotal } = useReadContract({ address: RECYCLING_REGISTRY_ADDRESS, abi: REGISTRY_ABI, functionName: "globalTotalRecycled", query: { refetchInterval: 10000 } });

  const ecoBalance = balance ? Number(formatEther(balance)).toFixed(1) : "0.0";
  const bottlesRecycled = stats ? Number(stats[0]) : 0;
  const tokensEarned = stats ? Number(formatEther(stats[1])).toFixed(1) : "0.0";
  const co2Saved = (bottlesRecycled * 0.08).toFixed(2);

  const levels = [
    { min: 0, max: 5, label: "Principiante", color: "var(--muted)" },
    { min: 5, max: 20, label: "Eco Activo", color: "var(--green-light)" },
    { min: 20, max: 50, label: "Guardian Verde", color: "var(--monad)" },
    { min: 50, max: Infinity, label: "Leyenda Eco", color: "var(--earth)" },
  ];
  const level = levels.find(l => bottlesRecycled >= l.min && bottlesRecycled < l.max) || levels[0];
  const nextLevel = levels[levels.indexOf(level) + 1];
  const pct = nextLevel ? Math.min(((bottlesRecycled - level.min) / (nextLevel.min - level.min)) * 100, 100) : 100;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 6 }}>Mis Estadísticas</h1>
        <p style={{ color: "var(--muted)" }}>Tu impacto ambiental en Monad</p>
      </div>

      {!isConnected ? (
        <div style={{ ...card, textAlign: "center", padding: 48 }}>
          <p style={{ color: "var(--muted)", marginBottom: 20 }}>Conecta tu wallet para ver tus estadísticas</p>
          <ConnectButton label="Conectar Wallet" />
        </div>
      ) : (
        <>
          {/* Balance principal */}
          <div style={{ ...card, background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 4 }}>Balance ECO</div>
                <div style={{ fontSize: 40, fontWeight: 800, color: "var(--green-light)" }}>{ecoBalance}</div>
                <div style={{ color: "var(--muted)", fontSize: 12 }}>tokens disponibles</div>
              </div>
              <div>
                <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 4 }}>Botellas recicladas</div>
                <div style={{ fontSize: 40, fontWeight: 800, color: "var(--text)" }}>{bottlesRecycled}</div>
                <div style={{ color: "var(--muted)", fontSize: 12 }}>registros on-chain</div>
              </div>
            </div>
          </div>

          {/* Métricas */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={card}>
              <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 4 }}>Total ganado</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--monad)" }}>{tokensEarned} ECO</div>
            </div>
            <div style={card}>
              <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 4 }}>CO₂ ahorrado</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--earth)" }}>{co2Saved} kg</div>
            </div>
          </div>

          {/* Nivel */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontWeight: 600 }}>Nivel de reciclador</div>
              <div style={{ fontWeight: 700, color: level.color }}>{level.label}</div>
            </div>
            <div style={{ background: "var(--surface-2)", borderRadius: 100, height: 6, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, var(--green-mid), var(--green-light))", borderRadius: 100, transition: "width 0.5s ease" }} />
            </div>
            {nextLevel && (
              <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 8 }}>
                {bottlesRecycled}/{nextLevel.min} botellas para "{nextLevel.label}"
              </div>
            )}
          </div>

          {/* Global */}
          <div style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>Total global de la comunidad</div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{globalTotal?.toString() ?? "0"} botellas</div>
          </div>

          {/* Wallet link */}
          <div style={{ ...card, background: "transparent" }}>
            <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 4 }}>Wallet</div>
            <a href={`https://monad-testnet.socialscan.io/address/${address}`} target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--monad)", fontSize: 12, fontFamily: "monospace", textDecoration: "none" }}>{address}</a>
          </div>

          <Link href="/reciclar" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", padding: "14px", borderRadius: 12, textDecoration: "none", fontSize: 14, fontWeight: 600, textAlign: "center", display: "block" }}>
            Registrar otra botella
          </Link>
        </>
      )}
    </div>
  );
}
