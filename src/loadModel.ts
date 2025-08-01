// loadModel.ts
import * as BABYLON from "@babylonjs/core";
import { MaterialManager } from "./materialManager";

export interface BoundingInfoData {
  min: BABYLON.Vector3;
  max: BABYLON.Vector3;
}

interface AnimationConfig {
  autoPlay?: boolean;
  stopAt?: "start" | "end";
  loop?: boolean;
}

const animationConfigs: Record<string, AnimationConfig> = {
  "TruckOnly.glb": { autoPlay: false },
  "Back Door.glb": { autoPlay: false, stopAt: "start" },
  "Inside Door.glb": { autoPlay: false, stopAt: "start" },
};

// ✅ Prefab cargo mesh disponibili per clonazione
export const cargoMeshesByName: Record<string, BABYLON.AbstractMesh> = {};

// ✅ Gruppi di animazione per ciascun file
export const animationGroupsByName: Record<string, BABYLON.AnimationGroup[]> = {};

export function loadModel(
  scene: BABYLON.Scene,
  onLoadComplete: (meshes: BABYLON.AbstractMesh[], boundingInfo: BoundingInfoData) => void,
  onFinish?: () => void
) {
  const baseUrl = "/assets/";
  const glbList = [
    "TruckOnly.glb", 
    "Back Door.glb", 
    "Inside Door.glb",
    "damage_DuctTape.glb",
    "damage_OilLeak.glb",
    "damage_OilLeakGround.glb",
    "damage_Crack.glb",
    "cargo_LoadingCart.glb",
    "cargo_AmzBag.glb",
    "cargo_HeavyBox.glb",
    "cargo_OverszBox.glb",
    "damage_Cut.glb"
  ];
  const totalModels = glbList.length;

  const materialManager = new MaterialManager(scene, baseUrl);
  const allMeshes: BABYLON.AbstractMesh[] = [];
  const hiddenDamageMeshNames: string[] = [];

  let modelsLoaded = 0;
  let globalMin: BABYLON.Vector3 | null = null;
  let globalMax: BABYLON.Vector3 | null = null;

  const onAllLoaded = () => {
    const center = globalMin!.add(globalMax!).scale(0.5);
    const root = new BABYLON.TransformNode("ModelRoot", scene);
    root.position = center;

    for (const mesh of allMeshes) {
      if (!cargoMeshesByName[mesh.name]) {
        mesh.receiveShadows = true;
        mesh.setParent(root, true);
      }
    }

    for (const name of hiddenDamageMeshNames) {
      const mesh = scene.getNodeByName(name);
      if (mesh && mesh instanceof BABYLON.AbstractMesh) {
        mesh.visibility = 0;
      }
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
        const isCargo = fileName.startsWith("cargo_");

        if (isCargo) {
          for (const mesh of meshes) {
            mesh.setEnabled(false);
            mesh.isPickable = false;
            mesh.checkCollisions = false;
            if (mesh instanceof BABYLON.Mesh) {
              cargoMeshesByName[mesh.name] = mesh;
            }
          }

          modelsLoaded++;
          if (modelsLoaded === totalModels) onAllLoaded();
          return;
        }

        allMeshes.push(...meshes);

        materialManager.prepareMaterialsForVisibility(meshes);

        if (fileName.startsWith("damage_")) {
          for (const mesh of meshes) {
            hiddenDamageMeshNames.push(mesh.name);
          }
        }

        const config = animationConfigs[fileName] ?? {};
        const baseKey = fileName.replace(".glb", "");

        if (!animationGroupsByName[baseKey]) {
          animationGroupsByName[baseKey] = [];
        }

        for (const group of container.animationGroups) {
          animationGroupsByName[baseKey].push(group);
          group.loopAnimation = config.loop ?? false;

          if (config.autoPlay) {
            group.play(true);
          } else {
            group.reset();
            group.play(false);
            if (config.stopAt === "end") {
              group.goToFrame(group.to);
            } else if (config.stopAt === "start") {
              group.goToFrame(group.from);
            }
            group.stop();
          }
        }

        if (fileName === "TruckOnly.glb") {
          for (const mesh of meshes) {
            const bb = mesh.getBoundingInfo().boundingBox;
            const min = bb.minimumWorld;
            const max = bb.maximumWorld;
            globalMin = globalMin ? BABYLON.Vector3.Minimize(globalMin, min) : min.clone();
            globalMax = globalMax ? BABYLON.Vector3.Maximize(globalMax, max) : max.clone();
          }
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
