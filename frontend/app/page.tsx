"use client";

import dynamic from "next/dynamic";

const ConnectButton = dynamic(
  () => import("@rainbow-me/rainbowkit").then((mod) => mod.ConnectButton),
  { ssr: false }
);
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
    <div className="space-y-16 leaf-pattern">
      {/* Hero */}
      <section className="text-center py-16 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#1e3a24] bg-[#111f14] text-emerald-400 text-sm mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          Live en Monad Testnet
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
          Recicla. Gana.<br />
          <span className="eco-gradient-text">Impacta el planeta.</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Registra tus botellas recicladas y recibe tokens ECO como recompensa. 
          Tecnología blockchain al servicio del medio ambiente.
        </p>
        <div className="pt-4 flex justify-center">
          <ConnectButton label="Conectar Wallet" />
        </div>
      </section>

      {/* Global stats */}
      <section className="grid grid-cols-3 gap-4">
        <div className="eco-card p-6 text-center">
          <div className="text-3xl font-bold text-emerald-400">{globalTotal?.toString() ?? "0"}</div>
          <div className="text-gray-500 text-sm mt-2">Botellas recicladas</div>
        </div>
        <div className="eco-card p-6 text-center">
          <div className="text-3xl font-bold text-emerald-400">5 / 10</div>
          <div className="text-gray-500 text-sm mt-2">ECO por plástico / aluminio</div>
        </div>
        <div className="eco-card p-6 text-center">
          <div className="text-3xl font-bold text-[#836EF9]">Monad</div>
          <div className="text-gray-500 text-sm mt-2">Blockchain de alta velocidad</div>
        </div>
      </section>

      {/* Dashboard */}
      {isConnected && (
        <section className="eco-card p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            <h2 className="text-xl font-bold text-white">Tu panel de impacto</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0c1a0e] rounded-xl p-5 text-center">
              <div className="text-4xl font-bold text-emerald-400">{ecoBalance}</div>
              <div className="text-gray-500 text-sm mt-2">ECO tokens</div>
            </div>
            <div className="bg-[#0c1a0e] rounded-xl p-5 text-center">
              <div className="text-4xl font-bold text-white">{bottlesRecycled}</div>
              <div className="text-gray-500 text-sm mt-2">Botellas recicladas</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/reciclar" className="flex-1 btn-primary text-center block">Registrar botella</Link>
            <Link href="/stats" className="flex-1 btn-secondary text-center block">Ver impacto completo</Link>
          </div>
        </section>
      )}

      {/* Cómo funciona */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Cómo funciona</h2>
          <p className="text-gray-500 mt-2">De tu botella al blockchain en segundos</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: "01", title: "Conecta tu wallet", desc: "MetaMask o cualquier wallet EVM compatible con Monad" },
            { step: "02", title: "Recicla tu botella", desc: "Llévala al contenedor inteligente con sensor ESP32" },
            { step: "03", title: "Detección automática", desc: "La cámara identifica el material: plástico o aluminio" },
            { step: "04", title: "Recibe recompensa", desc: "Los tokens ECO llegan directamente a tu wallet" },
          ].map((item) => (
            <div key={item.step} className="eco-card eco-card-hover p-6 space-y-3">
              <div className="text-xs font-mono text-emerald-400/60">{item.step}</div>
              <div className="font-semibold text-white">{item.title}</div>
              <div className="text-gray-500 text-sm leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ESP32 */}
      <section className="eco-card p-8 md:p-12 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
          <h2 className="text-sm uppercase tracking-wider text-gray-500">Pieza central</h2>
        </div>
        <h3 className="text-2xl font-bold text-white">Contenedor inteligente con ESP32-CAM</h3>
        <p className="text-gray-400 leading-relaxed">
          El problema del reciclaje no es la voluntad — es la infraestructura. Eco Eeelien elimina 
          la necesidad de contenedores tradicionales caros. Un microcontrolador ESP32 con cámara, 
          un sensor infrarrojo y conexión WiFi es todo lo que necesitas para crear un punto de 
          reciclaje inteligente y conectado a blockchain.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-[#0c1a0e] rounded-xl p-5 space-y-2">
            <div className="text-emerald-400 font-semibold text-sm">Detección automática</div>
            <div className="text-gray-500 text-xs leading-relaxed">Sensor IR detecta la botella. La cámara captura la imagen.</div>
          </div>
          <div className="bg-[#0c1a0e] rounded-xl p-5 space-y-2">
            <div className="text-[#836EF9] font-semibold text-sm">Clasificación por IA</div>
            <div className="text-gray-500 text-xs leading-relaxed">Modelo TFLite distingue plástico de aluminio en milisegundos.</div>
          </div>
          <div className="bg-[#0c1a0e] rounded-xl p-5 space-y-2">
            <div className="text-emerald-400 font-semibold text-sm">Registro en Monad</div>
            <div className="text-gray-500 text-xs leading-relaxed">Transacción automática. Tokens ECO al usuario sin tocar nada.</div>
          </div>
        </div>
        <div className="pt-2">
          <Link href="/esp32" className="btn-secondary inline-block text-sm">Ver simulación del ESP32 →</Link>
        </div>
      </section>

      {/* Tech stack */}
      <section className="flex justify-center gap-8 py-4">
        {[
          { name: "ESP32-CAM", sub: "Hardware IoT", color: "text-emerald-400" },
          { name: "Monad", sub: "Blockchain", color: "text-[#836EF9]" },
          { name: "Solidity", sub: "Smart Contracts", color: "text-emerald-400" },
          { name: "Next.js", sub: "Frontend", color: "text-[#836EF9]" },
        ].map((item, i) => (
          <div key={i} className="text-center flex items-center gap-4">
            <div>
              <div className={`text-sm font-semibold ${item.color}`}>{item.name}</div>
              <div className="text-xs text-gray-600">{item.sub}</div>
            </div>
            {i < 3 && <span className="text-gray-700">·</span>}
          </div>
        ))}
      </section>

      {/* CTA */}
      {!isConnected && (
        <section className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Empieza a reciclar hoy</h2>
          <p className="text-gray-500">Conecta tu wallet y registra tu primera botella</p>
          <div className="flex justify-center">
            <ConnectButton label="Comenzar" />
          </div>
        </section>
      )}
    </div>
  );
}
