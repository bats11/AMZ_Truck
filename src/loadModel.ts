// loadModel.ts
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
  const glbList = ["TruckOnly.glb","Back Door.glb"]; // Aggiungi altri glb qui
  const totalModels = glbList.length;

  const materialManager = new MaterialManager(scene, baseUrl);
  let modelsLoaded = 0;

  const allMeshes: BABYLON.AbstractMesh[] = [];
  let globalMin: BABYLON.Vector3 | null = null;
  let globalMax: BABYLON.Vector3 | null = null;

  const onAllLoaded = () => {
    // Calcola centro e crea il nodo root
    const center = globalMin!.add(globalMax!).scale(0.5);
    const root = new BABYLON.TransformNode("ModelRoot", scene);
    root.position = center;

    // Applica parent e ricezione ombre
    for (const mesh of allMeshes) {
      mesh.receiveShadows = true;
      mesh.setParent(root, true);
    }

    materialManager.configureGlassMaterial();

    const boundingInfo: BoundingInfoData = {
      min: globalMin!,
      max: globalMax!,
    };

    onLoadComplete(allMeshes, boundingInfo);
    if (onFinish) onFinish();
    (window as any).finishReactLoading?.();
  };

  for (const fileName of glbList) {
    BABYLON.SceneLoader.LoadAssetContainer(
      baseUrl,
      fileName,
      scene,
      (container) => {
        container.addAllToScene();

        const meshes = container.meshes.filter(m => m.name !== "__root__");
        allMeshes.push(...meshes);

        materialManager.prepareMaterialsForVisibility(meshes);

        // Calcolo bounding box globale
        for (const mesh of meshes) {
          const bb = mesh.getBoundingInfo().boundingBox;
          const min = bb.minimumWorld;
          const max = bb.maximumWorld;

          globalMin = globalMin ? BABYLON.Vector3.Minimize(globalMin, min) : min.clone();
          globalMax = globalMax ? BABYLON.Vector3.Maximize(globalMax, max) : max.clone();
        }

        modelsLoaded++;
        if (modelsLoaded === totalModels) onAllLoaded();
      },
      undefined,
      (err) => {
        console.error(`❌ Error loading ${fileName}:`, err);
      }
    );
  }
}
