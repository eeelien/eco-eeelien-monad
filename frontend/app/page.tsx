"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { formatEther } from "viem";
import Link from "next/link";
import {
  ECO_TOKEN_ADDRESS,
  ECO_TOKEN_ABI,
  RECYCLING_REGISTRY_ADDRESS,
  REGISTRY_ABI,
} from "@/lib/contracts";

export default function HomePage() {
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

  const ecoBalance = balance ? Number(formatEther(balance)).toFixed(1) : "0";
  const bottlesRecycled = stats ? Number(stats[0]) : 0;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-8 space-y-4">
        <div className="text-7xl mb-4">♻️</div>
        <h1 className="text-4xl font-bold text-white">
          Recicla y gana en{" "}
          <span className="text-green-400">Monad</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Registra tus botellas en el contenedor inteligente y recibe{" "}
          <strong className="text-green-400">ECO tokens</strong> directamente en tu wallet.
        </p>
        <div className="pt-4">
          <ConnectButton label="Conectar Wallet" />
        </div>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-400">{globalTotal?.toString() ?? "0"}</div>
          <div className="text-gray-500 text-sm mt-1">Botellas globales</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-blue-400">5</div>
          <div className="text-gray-500 text-sm mt-1">ECO por plástico 🥤</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-yellow-400">10</div>
          <div className="text-gray-500 text-sm mt-1">ECO por aluminio 🥫</div>
        </div>
      </div>

      {/* Dashboard si está conectado */}
      {isConnected && (
        <div className="bg-gray-900 border border-green-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-green-400">Tu dashboard ♻️</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-4xl font-bold text-white">{ecoBalance}</div>
              <div className="text-green-400 text-sm mt-1">ECO tokens</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-4xl font-bold text-white">{bottlesRecycled}</div>
              <div className="text-gray-400 text-sm mt-1">Botellas recicladas</div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Link
              href="/reciclar"
              className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl text-center transition"
            >
              ♻️ Registrar botella
            </Link>
            <Link
              href="/stats"
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl text-center transition"
            >
              📊 Ver mis stats
            </Link>
          </div>
        </div>
      )}

      {/* Cómo funciona */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-white">¿Cómo funciona?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: "1", icon: "📱", title: "Conecta tu wallet", desc: "MetaMask, Coinbase o cualquier wallet EVM" },
            { step: "2", icon: "🗑️", title: "Lleva tu botella", desc: "Al contenedor inteligente con cámara ESP32" },
            { step: "3", icon: "💰", title: "Recibe ECO tokens", desc: "5 ECO por plástico · 10 ECO por aluminio" },
          ].map((item) => (
            <div key={item.step} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-bold text-white">{item.title}</div>
              <div className="text-gray-500 text-sm mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Monad badge */}
      <div className="text-center">
        <a
          href="https://monad-testnet.socialscan.io/address/0x7fFCcdD4b9Ae0a3cfCdA86c954AE8a1816Ec74C3"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition"
        >
          <span>🔗</span>
          <span>Contrato verificado en Monad Testnet</span>
        </a>
      </div>
    </div>
  );
}
