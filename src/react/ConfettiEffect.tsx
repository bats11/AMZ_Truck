// src/react/ConfettiEffect.tsx
import { useEffect } from "react";

// ✅ DICHIARAZIONI GLOBALI per evitare errori TypeScript
declare global {
  interface Window {
    tsParticles: any;
    loadConfettiPreset: (engine: any) => Promise<void>;
  }
}

export default function ConfettiEffect() {
  useEffect(() => {
    const id = "tsparticles";

    const div = document.createElement("div");
    div.id = id;
    div.style.position = "fixed";
    div.style.left = "0";
    div.style.top = "0";
    div.style.width = "100%";
    div.style.height = "100%";
    div.style.zIndex = "9999";
    div.style.pointerEvents = "none";
    div.style.background = "transparent";
    document.body.appendChild(div);

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@tsparticles/preset-confetti@3.2.0/tsparticles.preset.confetti.bundle.min.js";
    script.async = true;

    script.onload = async () => {
      if (window.tsParticles && window.loadConfettiPreset) {
        await window.loadConfettiPreset(window.tsParticles);
        await window.tsParticles.load({
          id,
          options: { preset: "confetti" },
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      window.tsParticles?.domItem?.(id)?.destroy?.();
      document.getElementById(id)?.remove();
      script.remove();
    };
  }, []);

  return null;
}
