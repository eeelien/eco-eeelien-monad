"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import dynamic from "next/dynamic";
const ConnectButton = dynamic(() => import("@rainbow-me/rainbowkit").then((mod) => mod.ConnectButton), { ssr: false });
import Link from "next/link";
import { RECYCLING_REGISTRY_ADDRESS, REGISTRY_ABI, BOTTLE_TYPES } from "@/lib/contracts";

export default function ReciclarPage() {
  const { address, isConnected } = useAccount();
  const [selectedBottle, setSelectedBottle] = useState<0 | 1>(0);
  const [txSuccess, setTxSuccess] = useState(false);

  const { writeContract, data: txHash, isPending, isError, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleRegister = () => {
    if (!address) return;
    setTxSuccess(false);
    writeContract(
      {
        address: RECYCLING_REGISTRY_ADDRESS,
        abi: REGISTRY_ABI,
        functionName: "registerBottle",
        args: [address, selectedBottle],
      },
      {
        onSuccess: () => setTxSuccess(true),
      }
    );
  };

  const bottle = BOTTLE_TYPES[selectedBottle];
  const isLoading = isPending || isConfirming;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">♻️ Registrar botella</h1>
        <p className="text-gray-400 mt-1">Selecciona el tipo y registra tu reciclaje on-chain</p>
      </div>

      {!isConnected ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center space-y-4">
          <div className="text-5xl">🔒</div>
          <p className="text-gray-400">Conecta tu wallet para registrar botellas</p>
          <ConnectButton label="Conectar Wallet" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Selector de tipo */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-white">Tipo de botella</h2>
            <div className="grid grid-cols-2 gap-3">
              {([0, 1] as const).map((type) => {
                const b = BOTTLE_TYPES[type];
                const isSelected = selectedBottle === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedBottle(type)}
                    className={`p-5 rounded-xl border-2 text-center transition ${
                      isSelected
                        ? "border-green-500 bg-green-500/10"
                        : "border-gray-700 bg-gray-800 hover:border-gray-600"
                    }`}
                  >
                    <div className="text-4xl mb-2">{b.emoji}</div>
                    <div className="font-bold text-white">{b.label}</div>
                    <div className="text-green-400 text-sm mt-1">+{b.reward} ECO</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex justify-between items-center">
            <div>
              <div className="text-gray-400 text-sm">Vas a ganar</div>
              <div className="text-2xl font-bold text-green-400">+{bottle.reward} ECO tokens</div>
            </div>
            <div className="text-4xl">{bottle.emoji}</div>
          </div>

          {/* Botón */}
          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-black disabled:text-gray-500 font-bold py-4 rounded-xl text-lg transition"
          >
            {isPending
              ? "⏳ Confirmando en wallet..."
              : isConfirming
              ? "⛓️ Procesando on-chain..."
              : `♻️ Registrar ${bottle.label}`}
          </button>

          {/* Estado de la tx */}
          {txHash && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
              <div className="text-sm text-gray-400">Transacción:</div>
              <a
                href={`https://monad-testnet.socialscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs break-all"
              >
                {txHash}
              </a>
            </div>
          )}

          {isConfirmed && (
            <div className="bg-green-900/30 border border-green-600 rounded-xl p-5 text-center space-y-2">
              <div className="text-4xl">🎉</div>
              <div className="text-green-400 font-bold text-lg">¡Reciclaje registrado!</div>
              <div className="text-gray-400 text-sm">+{bottle.reward} ECO tokens enviados a tu wallet</div>
              <Link
                href="/stats"
                className="inline-block mt-2 text-green-400 hover:text-green-300 text-sm underline"
              >
                Ver mis stats →
              </Link>
            </div>
          )}

          {isError && (
            <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-400 text-sm">
              ❌ {error?.message?.slice(0, 120)}...
            </div>
          )}

          {/* Info */}
          <p className="text-gray-600 text-xs text-center">
            En el evento físico, el ESP32-CAM registra esto automáticamente al detectar tu botella.
            Aquí puedes registrarlo manualmente para el demo.
          </p>
        </div>
      )}
    </div>
  );
}
