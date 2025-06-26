import * as BABYLON from "@babylonjs/core";

/**
 * Imposta l'illuminazione di base e carica una environment texture HDR (IBL).
 */
export function setupLighting(scene: BABYLON.Scene) {
  try {

    

    // Carica una HDR e la usa come environment texture
    const hdrTexture = new BABYLON.HDRCubeTexture(
      "/assets/studio_small_08_4k.hdr",
      scene,
      512, // dimensione (512 è un buon compromesso, ma puoi usare 256/1024)
      false, // no mipmaps
      true,  // generateHarmonics (utile per irradiance ambientale)
      false, // gammaSpace
      true   // prefilterOnLoad
    );

    hdrTexture.onLoadObservable.addOnce(() => {
      console.log("HDR environment texture caricata.");
    });

    // Applica la texture alla scena
    scene.environmentTexture = hdrTexture;

    // Imposta l’intensità IBL
    scene.environmentIntensity = 1;

    scene.clearColor = BABYLON.Color4.FromHexString("#00000000"); // equivalente


  } catch (err) {
    console.error("Errore durante il caricamento dell'environment HDR:", err);
    throw err;
  }
}
