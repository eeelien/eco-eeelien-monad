"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import { CHALLENGE_MANAGER_ADDRESS, CHALLENGE_MANAGER_ABI } from "@/lib/contracts";

const BADGE_LABELS: Record<string, string> = {
  SEED: "Semilla", PLANT: "Planta", WAVE: "Ola Verde",
  CAN: "Lata Pro", WORLD: "Mundo", RECYCLE: "Guardián",
};

export default function RetosPage() {
  const { address, isConnected } = useAccount();

  const { data, refetch } = useReadContract({
    address: CHALLENGE_MANAGER_ADDRESS,
    abi: CHALLENGE_MANAGER_ABI,
    functionName: "getUserChallenges",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 8000 },
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const handleClaim = () => {
    writeContract({
      address: CHALLENGE_MANAGER_ADDRESS,
      abi: CHALLENGE_MANAGER_ABI,
      functionName: "claimChallenges",
    });
  };

  const challenges = data?.[0] ?? [];
  const completed = data?.[1] ?? [];
  const progress = data?.[2] ?? [];
  const hasPending = challenges.some((c, i) =>
    !completed[i] && Number(progress[i]) >= Number(c.target)
  );

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ marginBottom: 48 }}>
        <div style={{
          display: "inline-block", background: "var(--surface)", border: "1px solid var(--border)",
          padding: "5px 12px", borderRadius: 20, fontSize: 12,
          color: "var(--muted)", marginBottom: 20, letterSpacing: 0.5, textTransform: "uppercase"
        }}>
          Progreso
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-1px", marginBottom: 10 }}>Retos de reciclaje</h1>
        <p style={{ color: "var(--muted)", fontSize: 15 }}>
          Completa retos y desbloquea ECO tokens de bonificación.
        </p>
      </div>

      {!isConnected ? (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "48px", textAlign: "center" }}>
          <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 15 }}>Conecta tu wallet para ver tus retos</p>
          <ConnectButton label="Conectar wallet" />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {hasPending && (
            <div style={{
              background: "rgba(131,110,249,0.08)", border: "1px solid var(--monad-dim)",
              borderRadius: 16, padding: "20px 24px",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Tienes retos completados</div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>Reclama tus tokens de bonificación</div>
              </div>
              <button
                onClick={handleClaim}
                disabled={isPending}
                style={{
                  padding: "10px 20px", borderRadius: 10, fontWeight: 700, fontSize: 14,
                  background: "var(--monad)", color: "white", border: "none", cursor: "pointer"
                }}
              >
                {isPending ? "Procesando..." : "Reclamar"}
              </button>
            </div>
          )}

          {isSuccess && (
            <div style={{
              background: "rgba(45,106,79,0.12)", border: "1px solid var(--green-mid)",
              borderRadius: 12, padding: "16px 20px", textAlign: "center",
              color: "var(--green-light)", fontWeight: 600, fontSize: 14
            }}>
              Bonus reclamado — revisa tu balance ECO
            </div>
          )}

          {challenges.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
              Cargando retos...
            </div>
          ) : (
            challenges.map((challenge, i) => {
              const isCompleted = completed[i];
              const cur = Number(progress[i]);
              const target = Number(challenge.target);
              const pct = Math.min((cur / target) * 100, 100);
              const bonus = Number(formatEther(challenge.bonusReward)).toFixed(0);

              return (
                <div
                  key={i}
                  style={{
                    background: "var(--surface)", border: `1px solid ${isCompleted ? "var(--green-mid)" : "var(--border)"}`,
                    borderRadius: 16, padding: "24px",
                    opacity: isCompleted ? 0.65 : 1,
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{challenge.name}</span>
                        {isCompleted && (
                          <span style={{
                            fontSize: 11, fontWeight: 600, color: "var(--green-light)",
                            background: "rgba(82,183,136,0.12)", padding: "2px 8px", borderRadius: 20,
                            textTransform: "uppercase", letterSpacing: 0.5
                          }}>
                            Completado
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--muted)" }}>{challenge.description}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                      <div style={{ fontWeight: 800, fontSize: 18, color: "var(--green-light)" }}>+{bonus}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>ECO bonus</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
                    <span>{BADGE_LABELS[challenge.badge] ?? challenge.badge}</span>
                    <span>{cur} / {target}</span>
                  </div>
                  <div style={{ background: "var(--surface-2)", borderRadius: 4, height: 6, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${pct}%`,
                      background: isCompleted ? "var(--green-mid)" : "var(--green-light)",
                      borderRadius: 4, transition: "width 0.5s ease"
                    }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
