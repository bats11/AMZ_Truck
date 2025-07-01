import React, { useEffect, useState } from "react";

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
    </div>
  );
}
