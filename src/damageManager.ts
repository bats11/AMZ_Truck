// src/damageManager.ts

/**
 * Mostra una scritta temporanea a video per indicare che il danno è stato attivato.
 */
export function handleDamage(): void {
  let existing = document.getElementById("damage-overlay");

  if (!existing) {
    existing = document.createElement("div");
    existing.id = "damage-overlay";
    existing.textContent = "damage visible triggered";
    existing.style.position = "absolute";
    existing.style.top = "50%";
    existing.style.left = "50%";
    existing.style.transform = "translate(-50%, -50%)";
    existing.style.fontSize = "2.5rem";
    existing.style.fontFamily = "EmberCondensedBold, sans-serif";
    existing.style.color = "#d80000";
    existing.style.backgroundColor = "rgba(255,255,255,0.95)";
    existing.style.padding = "1rem 2rem";
    existing.style.borderRadius = "1rem";
    existing.style.boxShadow = "0 0 2rem rgba(0,0,0,0.4)";
    existing.style.zIndex = "999";
    existing.style.pointerEvents = "none";
    document.body.appendChild(existing);
  }

  existing.style.opacity = "1";

  setTimeout(() => {
    if (existing) {
      existing.style.transition = "opacity 1.2s ease";
      existing.style.opacity = "0";
      setTimeout(() => {
        existing?.remove();
      }, 1300);
    }
  }, 1000);
}
