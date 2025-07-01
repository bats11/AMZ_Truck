import React, { useState, useEffect } from "react";

export default function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (window as any).finishReactLoading = () => {
      setIsLoading(false);
      window.dispatchEvent(new Event("react-loading-finished"));
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
