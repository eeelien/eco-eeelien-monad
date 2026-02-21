"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther, maxUint256 } from "viem";
import {
  VOUCHER_NFT_ADDRESS, VOUCHER_NFT_ABI,
  ECO_TOKEN_ADDRESS, ECO_TOKEN_ABI,
} from "@/lib/contracts";

const NUM_TYPES = 3;
const PARTNER_COLORS = ["var(--green-mid)", "var(--monad-dim)", "var(--earth)"];

export default function VouchersPage() {
  const { address, isConnected } = useAccount();
  const [redeeming, setRedeeming] = useState<number | null>(null);

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: ECO_TOKEN_ADDRESS, abi: ECO_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: ECO_TOKEN_ADDRESS, abi: ECO_TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, VOUCHER_NFT_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  const { data: nftBal } = useReadContract({
    address: VOUCHER_NFT_ADDRESS, abi: VOUCHER_NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const voucherQueries = Array.from({ length: NUM_TYPES }, (_, i) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useReadContract({
      address: VOUCHER_NFT_ADDRESS, abi: VOUCHER_NFT_ABI,
      functionName: "voucherTypes",
      args: [BigInt(i)],
    })
  );

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const ecoBalance = balance ? Number(formatEther(balance)) : 0;

  const handleRedeem = (typeId: number, ecoCost: bigint) => {
    if (!address) return;
    setRedeeming(typeId);
    const hasAllowance = allowance !== undefined && allowance >= ecoCost;
    if (!hasAllowance) {
      writeContract({ address: ECO_TOKEN_ADDRESS, abi: ECO_TOKEN_ABI, functionName: "approve", args: [VOUCHER_NFT_ADDRESS, maxUint256] });
    } else {
      writeContract({ address: VOUCHER_NFT_ADDRESS, abi: VOUCHER_NFT_ABI, functionName: "redeemVoucher", args: [BigInt(typeId)] });
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ marginBottom: 48 }}>
        <div style={{
          display: "inline-block", background: "var(--surface)", border: "1px solid var(--border)",
          padding: "5px 12px", borderRadius: 20, fontSize: 12,
          color: "var(--muted)", marginBottom: 20, letterSpacing: 0.5, textTransform: "uppercase"
        }}>
          Empresas aliadas
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-1px", marginBottom: 10 }}>Recompensas reales</h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.6 }}>
          Quema ECO tokens para obtener cupones NFT verificables con empresas aliadas.
          El negocio escanea tu NFT — sin código de barras falso, sin intermediarios.
        </p>
      </div>

      {!isConnected ? (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "48px", textAlign: "center" }}>
          <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 15 }}>Conecta tu wallet para ver recompensas</p>
          <ConnectButton label="Conectar wallet" />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Balance + NFTs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Tu balance</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--green-light)" }}>{ecoBalance.toFixed(1)} ECO</div>
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Cupones NFT</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--monad)" }}>{nftBal?.toString() ?? "0"}</div>
            </div>
          </div>

          {/* Cómo funciona */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px" }}>
            <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>
              Cómo funciona
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Quemas ECO tokens → recibes un NFT-cupón único", "Llegas al negocio y muestras el NFT en la app", "El negocio escanea y aplica el descuento on-chain"].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--surface-2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.5 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Voucher types */}
          {voucherQueries.map((query, i) => {
            const v = query.data;
            if (!v) return (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, height: 100 }} />
            );
            const [partnerName, description, , ecoCost, active, totalRedeemed] = v;
            const cost = Number(formatEther(ecoCost));
            const canAfford = ecoBalance >= cost;

            return (
              <div key={i} style={{
                background: "var(--surface)", borderRadius: 16, overflow: "hidden",
                border: "1px solid var(--border)",
                opacity: active ? 1 : 0.5
              }}>
                <div style={{ height: 4, background: PARTNER_COLORS[i] }} />
                <div style={{ padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 17, color: "var(--text)", marginBottom: 6 }}>{partnerName}</div>
                      <div style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.5 }}>{description}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 20 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--earth)" }}>{cost} ECO</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{totalRedeemed.toString()} canjeados</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedeem(i, ecoCost as bigint)}
                    disabled={!active || !canAfford || (isPending && redeeming === i)}
                    style={{
                      width: "100%", padding: "12px",
                      borderRadius: 10, fontWeight: 700, fontSize: 14,
                      background: canAfford ? PARTNER_COLORS[i] : "var(--surface-2)",
                      color: canAfford ? "white" : "var(--muted)",
                      border: "none", cursor: canAfford ? "pointer" : "not-allowed",
                      transition: "opacity 0.2s"
                    }}
                  >
                    {!canAfford
                      ? `Necesitas ${(cost - ecoBalance).toFixed(1)} ECO más`
                      : isPending && redeeming === i
                      ? "Procesando..."
                      : `Canjear por ${cost} ECO`}
                  </button>
                </div>
              </div>
            );
          })}

          {isSuccess && (
            <div style={{
              background: "rgba(131,110,249,0.08)", border: "1px solid var(--monad-dim)",
              borderRadius: 14, padding: "20px 24px", textAlign: "center"
            }}>
              <div style={{ fontWeight: 700, color: "var(--monad)", marginBottom: 6, fontSize: 16 }}>
                Cupón NFT en tu wallet
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                Muéstralo en el negocio para obtener tu descuento
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
