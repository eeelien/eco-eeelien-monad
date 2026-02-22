"use client";

import { useState } from "react";
import Link from "next/link";

type DetectionStep = "idle" | "detecting" | "classifying" | "registering" | "done";
type Material = "plastic" | "aluminum";

export default function ESP32Page() {
  const [step, setStep] = useState<DetectionStep>("idle");
  const [material, setMaterial] = useState<Material>("plastic");
  const [history, setHistory] = useState<Array<{ material: Material; time: string; eco: number }>>([]);

  const simulate = (mat: Material) => {
    setMaterial(mat);
    setStep("detecting");
    setTimeout(() => setStep("classifying"), 1500);
    setTimeout(() => setStep("registering"), 3000);
    setTimeout(() => {
      setStep("done");
      setHistory((prev) => [
        { material: mat, time: new Date().toLocaleTimeString(), eco: mat === "plastic" ? 5 : 10 },
        ...prev,
      ]);
    }, 4500);
    setTimeout(() => setStep("idle"), 7000);
  };

  const stepInfo: Record<DetectionStep, { label: string; color: string }> = {
    idle: { label: "Esperando botella...", color: "text-gray-500" },
    detecting: { label: "Objeto detectado — sensor IR activado", color: "text-yellow-400" },
    classifying: { label: "Analizando material con IA...", color: "text-[#836EF9]" },
    registering: { label: "Registrando en Monad...", color: "text-emerald-400" },
    done: { label: "Reciclaje registrado on-chain", color: "text-emerald-300" },
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1e3a24] bg-[#111f14] text-emerald-400 text-xs mb-4">
          Simulación de hardware
        </div>
        <h1 className="text-3xl font-bold text-white">Contenedor Inteligente ESP32</h1>
        <p className="text-gray-500 mt-2 leading-relaxed">
          El corazón de Eco Eeelien es un contenedor de reciclaje equipado con una cámara ESP32-CAM 
          que detecta y clasifica automáticamente cada botella.
        </p>
      </div>

      <div className="eco-card p-8 space-y-6">
        <h2 className="text-sm uppercase tracking-wider text-gray-500">Arquitectura del contenedor</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0c1a0e] border border-[#1e3a24] flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="font-semibold text-white text-sm">ESP32-CAM</div>
            <div className="text-gray-600 text-xs">Captura imagen al detectar movimiento con sensor IR</div>
          </div>
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0c1a0e] border border-[#1e3a24] flex items-center justify-center">
              <svg className="w-7 h-7 text-[#836EF9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="font-semibold text-white text-sm">Clasificación IA</div>
            <div className="text-gray-600 text-xs">Modelo TFLite identifica plástico vs aluminio</div>
          </div>
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0c1a0e] border border-[#1e3a24] flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="font-semibold text-white text-sm">Monad Blockchain</div>
            <div className="text-gray-600 text-xs">Registro on-chain instantáneo y tokens ECO</div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 pt-4 text-xs text-gray-600">
          <span className="px-2 py-1 rounded bg-[#0c1a0e] border border-[#1e3a24]">Sensor IR</span>
          <span>→</span>
          <span className="px-2 py-1 rounded bg-[#0c1a0e] border border-[#1e3a24]">Cámara</span>
          <span>→</span>
          <span className="px-2 py-1 rounded bg-[#0c1a0e] border border-[#1e3a24]">Clasificar</span>
          <span>→</span>
          <span className="px-2 py-1 rounded bg-[#0c1a0e] border border-[#1e3a24]">Backend</span>
          <span>→</span>
          <span className="px-2 py-1 rounded bg-[#0c1a0e] border border-emerald-800 text-emerald-400">Monad</span>
        </div>
      </div>

      <div className="eco-card p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-wider text-gray-500">Simulador en vivo</h2>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${step === "idle" ? "bg-gray-600" : "bg-emerald-400 animate-pulse"}`}></div>
            <span className="text-xs text-gray-600">{step === "idle" ? "Standby" : "Procesando"}</span>
          </div>
        </div>
        <div className="bg-[#050d07] rounded-xl p-6 font-mono text-sm space-y-2 border border-[#1a2e1e]">
          <div className="text-gray-600 text-xs mb-3">eco_eeelien_cam v1.0 — Serial Monitor</div>
          <div className="text-emerald-400/60">$ WiFi conectado: 192.168.1.42</div>
          <div className="text-emerald-400/60">$ eco eeelien ESP32-CAM listo</div>
          <div className={`transition-all duration-300 ${stepInfo[step].color}`}>
            $ {stepInfo[step].label}
          </div>
          {step === "classifying" && (
            <div className="text-[#836EF9]">$ Material detectado: {material === "plastic" ? "PLÁSTICO (PET)" : "ALUMINIO"}</div>
          )}
          {step === "registering" && (
            <div className="text-emerald-400/80">$ Enviando tx a Monad (chain 10143)...</div>
          )}
          {step === "done" && (
            <>
              <div className="text-emerald-300">$ {material === "plastic" ? "Plástico" : "Aluminio"} registrado — +{material === "plastic" ? 5 : 10} ECO tokens</div>
              <div className="text-gray-600 text-xs">$ tx: 0x{Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join("")}...</div>
            </>
          )}
          <div className="text-gray-700 animate-pulse">_</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => simulate("plastic")} disabled={step !== "idle"}
            className={`p-5 rounded-xl border-2 text-center transition-all ${step !== "idle" ? "border-[#1e3a24] opacity-40 cursor-not-allowed" : "border-[#1e3a24] hover:border-emerald-500 hover:bg-emerald-500/5"}`}>
            <div className="text-2xl mb-2">🧴</div>
            <div className="font-semibold text-white text-sm">Simular plástico</div>
            <div className="text-emerald-400 text-xs font-mono mt-1">+5 ECO</div>
          </button>
          <button onClick={() => simulate("aluminum")} disabled={step !== "idle"}
            className={`p-5 rounded-xl border-2 text-center transition-all ${step !== "idle" ? "border-[#1e3a24] opacity-40 cursor-not-allowed" : "border-[#1e3a24] hover:border-[#836EF9] hover:bg-[#836EF9]/5"}`}>
            <div className="text-2xl mb-2">🥫</div>
            <div className="font-semibold text-white text-sm">Simular aluminio</div>
            <div className="text-emerald-400 text-xs font-mono mt-1">+10 ECO</div>
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div className="eco-card p-6 space-y-4">
          <h2 className="text-sm uppercase tracking-wider text-gray-500">Historial de detecciones</h2>
          <div className="space-y-2">
            {history.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[#1e3a24] last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.material === "plastic" ? "bg-blue-400" : "bg-gray-400"}`}></div>
                  <span className="text-sm text-gray-300">{item.material === "plastic" ? "Plástico" : "Aluminio"}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-emerald-400 text-sm font-mono">+{item.eco} ECO</span>
                  <span className="text-gray-600 text-xs">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="eco-card p-6 space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-gray-500">Especificaciones técnicas</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div><div className="text-gray-600 text-xs">Microcontrolador</div><div className="text-gray-300">ESP32-CAM (AI Thinker)</div></div>
            <div><div className="text-gray-600 text-xs">Sensor</div><div className="text-gray-300">Infrarrojo (detección)</div></div>
            <div><div className="text-gray-600 text-xs">Clasificación</div><div className="text-gray-300">TFLite / Color</div></div>
          </div>
          <div className="space-y-3">
            <div><div className="text-gray-600 text-xs">Conectividad</div><div className="text-gray-300">WiFi → API → Monad</div></div>
            <div><div className="text-gray-600 text-xs">Feedback</div><div className="text-gray-300">LED RGB + Buzzer</div></div>
            <div><div className="text-gray-600 text-xs">Blockchain</div><div className="text-gray-300">Monad (Chain 10143)</div></div>
          </div>
        </div>
      </div>

      <div className="text-center space-y-3">
        <p className="text-gray-500 text-sm">El hardware no está presente físicamente en esta demo. Prueba el flujo de registro manual.</p>
        <Link href="/reciclar" className="inline-block btn-primary">Ir a registrar reciclaje</Link>
      </div>
    </div>
  );
}
