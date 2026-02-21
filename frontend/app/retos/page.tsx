"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import { CHALLENGE_MANAGER_ADDRESS, CHALLENGE_MANAGER_ABI } from "@/lib/contracts";

const BADGE_EMOJIS: Record<string, string> = {
  SEED: "🌱", PLANT: "🥤", WAVE: "🌿", CAN: "🥫", WORLD: "🌍", RECYCLE: "♻️",
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

  const challenges   = data?.[0] ?? [];
  const completed    = data?.[1] ?? [];
  const progress     = data?.[2] ?? [];
  const hasPending   = challenges.some((c, i) =>
    !completed[i] && Number(progress[i]) >= Number(c.target)
  );

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">🏆 Retos de Reciclaje</h1>
        <p className="text-gray-400 mt-1">Completa retos y gana ECO tokens de bonus</p>
      </div>

      {!isConnected ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center space-y-4">
          <div className="text-5xl">🔒</div>
          <p className="text-gray-400">Conecta tu wallet para ver tus retos</p>
          <ConnectButton label="Conectar Wallet" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Botón de reclamar si hay pendientes */}
          {hasPending && (
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-yellow-400 font-bold">¡Tienes retos completados!</div>
                <div className="text-gray-400 text-sm">Reclama tus ECO tokens de bonus</div>
              </div>
              <button
                onClick={handleClaim}
                disabled={isPending}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-xl text-sm transition"
              >
                {isPending ? "⏳..." : "🎁 Reclamar"}
              </button>
            </div>
          )}

          {isSuccess && (
            <div className="bg-green-900/30 border border-green-600 rounded-xl p-4 text-center text-green-400 font-bold">
              🎉 ¡Bonus reclamado! Revisa tu balance ECO
            </div>
          )}

          {/* Lista de retos */}
          {challenges.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500">
              Cargando retos...
            </div>
          ) : (
            challenges.map((challenge, i) => {
              const isCompleted = completed[i];
              const currentProgress = Number(progress[i]);
              const target = Number(challenge.target);
              const pct = Math.min((currentProgress / target) * 100, 100);
              const bonus = Number(formatEther(challenge.bonusReward)).toFixed(0);
              const emoji = BADGE_EMOJIS[challenge.badge] ?? "🏅";

              return (
                <div
                  key={i}
                  className={`bg-gray-900 border rounded-xl p-5 ${
                    isCompleted ? "border-green-700 opacity-70" : "border-gray-700"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{emoji}</span>
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          {challenge.name}
                          {isCompleted && <span className="text-green-400 text-xs bg-green-900/50 px-2 py-0.5 rounded-full">✅ Completado</span>}
                        </div>
                        <div className="text-gray-400 text-sm">{challenge.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">+{bonus} ECO</div>
                      <div className="text-gray-500 text-xs">bonus</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progreso</span>
                      <span>{currentProgress}/{target}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${isCompleted ? "bg-green-600" : "bg-green-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
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
