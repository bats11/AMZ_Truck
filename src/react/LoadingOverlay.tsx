import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function LoadingOverlay() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const [gifKey, setGifKey] = useState(0);

  useEffect(() => {
    (window as any).finishReactLoading = () => {
      setIsVisible(false); // 🔁 parte il fade-out
      window.dispatchEvent(new Event("react-loading-finished"));
    };

    setGifKey(Date.now());
  }, []);

  // 🔁 Dopo l'animazione, smonta il componente
  const handleAnimationEnd = () => {
    if (!isVisible) setShouldRender(false);
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`loading-overlay ${!isVisible ? "fade-out" : ""}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <img
        key={gifKey}
        src={`/assets/loading-logo.gif?tick=${gifKey}`}
        alt=""
        className="loading-gif"
      />
      <div
  className={`loading-overlay ${!isVisible ? "fade-out" : ""}`}
  onAnimationEnd={handleAnimationEnd}
>
  <img
    key={gifKey}
    src={`/assets/loading-logo.gif?tick=${gifKey}`}
    alt=""
    className="loading-gif"
  />
  <motion.div
  className="spinner-dot"
  initial="initial"
  animate="animate"
  variants={{
    animate: {
      transition: {
        staggerChildren: 0.2,
        repeat: Infinity,
      },
    },
  }}
  style={{ transform: "translateY(-1rem)" }}
>
  {[0, 1, 2].map((i) => (
    <motion.div
          key={i}
          className="spinner-dot-item"
          variants={{
            initial: { scale: 0.8, opacity: 0.5 },
            animate: {
              scale: [0.8, 1.2, 0.8],
              opacity: [0.5, 1, 0.5],
              transition: {
                duration: 1.2,
                ease: "easeInOut",
                repeat: Infinity,
              },
            },
          }}
        />
      ))}
    </motion.div>


</div>

    </div>
  );
}
