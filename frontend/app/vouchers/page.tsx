"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import dynamic from "next/dynamic";
const ConnectButton = dynamic(() => import("@rainbow-me/rainbowkit").then((mod) => mod.ConnectButton), { ssr: false });
import { formatEther } from "viem";
import {
  VOUCHER_NFT_ADDRESS, VOUCHER_NFT_ABI,
  ECO_TOKEN_ADDRESS, ECO_TOKEN_ABI,
  PARTNER_EMOJIS
} from "@/lib/contracts";
import { maxUint256 } from "viem";

const NUM_VOUCHER_TYPES = 3;

export default function VouchersPage() {
  const { address, isConnected } = useAccount();
  const [redeeming, setRedeeming] = useState<number | null>(null);
  const [step, setStep] = useState<"idle" | "approving" | "redeeming" | "done">("idle");

  // Balance ECO del usuario
  const { data: balance } = useReadContract({
    address: ECO_TOKEN_ADDRESS, abi: ECO_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  // Allowance actual
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: ECO_TOKEN_ADDRESS, abi: ECO_TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, VOUCHER_NFT_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  // Cuántos vouchers NFT tiene el usuario
  const { data: nftBalance, refetch: refetchNfts } = useReadContract({
    address: VOUCHER_NFT_ADDRESS, abi: VOUCHER_NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  // Cargar tipos de voucher
  const voucherQueries = Array.from({ length: NUM_VOUCHER_TYPES }, (_, i) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useReadContract({
      address: VOUCHER_NFT_ADDRESS, abi: VOUCHER_NFT_ABI,
      functionName: "voucherTypes",
      args: [BigInt(i)],
    })
  );

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const ecoBalance = balance ? Number(formatEther(balance)) : 0;

  const handleRedeem = async (typeId: number, ecoCost: bigint) => {
    if (!address) return;
    setRedeeming(typeId);

    const hasAllowance = allowance !== undefined && allowance >= ecoCost;

    if (!hasAllowance) {
      setStep("approving");
      writeContract({
        address: ECO_TOKEN_ADDRESS,
        abi: ECO_TOKEN_ABI,
        functionName: "approve",
        args: [VOUCHER_NFT_ADDRESS, maxUint256],
      });
    } else {
      setStep("redeeming");
      writeContract({
        address: VOUCHER_NFT_ADDRESS,
        abi: VOUCHER_NFT_ABI,
        functionName: "redeemVoucher",
        args: [BigInt(typeId)],
      });
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">🎁 Canjear Recompensas</h1>
        <p className="text-gray-400 mt-1">Usa tus ECO tokens para obtener descuentos con empresas aliadas</p>
      </div>

      {!isConnected ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center space-y-4">
          <div className="text-5xl">🔒</div>
          <p className="text-gray-400">Conecta tu wallet para ver las recompensas</p>
          <ConnectButton label="Conectar Wallet" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Balance del usuario */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-between items-center">
            <div>
              <div className="text-gray-400 text-sm">Tu balance</div>
              <div className="text-2xl font-bold text-green-400">{ecoBalance.toFixed(1)} ECO</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Vouchers NFT</div>
              <div className="text-2xl font-bold text-purple-400">{nftBalance?.toString() ?? "0"} 🎟️</div>
            </div>
          </div>

          {/* Cómo funciona */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-sm text-gray-400 space-y-1">
            <div className="text-white font-bold mb-2">¿Cómo funcionan los vouchers?</div>
            <div>1️⃣ Quemas ECO tokens → recibes un NFT-cupón</div>
            <div>2️⃣ Muestras el NFT en la app al llegar al negocio</div>
            <div>3️⃣ El negocio escanea y aplica el descuento</div>
            <div>4️⃣ El NFT queda marcado como usado (no se puede reusar)</div>
          </div>

          {/* Voucher types */}
          <div className="space-y-3">
            {voucherQueries.map((query, i) => {
              const v = query.data;
              if (!v) return (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse h-24" />
              );
              const [partnerName, description, , ecoCost, active, totalRedeemed] = v;
              const cost = Number(formatEther(ecoCost));
              const canAfford = ecoBalance >= cost;
              const emoji = PARTNER_EMOJIS[partnerName] ?? "🎁";

              return (
                <div key={i} className={`bg-gray-900 border rounded-xl p-5 ${active ? "border-gray-700" : "border-gray-800 opacity-50"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{emoji}</div>
                      <div>
                        <div className="font-bold text-white">{partnerName}</div>
                        <div className="text-gray-300 text-sm">{description}</div>
                        <div className="text-gray-500 text-xs mt-1">
                          {totalRedeemed.toString()} personas ya lo canjearon
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-orange-400 font-bold">{cost} ECO</div>
                      <div className="text-gray-500 text-xs">costo</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedeem(i, ecoCost as bigint)}
                    disabled={!active || !canAfford || isPending || (redeeming === i && isPending)}
                    className={`w-full font-bold py-3 rounded-xl text-sm transition ${
                      !canAfford
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-400 text-black"
                    }`}
                  >
                    {!canAfford
                      ? `Necesitas ${cost} ECO (te faltan ${(cost - ecoBalance).toFixed(1)})`
                      : isPending && redeeming === i
                      ? `⏳ ${step === "approving" ? "Aprobando..." : "Canjeando..."}`
                      : `🎁 Canjear por ${cost} ECO`}
                  </button>
                </div>
              );
            })}
          </div>

          {isSuccess && (
            <div className="bg-purple-900/30 border border-purple-600 rounded-xl p-5 text-center space-y-2">
              <div className="text-4xl">🎟️</div>
              <div className="text-purple-400 font-bold text-lg">¡Voucher NFT en tu wallet!</div>
              <div className="text-gray-400 text-sm">Muéstralo en el negocio para obtener tu descuento</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
