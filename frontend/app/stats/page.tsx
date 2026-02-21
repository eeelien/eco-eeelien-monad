"use client";

import { useAccount, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import Link from "next/link";
import {
  ECO_TOKEN_ADDRESS,
  ECO_TOKEN_ABI,
  RECYCLING_REGISTRY_ADDRESS,
  REGISTRY_ABI,
} from "@/lib/contracts";

export default function StatsPage() {
  const { address, isConnected } = useAccount();

  const { data: balance } = useReadContract({
    address: ECO_TOKEN_ADDRESS,
    abi: ECO_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: stats } = useReadContract({
    address: RECYCLING_REGISTRY_ADDRESS,
    abi: REGISTRY_ABI,
    functionName: "getUserStats",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: globalTotal } = useReadContract({
    address: RECYCLING_REGISTRY_ADDRESS,
    abi: REGISTRY_ABI,
    functionName: "globalTotalRecycled",
    query: { refetchInterval: 10000 },
  });

  const ecoBalance = balance ? Number(formatEther(balance)).toFixed(1) : "0.0";
  const bottlesRecycled = stats ? Number(stats[0]) : 0;
  const tokensEarned = stats ? Number(formatEther(stats[1])).toFixed(1) : "0.0";

  // Estimación de CO2 ahorrado (aprox 80g CO2 por botella plástica)
  const co2Saved = (bottlesRecycled * 0.08).toFixed(2);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">📊 Mis Stats</h1>
        <p className="text-gray-400 mt-1">Tu impacto ambiental y recompensas</p>
      </div>

      {!isConnected ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center space-y-4">
          <div className="text-5xl">🔒</div>
          <p className="text-gray-400">Conecta tu wallet para ver tus stats</p>
          <ConnectButton label="Conectar Wallet" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stats personales */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <span>👤</span> Tu impacto
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-4xl font-bold text-white">{bottlesRecycled}</div>
                <div className="text-gray-400 text-sm mt-1">Botellas recicladas</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-4xl font-bold text-green-400">{ecoBalance}</div>
                <div className="text-green-600 text-sm mt-1">ECO tokens</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-4xl font-bold text-blue-400">{tokensEarned}</div>
                <div className="text-gray-400 text-sm mt-1">Total ganado (ECO)</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-4xl font-bold text-emerald-400">{co2Saved}</div>
                <div className="text-gray-400 text-sm mt-1">kg CO₂ ahorrado</div>
              </div>
            </div>
          </div>

          {/* Nivel de reciclador */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-bold text-white mb-3">🏆 Nivel de reciclador</h2>
            {(() => {
              const levels = [
                { min: 0, max: 5, label: "Principiante 🌱", color: "text-gray-400" },
                { min: 5, max: 20, label: "Eco Warrior 🌿", color: "text-green-400" },
                { min: 20, max: 50, label: "Guardian Verde 🌍", color: "text-blue-400" },
                { min: 50, max: Infinity, label: "Leyenda ♻️", color: "text-yellow-400" },
              ];
              const level = levels.find((l) => bottlesRecycled >= l.min && bottlesRecycled < l.max) || levels[0];
              const nextLevel = levels[levels.indexOf(level) + 1];
              const progress = nextLevel
                ? ((bottlesRecycled - level.min) / (nextLevel.min - level.min)) * 100
                : 100;

              return (
                <div className="space-y-3">
                  <div className={`text-2xl font-bold ${level.color}`}>{level.label}</div>
                  {nextLevel && (
                    <>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="text-gray-500 text-xs">
                        {bottlesRecycled}/{nextLevel.min} botellas para el siguiente nivel
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Global */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-between items-center">
            <div className="text-gray-400 text-sm">🌍 Total global reciclado</div>
            <div className="text-white font-bold">{globalTotal?.toString() ?? "0"} botellas</div>
          </div>

          {/* Wallet */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-500 text-xs mb-1">Tu wallet</div>
            <div className="text-gray-300 text-xs font-mono break-all">{address}</div>
            <a
              href={`https://monad-testnet.socialscan.io/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-xs mt-2 inline-block"
            >
              Ver en explorer →
            </a>
          </div>

          {/* CTA */}
          {bottlesRecycled === 0 ? (
            <Link
              href="/reciclar"
              className="block w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl text-center transition"
            >
              ♻️ ¡Registra tu primera botella!
            </Link>
          ) : (
            <Link
              href="/reciclar"
              className="block w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl text-center transition"
            >
              ♻️ Registrar otra botella
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
