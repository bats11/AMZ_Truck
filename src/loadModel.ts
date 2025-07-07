import * as BABYLON from "@babylonjs/core";
import { MaterialManager } from "./materialManager";

export interface BoundingInfoData {
  min: BABYLON.Vector3;
  max: BABYLON.Vector3;
}

export function loadModel(
  scene: BABYLON.Scene,
  onLoadComplete: (meshes: BABYLON.AbstractMesh[], boundingInfo: BoundingInfoData) => void,
  onFinish?: () => void
) {
  const baseUrl = "/assets/";
  const materialManager = new MaterialManager(scene, baseUrl);

  let modelsLoaded = 0;
  const totalModels = 1;
  let firstMeshes: BABYLON.AbstractMesh[] = [];
  let boundingInfo!: BoundingInfoData;

  const onAllLoaded = () => {
    onLoadComplete(firstMeshes, boundingInfo);

    // ✅ Fine caricamento — notifico React
    if (onFinish) onFinish();
    (window as any).finishReactLoading?.();
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

      const root = new BABYLON.TransformNode("ModelRoot", scene);
      root.position = center;

      for (const mesh of meshes) {
        mesh.receiveShadows = true;
        mesh.setParent(root, true);
      }

      materialManager.configureGlassMaterial();

      modelsLoaded++;
      if (modelsLoaded === totalModels) onAllLoaded();
    },
    undefined,
    (err) => {
      console.error("Error loading TruckOnly.glb:", err);
    }
  );
}
