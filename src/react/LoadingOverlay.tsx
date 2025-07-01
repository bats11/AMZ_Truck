import React, { useState, useEffect } from "react";

export default function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(true);
  const [gifKey, setGifKey] = useState(0); // 🔁 forza il rendering in Firefox

  useEffect(() => {
    (window as any).finishReactLoading = () => {
      setIsLoading(false);
      window.dispatchEvent(new Event("react-loading-finished"));
    };

    // Forza il mount della GIF su Firefox
    setGifKey(Date.now());
  }, []);

  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      {/* ✅ GIF visibile sopra lo spinner */}
      <img
        key={gifKey}
        src={`/assets/loading-logo.gif?tick=${gifKey}`}
        alt=""
        className="loading-gif"
      />
      <div className="spinner" />
    </div>
  );
}
