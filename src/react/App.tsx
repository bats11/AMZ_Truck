import React, { useState } from "react";
import CameraMenu from "./CameraMenu";

export default function App() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  return (
    <div
      id="app-container"
      style={{
        pointerEvents: "none", // React non blocca il canvas
      }}
    >
      {/* Colonna sinistra */}
      <div
        style={{
          flex: 7,
          pointerEvents: "auto",
          padding: "2rem 2rem 0 4rem",
        }}
      >
        <CameraMenu
          position="left"
          activeMenu={activeMenu}
          activeSubmenu={activeSubmenu}
          setActiveMenu={setActiveMenu}
          setActiveSubmenu={setActiveSubmenu}
        />
      </div>

      {/* Colonna destra */}
      <div
        style={{
          flex: 3,
          pointerEvents: "auto",
          padding: "2rem 4rem 0 2rem",
        }}
      >
        <CameraMenu
          position="right"
          activeMenu={activeMenu}
          activeSubmenu={activeSubmenu}
          setActiveMenu={setActiveMenu}
          setActiveSubmenu={setActiveSubmenu}
        />
      </div>
    </div>
  );
}
