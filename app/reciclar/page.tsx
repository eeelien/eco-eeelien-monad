"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { RECYCLING_REGISTRY_ADDRESS, REGISTRY_ABI } from "@/lib/contracts";

const card = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px" };

const BOTTLE_TYPES = [
  { id: 0, label: "Botella de Plástico", detail: "PET / HDPE", reward: 5, icon: "◉" },
  { id: 1, label: "Lata de Aluminio", detail: "Aluminio reciclable", reward: 10, icon: "◈" },
];

export default function ReciclarPage() {
  const { address, isConnected } = useAccount();
  const [selected, setSelected] = useState<0 | 1>(0);

  const { writeContract, data: txHash, isPending, isError, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const bottle = BOTTLE_TYPES[selected];

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ color: "var(--green-light)", fontSize: 13, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
          Simulación ESP32-CAM
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Registrar Reciclaje</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
          En el evento físico, el sensor detecta la botella automáticamente. Aquí puedes simularlo para el demo.
        </p>
      </div>

      {!isConnected ? (
        <div style={{ ...card, textAlign: "center", padding: 48 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>🔒</div>
          <p style={{ color: "var(--muted)", marginBottom: 20 }}>Conecta tu wallet para continuar</p>
          <ConnectButton label="Conectar Wallet" />
        </div>
      ) : (
        <>
          {/* Tipo de material */}
          <div style={card}>
            <div style={{ fontWeight: 600, marginBottom: 16, color: "var(--muted)", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}>Tipo de material</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {BOTTLE_TYPES.map((b) => (
                <button key={b.id} onClick={() => setSelected(b.id as 0 | 1)}
                  style={{
                    background: selected === b.id ? "var(--surface-2)" : "transparent",
                    border: `2px solid ${selected === b.id ? "var(--green-mid)" : "var(--border)"}`,
                    borderRadius: 12, padding: 20, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                  }}>
                  <div style={{ fontSize: 28, marginBottom: 10, color: "var(--green-light)" }}>{b.icon}</div>
                  <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 4, fontSize: 15 }}>{b.label}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>{b.detail}</div>
                  <div style={{ color: "var(--green-light)", fontWeight: 700, fontSize: 14 }}>+{b.reward} ECO</div>
                </button>
              ))}
            </div>
          </div>

          {/* Resumen */}
          <div style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-2)" }}>
            <div>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>Recompensa a recibir</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--green-light)" }}>+{bottle.reward} ECO tokens</div>
            </div>
            <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "right" }}>
              <div>Wallet</div>
              <div style={{ fontFamily: "monospace", fontSize: 11 }}>{address?.slice(0, 8)}...{address?.slice(-4)}</div>
            </div>
          </div>

          {/* Botón */}
          <button onClick={() => writeContract({ address: RECYCLING_REGISTRY_ADDRESS, abi: REGISTRY_ABI, functionName: "registerBottle", args: [address!, selected] })}
            disabled={isPending || isConfirming}
            style={{
              background: isPending || isConfirming ? "var(--surface-2)" : "var(--green-mid)",
              color: isPending || isConfirming ? "var(--muted)" : "white",
              border: "none", borderRadius: 12, padding: "16px 24px",
              fontWeight: 700, fontSize: 16, cursor: isPending || isConfirming ? "not-allowed" : "pointer",
              transition: "all 0.15s", width: "100%",
            }}>
            {isPending ? "Confirmando en wallet..." : isConfirming ? "Procesando en Monad..." : `Registrar ${bottle.label}`}
          </button>

          {/* TX Hash */}
          {txHash && (
            <div style={{ ...card, background: "transparent" }}>
              <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 4 }}>Transacción on-chain</div>
              <a href={`https://monad-testnet.socialscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--monad)", fontSize: 12, fontFamily: "monospace", wordBreak: "break-all", textDecoration: "none" }}>
                {txHash}
              </a>
            </div>
          )}

          {/* Éxito */}
          {isSuccess && (
            <div style={{ background: "rgba(82,183,136,0.08)", border: "1px solid var(--green-mid)", borderRadius: 16, padding: 28, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "var(--green-light)", marginBottom: 6 }}>Reciclaje registrado</div>
              <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 20 }}>+{bottle.reward} ECO tokens acreditados en tu wallet</div>
              <Link href="/stats" style={{ color: "var(--green-light)", fontSize: 14, textDecoration: "none" }}>Ver mis estadísticas →</Link>
            </div>
          )}

          {isError && (
            <div style={{ background: "rgba(220,38,38,0.08)", border: "1px solid #7f1d1d", borderRadius: 12, padding: 16, color: "#f87171", fontSize: 13 }}>
              {error?.message?.slice(0, 150)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
