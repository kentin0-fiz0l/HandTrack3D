import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Raycaster, Vector3, Mesh, PlaneGeometry, MeshStandardMaterial } from 'three';
import { useSceneStore } from '@/stores/sceneStore';
import { useBuildModeStore } from '@/stores/buildModeStore';
import { useHintsStore } from '@/stores/hintsStore';
import type { SceneObject } from '@/types/scene.types';

interface BuildModeControllerProps {
  selectedType: SceneObject['type'];
  selectedColor: string;
  selectedSize: number;
}

export function BuildModeController({
  selectedType,
  selectedColor,
  selectedSize,
}: BuildModeControllerProps) {
  const { camera, gl, scene } = useThree();
  const buildMode = useBuildModeStore((state) => state.enabled);
  const gridSnapEnabled = useBuildModeStore((state) => state.gridSnapEnabled);
  const gridSnapSize = useBuildModeStore((state) => state.gridSnapSize);
  const setGhostPreview = useSceneStore((state) => state.setGhostPreview);
  const addObject = useSceneStore((state) => state.addObject);
  const incrementObjectsSpawned = useHintsStore((state) => state.incrementObjectsSpawned);

  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector3());
  const groundPlane = useRef<Mesh | null>(null);

  useEffect(() => {
    if (!buildMode) {
      setGhostPreview(null);
      return;
    }

    // Create an invisible ground plane for raycasting
    const planeGeometry = new PlaneGeometry(100, 100);
    const planeMaterial = new MeshStandardMaterial({
      visible: false,
    });
    groundPlane.current = new Mesh(planeGeometry, planeMaterial);
    groundPlane.current.rotation.x = -Math.PI / 2;
    groundPlane.current.position.y = 0;
    scene.add(groundPlane.current);

    return () => {
      if (groundPlane.current) {
        scene.remove(groundPlane.current);
        groundPlane.current = null;
      }
    };
  }, [buildMode, scene, setGhostPreview]);

  useEffect(() => {
    if (!buildMode) return;

    const handleMouseMove = (event: MouseEvent) => {
      // Convert mouse position to normalized device coordinates (-1 to +1)
      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update raycaster
      raycaster.current.setFromCamera(mouse.current, camera);

      // Find intersection with ground plane
      if (groundPlane.current) {
        const intersects = raycaster.current.intersectObject(groundPlane.current);
        if (intersects.length > 0) {
          const point = intersects[0].point;

          // Apply grid snapping if enabled
          let finalX = point.x;
          let finalZ = point.z;

          if (gridSnapEnabled) {
            finalX = Math.round(point.x / gridSnapSize) * gridSnapSize;
            finalZ = Math.round(point.z / gridSnapSize) * gridSnapSize;
          }

          const finalY = 0.5 * selectedSize; // Half the object height above ground

          // Update ghost preview
          const ghostObject: SceneObject = {
            id: 'ghost-preview',
            type: selectedType,
            position: [finalX, finalY, finalZ],
            rotation: [0, 0, 0],
            scale: selectedSize,
            color: selectedColor,
          };

          setGhostPreview(ghostObject);
        }
      }
    };

    const handleClick = (event: MouseEvent) => {
      // Only handle left click
      if (event.button !== 0) return;

      // Get the current ghost preview position
      const ghostPreview = useSceneStore.getState().ghostPreview;
      if (ghostPreview) {
        // Create a real object at the ghost position
        const newObject: SceneObject = {
          ...ghostPreview,
          id: `${selectedType}-${Date.now()}`,
        };

        addObject(newObject);
        incrementObjectsSpawned();
      }
    };

    gl.domElement.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('click', handleClick);

    return () => {
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [
    buildMode,
    camera,
    gl,
    selectedType,
    selectedColor,
    selectedSize,
    gridSnapEnabled,
    gridSnapSize,
    setGhostPreview,
    addObject,
    incrementObjectsSpawned,
  ]);

  return null; // This component doesn't render anything
}
