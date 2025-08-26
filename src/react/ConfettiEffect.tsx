// src/react/ConfettiEffect.tsx
import { useEffect } from "react";

// ✅ dichiaro a TS che esiste window.confetti (esposta dallo script esterno)
declare global {
  interface Window {
    confetti: (opts?: any) => void;
  }
}

export default function ConfettiEffect() {
  useEffect(() => {
    // carico dinamicamente lo script confetti
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/@tsparticles/confetti@3.0.3/tsparticles.confetti.bundle.min.js";
    script.async = true;

    script.onload = () => {
      if (!window.confetti) {
        console.warn("⚠️ confetti non disponibile dopo il caricamento script.");
        return;
      }

      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
      };

      function fire(particleRatio: number, opts: any) {
        window.confetti(
          Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio),
          })
        );
      }

      // 🎉 sequenza colpi di confetti
      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });

      fire(0.2, {
        spread: 60,
      });

      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    };

    document.body.appendChild(script);

    // pulizia al dismount
    return () => {
      script.remove();
    };
  }, []);

  return null;
}
