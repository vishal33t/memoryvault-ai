"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MemoryVaultSplash() {
  const router = useRouter();

  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    setVisible(true);

    const timer = setTimeout(() => {
      enterMemoryVault();
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  function playSound() {
    if (soundEnabled) {
      return;
    }

    const audioContext =
      new (window.AudioContext ||
        window.webkitAudioContext)();

    const oscillator =
      audioContext.createOscillator();

    const gain =
      audioContext.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
      220,
      audioContext.currentTime
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      440,
      audioContext.currentTime + 0.5
    );

    gain.gain.setValueAtTime(
      0.0001,
      audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.12,
      audioContext.currentTime + 0.1
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audioContext.currentTime + 0.8
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(
      audioContext.currentTime + 0.8
    );

    setSoundEnabled(true);
  }

  function enterMemoryVault() {
    playSound();

    setLeaving(true);

    setTimeout(() => {
      router.push("/entry");
    }, 700);
  }

  return (
    <main
      className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white transition-opacity duration-700 ${
        leaving
          ? "opacity-0"
          : "opacity-100"
      }`}
    >
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl animate-pulse" />
      </div>

      {/* Main content */}
      <div
        className={`relative z-10 flex flex-col items-center text-center transition-all duration-1000 ${
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
        }`}
      >
        {/* Logo */}
        <div className="relative mb-8">

          {/* Outer ring */}
          <div className="flex h-32 w-32 items-center justify-center rounded-full border border-white/20 animate-[spin_8s_linear_infinite]">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/30">
              <div className="text-5xl">
                🧠
              </div>
            </div>
          </div>

          {/* Glow */}
          <div className="absolute inset-0 -z-10 rounded-full bg-white/20 blur-2xl animate-pulse" />
        </div>

        {/* Brand */}
        <h1 className="text-4xl font-bold tracking-[0.2em] sm:text-6xl">
          MEMORYVAULT
        </h1>

        <p className="mt-4 max-w-md px-6 text-sm text-gray-400 sm:text-base">
          Your personal memory system,
          organized intelligently by AI.
        </p>

        {/* Loading line */}
        <div className="mt-10 h-1 w-48 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full origin-left animate-[loading_3.5s_linear_forwards] bg-white" />
        </div>

        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-gray-500">
          Initializing memory vault
        </p>

        {/* Enter button */}
        <button
          onClick={enterMemoryVault}
          className="mt-8 rounded-full border border-white/20 px-6 py-3 text-sm text-gray-300 transition hover:border-white/50 hover:bg-white/10 hover:text-white"
        >
          Enter MemoryVault
        </button>

        {/* Sound */}
        <button
          onClick={playSound}
          className="mt-4 text-xs text-gray-500 transition hover:text-white"
        >
          {soundEnabled
            ? "🔊 Sound enabled"
            : "🔈 Enable sound"}
        </button>
      </div>

      <style jsx>{`
        @keyframes loading {
          from {
            transform: scaleX(0);
          }

          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </main>
  );
}