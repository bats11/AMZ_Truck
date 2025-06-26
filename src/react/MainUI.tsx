import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

export function mountUI() {
  let container = document.getElementById("react-root");

  if (!container) {
    container = document.createElement("div");
    container.id = "react-root";
    document.body.appendChild(container);
  }

  const root = ReactDOM.createRoot(container);
  root.render(<App />);
}
