// src/loadModel.ts
import * as BABYLON from "@babylonjs/core";
import { MaterialManager } from "./materialManager";

export interface BoundingInfoData {
  min: BABYLON.Vector3;
  max: BABYLON.Vector3;
}

export function loadModel(
  scene: BABYLON.Scene,
  onLoadComplete: (meshes: BABYLON.AbstractMesh[], boundingInfo: BoundingInfoData) => void
) {
  const loadingOverlay = document.getElementById("loadingOverlay")!;
  const loadingBar = document.getElementById("loadingBar")!;
  const progressText = document.getElementById("progressText")!;

  const baseUrl = "/assets/";
  const materialManager = new MaterialManager(scene, baseUrl);

  let modelsLoaded = 0;
  const totalModels = 1;
  let firstMeshes: BABYLON.AbstractMesh[] = [];
  let boundingInfo!: BoundingInfoData;

  const handleProgress = (event: BABYLON.ISceneLoaderProgressEvent) => {
    if (event.lengthComputable) {
      const percent = Math.round((event.loaded / event.total) * 100 / totalModels);
      const current = parseFloat(loadingBar.style.width) || 0;
      loadingBar.style.width = `${Math.min(current + percent, 90)}%`;
      progressText.textContent = `${Math.round(parseFloat(loadingBar.style.width))}%`;
    }
  };

  const onAllLoaded = () => {
    onLoadComplete(firstMeshes, boundingInfo);
    loadingBar.style.width = "100%";
    progressText.textContent = "100%";
    setTimeout(() => {
      loadingOverlay.style.opacity = "0";
      setTimeout(() => loadingOverlay.style.display = "none", 500);
    }, 500);
  };

  BABYLON.SceneLoader.LoadAssetContainer(
    baseUrl, "TruckOnly.glb", scene,
    (container) => {
      container.addAllToScene();

      const meshes = container.meshes.filter(m => m.name !== "__root__");
      firstMeshes = meshes;

      // Calcola bounding box prima del parenting
      let min = meshes[0].getBoundingInfo().boundingBox.minimumWorld.clone();
      let max = meshes[0].getBoundingInfo().boundingBox.maximumWorld.clone();

      for (const mesh of meshes) {
        const bb = mesh.getBoundingInfo().boundingBox;
        min = BABYLON.Vector3.Minimize(min, bb.minimumWorld);
        max = BABYLON.Vector3.Maximize(max, bb.maximumWorld);
      }

      const center = min.add(max).scale(0.5);
      boundingInfo = { min, max };

      // Crea il nodo root e lo posiziona PRIMA del parenting
      const root = new BABYLON.TransformNode("ModelRoot", scene);
      root.position = center;

      // Parent mantenendo la posizione world
      for (const mesh of meshes) {
        mesh.receiveShadows = true;
        mesh.setParent(root, true); // true = mantieni world pos
      }

      materialManager.configureGlassMaterial();

      modelsLoaded++;
      if (modelsLoaded === totalModels) onAllLoaded();
    },
    handleProgress,
    (err) => {
      console.error("Error loading TruckOnly.glb:", err);
      loadingBar.style.backgroundColor = "#f44336";
      progressText.textContent = "Error loading model!";
    }
  );
}
