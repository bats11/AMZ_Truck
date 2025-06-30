import React, { useState, useEffect } from "react";

export default function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("🔧 React: espongo finishReactLoading su window");
    (window as any).finishReactLoading = () => {
      console.log("✅ React: finishReactLoading è stato chiamato");
      setIsLoading(false);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="spinner" />
      <p className="loading-text">Loading...</p>
    </div>
  );
}
