import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Motorcycle, BikeColorOption } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { 
  Rotate3d, 
  Volume2, 
  VolumeX, 
  Lightbulb, 
  Maximize2, 
  RotateCcw, 
  Layers, 
  Eye, 
  Compass,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface Motorcycle3DViewerProps {
  motorcycle: Motorcycle;
  selectedColor: BikeColorOption;
  onColorChange: (color: BikeColorOption) => void;
  className?: string;
  onBookTestRide?: () => void;
}

export const Motorcycle3DViewer: React.FC<Motorcycle3DViewerProps> = ({
  motorcycle,
  selectedColor,
  onColorChange,
  className = '',
  onBookTestRide,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [headlightsOn, setHeadlightsOn] = useState<boolean>(true);
  const [engineSounding, setEngineSounding] = useState<boolean>(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [cameraView, setCameraView] = useState<'free' | 'side' | 'front' | 'cockpit'>('free');

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const bikeGroupRef = useRef<THREE.Group | null>(null);
  const bodyMaterialsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const frameMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const headlightBeamRef = useRef<THREE.SpotLight | null>(null);
  const headlightGlowRef = useRef<THREE.Mesh | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationVelocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetCamDistanceRef = useRef<number>(3.6);
  const currentCamDistanceRef = useRef<number>(3.6);

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0a0d);
    scene.fog = new THREE.FogExp2(0x0a0a0d, 0.08);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.8, 1.4, 3.2);
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting Rig
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    // Key Light - crisp white overhead
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Fill Light - cool subtle blue
    const fillLight = new THREE.DirectionalLight(0x94a3b8, 1.2);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    // Rim / Backlight - intense Dueffe red glow
    const rimLight = new THREE.SpotLight(0xE10600, 3.5, 12, Math.PI / 4, 0.4);
    rimLight.position.set(-3, 3, -4);
    rimLight.target.position.set(0, 0.5, 0);
    scene.add(rimLight);
    scene.add(rimLight.target);

    // Front soft highlight
    const frontFill = new THREE.DirectionalLight(0xffffff, 0.9);
    frontFill.position.set(0, 2, 5);
    scene.add(frontFill);

    // 5. Floor with studio reflections & radial shadow
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0c0d12,
      roughness: 0.25,
      metalness: 0.5,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    // Circular ground ring with Dueffe racing red accent
    const ringGeo = new THREE.RingGeometry(1.6, 1.63, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xE10600,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.002;
    scene.add(ring);

    // Inner subtle grid
    const gridHelper = new THREE.GridHelper(10, 20, 0x334155, 0x1e293b);
    gridHelper.position.y = 0.001;
    scene.add(gridHelper);

    // 6. Build Procedural 3D Motorcycle
    const bikeGroup = buildProceduralMotorcycle(motorcycle, selectedColor);
    bikeGroupRef.current = bikeGroup;
    scene.add(bikeGroup);

    // Headlight SpotLight attached to bike
    const headLight = new THREE.SpotLight(0xffffff, 4.0, 14, Math.PI / 6, 0.3);
    headLight.position.set(1.15, 0.9, 0);
    headLight.target.position.set(5, 0.2, 0);
    scene.add(headLight);
    scene.add(headLight.target);
    headlightBeamRef.current = headLight;

    // 7. Mouse / Touch Orbit Interaction
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !bikeGroupRef.current) return;
      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };

      bikeGroupRef.current.rotation.y += deltaX * 0.008;
      // Pitch tilt clamp
      const newPitch = bikeGroupRef.current.rotation.z + deltaY * 0.004;
      if (Math.abs(newPitch) < 0.25) {
        bikeGroupRef.current.rotation.z = newPitch;
      }
      rotationVelocityRef.current = { x: deltaX * 0.002, y: deltaY * 0.001 };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetCamDistanceRef.current = THREE.MathUtils.clamp(
        targetCamDistanceRef.current + e.deltaY * 0.003,
        2.0,
        5.8
      );
    };

    // Touch support
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !bikeGroupRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePosRef.current.x;
      prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      bikeGroupRef.current.rotation.y += deltaX * 0.008;
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });
    dom.addEventListener('touchstart', handleTouchStart);
    dom.addEventListener('touchmove', handleTouchMove);
    dom.addEventListener('touchend', handleTouchEnd);

    // 8. Resize Observer
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // 9. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth camera distance zoom
      currentCamDistanceRef.current += (targetCamDistanceRef.current - currentCamDistanceRef.current) * 0.1;
      if (cameraRef.current) {
        const dir = cameraRef.current.position.clone().sub(new THREE.Vector3(0, 0.5, 0)).normalize();
        cameraRef.current.position.copy(new THREE.Vector3(0, 0.5, 0).add(dir.multiplyScalar(currentCamDistanceRef.current)));
      }

      if (bikeGroupRef.current) {
        // Auto-rotation when not manually dragging
        if (isRotating && !isDraggingRef.current) {
          bikeGroupRef.current.rotation.y += delta * 0.45;
        } else if (!isDraggingRef.current) {
          // Inertia damping
          bikeGroupRef.current.rotation.y += rotationVelocityRef.current.x;
          rotationVelocityRef.current.x *= 0.92;
          rotationVelocityRef.current.y *= 0.92;
        }

        // Return gentle pitch to flat
        if (!isDraggingRef.current) {
          bikeGroupRef.current.rotation.z *= 0.95;
        }

        // Keep headlight target aligned with bike rotation
        if (headlightBeamRef.current) {
          const bikeAngle = bikeGroupRef.current.rotation.y;
          const beamDist = 6;
          headlightBeamRef.current.target.position.set(
            Math.cos(-bikeAngle) * beamDist,
            0.2,
            Math.sin(-bikeAngle) * beamDist
          );
          headlightBeamRef.current.position.set(
            Math.cos(-bikeAngle) * 1.1,
            0.9,
            Math.sin(-bikeAngle) * 1.1
          );
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('wheel', handleWheel);
      dom.removeEventListener('touchstart', handleTouchStart);
      dom.removeEventListener('touchmove', handleTouchMove);
      dom.removeEventListener('touchend', handleTouchEnd);
      renderer.dispose();
      audioEngine.stop();
    };
  }, [motorcycle.id]);

  // Re-build or update materials when bike or color changes
  useEffect(() => {
    if (!bikeGroupRef.current) return;
    bodyMaterialsRef.current.forEach((mat) => {
      mat.color.set(selectedColor.hex);
      if (selectedColor.metallic) {
        mat.metalness = 0.85;
        mat.roughness = 0.2;
        mat.clearcoat = 1.0;
        mat.clearcoatRoughness = 0.1;
      } else {
        mat.metalness = 0.2;
        mat.roughness = 0.35;
        mat.clearcoat = 0.7;
      }
    });
  }, [selectedColor]);

  // Wireframe toggle
  useEffect(() => {
    if (!bikeGroupRef.current) return;
    bikeGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => { m.wireframe = wireframeMode; });
        } else if (child.material) {
          child.material.wireframe = wireframeMode;
        }
      }
    });
  }, [wireframeMode]);

  // Headlight toggle
  useEffect(() => {
    if (headlightBeamRef.current) {
      headlightBeamRef.current.intensity = headlightsOn ? 4.2 : 0;
    }
    if (headlightGlowRef.current) {
      (headlightGlowRef.current.material as THREE.MeshBasicMaterial).color.set(
        headlightsOn ? 0xffffff : 0x27272a
      );
    }
  }, [headlightsOn]);

  // Engine Sound toggle
  const toggleEngine = () => {
    if (engineSounding) {
      audioEngine.stop();
      setEngineSounding(false);
    } else {
      audioEngine.start(motorcycle.specs.engineType);
      setEngineSounding(true);
    }
  };

  const revEngine = () => {
    if (!engineSounding) {
      setEngineSounding(true);
    }
    audioEngine.revThrottle();
  };

  // Camera presets
  const setPresetView = (view: 'free' | 'side' | 'front' | 'cockpit') => {
    setCameraView(view);
    if (!cameraRef.current || !bikeGroupRef.current) return;

    if (view === 'side') {
      setIsRotating(false);
      bikeGroupRef.current.rotation.set(0, -Math.PI / 2, 0);
      cameraRef.current.position.set(0, 0.7, 3.2);
    } else if (view === 'front') {
      setIsRotating(false);
      bikeGroupRef.current.rotation.set(0, 0, 0);
      cameraRef.current.position.set(3.2, 0.7, 0);
    } else if (view === 'cockpit') {
      setIsRotating(false);
      bikeGroupRef.current.rotation.set(0, -Math.PI / 4, 0);
      cameraRef.current.position.set(0.6, 1.25, 0.8);
    } else {
      setIsRotating(true);
    }
  };

  const resetCamera = () => {
    if (cameraRef.current && bikeGroupRef.current) {
      cameraRef.current.position.set(2.8, 1.4, 3.2);
      bikeGroupRef.current.rotation.set(0, 0, 0);
      targetCamDistanceRef.current = 3.6;
      setIsRotating(true);
      setCameraView('free');
    }
  };

  /**
   * Procedural 3D Motorcycle Construction Engine
   */
  function buildProceduralMotorcycle(bike: Motorcycle, color: BikeColorOption): THREE.Group {
    const group = new THREE.Group();
    bodyMaterialsRef.current = [];
    frameMaterialsRef.current = [];

    const isCruiser = bike.threeDConfig.styleType === 'cruiser';
    const isAdventure = bike.threeDConfig.styleType === 'adventure';
    const isHeritage = bike.threeDConfig.styleType === 'heritage';
    const isSuperSport = bike.threeDConfig.styleType === 'supersport';

    // Materials Palette
    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x141417,
      roughness: 0.9,
      metalness: 0.1,
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x222226,
      roughness: 0.25,
      metalness: 0.95,
    });

    const brakeRotorMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      roughness: 0.3,
      metalness: 0.9,
    });

    const bremboRedMat = new THREE.MeshStandardMaterial({
      color: 0xE10600,
      roughness: 0.3,
      metalness: 0.6,
    });

    const ohlinsGoldMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.25,
      metalness: 0.9,
    });

    const engineMetalMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.45,
      metalness: 0.85,
    });

    const exhaustTitaniumMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.3,
      metalness: 0.95,
    });

    const frameMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(bike.threeDConfig.frameColor),
      roughness: 0.35,
      metalness: 0.7,
    });
    frameMaterialsRef.current.push(frameMat);

    // Primary Body Paint Material (Glossy / Metallic Car Finish)
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color.hex),
      roughness: color.metallic ? 0.2 : 0.3,
      metalness: color.metallic ? 0.85 : 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });
    bodyMaterialsRef.current.push(bodyMat);

    const seatMat = new THREE.MeshStandardMaterial({
      color: 0x111113,
      roughness: 0.85,
      metalness: 0.05,
    });

    const screenMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1,
      transmission: 0.8,
      thickness: 0.2,
    });

    // 1. FRONT WHEEL & TIRE
    const frontWheelGroup = new THREE.Group();
    frontWheelGroup.position.set(1.15, 0.36, 0);

    // Front tire
    const frontTireGeo = new THREE.TorusGeometry(0.36, 0.075, 24, 48);
    const frontTire = new THREE.Mesh(frontTireGeo, rubberMat);
    frontTire.rotation.y = Math.PI / 2;
    frontTire.castShadow = true;
    frontWheelGroup.add(frontTire);

    // Front Rim hub & spokes
    const frontRimHubGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 16);
    const frontRimHub = new THREE.Mesh(frontRimHubGeo, rimMat);
    frontRimHub.rotation.x = Math.PI / 2;
    frontWheelGroup.add(frontRimHub);

    // Spokes
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const spokeGeo = new THREE.BoxGeometry(0.02, 0.32, 0.015);
      const spoke = new THREE.Mesh(spokeGeo, rimMat);
      spoke.position.set(0, Math.sin(angle) * 0.16, Math.cos(angle) * 0.16);
      spoke.rotation.x = angle;
      frontWheelGroup.add(spoke);
    }

    // Dual Brake Rotors
    const rotorGeo = new THREE.RingGeometry(0.12, 0.26, 32);
    const leftRotor = new THREE.Mesh(rotorGeo, brakeRotorMat);
    leftRotor.rotation.y = Math.PI / 2;
    leftRotor.position.z = 0.06;
    const rightRotor = leftRotor.clone();
    rightRotor.position.z = -0.06;
    rightRotor.rotation.y = -Math.PI / 2;
    frontWheelGroup.add(leftRotor);
    frontWheelGroup.add(rightRotor);

    // Brembo Caliper
    const caliperGeo = new THREE.BoxGeometry(0.06, 0.1, 0.05);
    const caliperLeft = new THREE.Mesh(caliperGeo, bremboRedMat);
    caliperLeft.position.set(-0.16, 0.12, 0.075);
    const caliperRight = caliperLeft.clone();
    caliperRight.position.z = -0.075;
    frontWheelGroup.add(caliperLeft);
    frontWheelGroup.add(caliperRight);

    group.add(frontWheelGroup);

    // 2. REAR WHEEL & TIRE
    const rearWheelGroup = new THREE.Group();
    const rearWheelX = isCruiser ? -1.15 : -1.05;
    rearWheelGroup.position.set(rearWheelX, 0.36, 0);

    // Rear tire (wider on cruiser)
    const rearTireWidth = isCruiser ? 0.125 : 0.095;
    const rearTireGeo = new THREE.TorusGeometry(0.35, rearTireWidth, 24, 48);
    const rearTire = new THREE.Mesh(rearTireGeo, rubberMat);
    rearTire.rotation.y = Math.PI / 2;
    rearTire.castShadow = true;
    rearWheelGroup.add(rearTire);

    // Rear Rim & Single-sided Swingarm Hub
    const rearRimHubGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.12, 16);
    const rearRimHub = new THREE.Mesh(rearRimHubGeo, rimMat);
    rearRimHub.rotation.x = Math.PI / 2;
    rearWheelGroup.add(rearRimHub);

    // Rear Sprocket & Chain ring
    const sprocketGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.015, 32);
    const sprocket = new THREE.Mesh(sprocketGeo, engineMetalMat);
    sprocket.rotation.x = Math.PI / 2;
    sprocket.position.z = -0.08;
    rearWheelGroup.add(sprocket);

    // Rear Brembo Caliper & disc
    const rearDisc = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.22, 32), brakeRotorMat);
    rearDisc.rotation.y = Math.PI / 2;
    rearDisc.position.z = 0.08;
    rearWheelGroup.add(rearDisc);

    group.add(rearWheelGroup);

    // 3. FRONT FORKS (Öhlins Gold Stanchions & Triple Clamps)
    const forkGroup = new THREE.Group();
    forkGroup.position.set(1.15, 0.36, 0);

    // Fork tubes
    const forkTubeGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.72, 16);
    const leftFork = new THREE.Mesh(forkTubeGeo, ohlinsGoldMat);
    leftFork.position.set(-0.16, 0.32, 0.085);
    leftFork.rotation.z = -0.42; // fork rake angle
    const rightFork = leftFork.clone();
    rightFork.position.z = -0.085;
    forkGroup.add(leftFork);
    forkGroup.add(rightFork);

    // Triple Clamp
    const clampGeo = new THREE.BoxGeometry(0.06, 0.03, 0.22);
    const topClamp = new THREE.Mesh(clampGeo, engineMetalMat);
    topClamp.position.set(-0.29, 0.58, 0);
    topClamp.rotation.z = -0.42;
    forkGroup.add(topClamp);

    // Clip-on Handlebars
    const barGeo = new THREE.CylinderGeometry(0.012, 0.012, isAdventure ? 0.55 : 0.42, 16);
    const handleBar = new THREE.Mesh(barGeo, engineMetalMat);
    handleBar.rotation.x = Math.PI / 2;
    handleBar.position.set(-0.31, isAdventure ? 0.72 : 0.61, 0);
    forkGroup.add(handleBar);

    // Grips & Red Bar-ends
    const gripGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.09, 16);
    const leftGrip = new THREE.Mesh(gripGeo, rubberMat);
    leftGrip.rotation.x = Math.PI / 2;
    leftGrip.position.set(-0.31, isAdventure ? 0.72 : 0.61, 0.22);
    const rightGrip = leftGrip.clone();
    rightGrip.position.z = -0.22;
    forkGroup.add(leftGrip);
    forkGroup.add(rightGrip);

    // TFT Cockpit Screen
    const tftGeo = new THREE.BoxGeometry(0.02, 0.06, 0.1);
    const tft = new THREE.Mesh(tftGeo, new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
    tft.position.set(-0.28, 0.65, 0);
    tft.rotation.z = -0.6;
    forkGroup.add(tft);

    group.add(forkGroup);

    // 4. TRELLIS FRAME & SWINGARM
    const chassisGroup = new THREE.Group();

    // Main Trellis Frame Tubes
    const frameGeo1 = new THREE.CylinderGeometry(0.018, 0.018, 0.85, 12);
    const frameTubeTop = new THREE.Mesh(frameGeo1, frameMat);
    frameTubeTop.position.set(0.3, 0.68, 0.1);
    frameTubeTop.rotation.set(0.1, 0, 0.85);
    const frameTubeTopR = frameTubeTop.clone();
    frameTubeTopR.position.z = -0.1;
    frameTubeTopR.rotation.x = -0.1;
    chassisGroup.add(frameTubeTop);
    chassisGroup.add(frameTubeTopR);

    // Diagonal Cross Braces
    const braceGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.45, 10);
    const brace1 = new THREE.Mesh(braceGeo, frameMat);
    brace1.position.set(0.25, 0.55, 0.11);
    brace1.rotation.set(0.1, 0, -0.6);
    const brace1R = brace1.clone();
    brace1R.position.z = -0.11;
    brace1R.rotation.x = -0.1;
    chassisGroup.add(brace1);
    chassisGroup.add(brace1R);

    // Single-Sided Swingarm
    const swingarmGeo = new THREE.BoxGeometry(0.72, 0.09, 0.06);
    const swingarm = new THREE.Mesh(swingarmGeo, engineMetalMat);
    swingarm.position.set(-0.55, 0.4, 0.08);
    swingarm.rotation.z = -0.12;
    chassisGroup.add(swingarm);

    // Rear Monoshock with Red Spring
    const shockBodyGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.28, 12);
    const shockBody = new THREE.Mesh(shockBodyGeo, bremboRedMat);
    shockBody.position.set(-0.25, 0.52, 0);
    shockBody.rotation.z = 0.55;
    chassisGroup.add(shockBody);

    group.add(chassisGroup);

    // 5. ENGINE & TRANSMISSION BLOCK
    const engineGroup = new THREE.Group();
    engineGroup.position.set(0.05, 0.42, 0);

    // Main Crankcase
    const crankcaseGeo = new THREE.BoxGeometry(0.42, 0.26, 0.28);
    const crankcase = new THREE.Mesh(crankcaseGeo, engineMetalMat);
    engineGroup.add(crankcase);

    // Finned V4 / Twin Cylinders
    const cylGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.24, 16);
    const frontCyl = new THREE.Mesh(cylGeo, engineMetalMat);
    frontCyl.position.set(0.12, 0.18, 0);
    frontCyl.rotation.z = -0.35;
    const rearCyl = new THREE.Mesh(cylGeo, engineMetalMat);
    rearCyl.position.set(-0.1, 0.2, 0);
    rearCyl.rotation.z = 0.45;
    engineGroup.add(frontCyl);
    engineGroup.add(rearCyl);

    // Clutch Cover (Ducati style clear/carbon clutch with red inner ring)
    const clutchGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 20);
    const clutchCover = new THREE.Mesh(clutchGeo, bremboRedMat);
    clutchCover.position.set(0.06, 0, 0.16);
    clutchCover.rotation.x = Math.PI / 2;
    engineGroup.add(clutchCover);

    // Radiator with subtle cooling fins
    const radGeo = new THREE.BoxGeometry(0.06, 0.32, 0.26);
    const rad = new THREE.Mesh(radGeo, new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 }));
    rad.position.set(0.42, 0.24, 0);
    rad.rotation.z = -0.2;
    engineGroup.add(rad);

    // Akrapovič / Racing Titanium Exhaust Headers & Muffler
    const headerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.16, 0.15, 0.08),
      new THREE.Vector3(0.22, -0.05, 0.1),
      new THREE.Vector3(0.0, -0.12, 0.12),
      new THREE.Vector3(-0.35, -0.05, 0.14),
      new THREE.Vector3(-0.7, 0.2, 0.18),
    ]);
    const headerGeo = new THREE.TubeGeometry(headerCurve, 20, 0.024, 8, false);
    const header = new THREE.Mesh(headerGeo, exhaustTitaniumMat);
    engineGroup.add(header);

    // Carbon / Titanium Muffler Canister
    const mufflerGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.45, 16);
    const muffler = new THREE.Mesh(mufflerGeo, new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4, metalness: 0.8 }));
    muffler.position.set(-0.78, 0.24, 0.2);
    muffler.rotation.set(0, 0.2, 0.6);
    engineGroup.add(muffler);

    // Muffler End Cap with red accent ring
    const capGeo = new THREE.RingGeometry(0.02, 0.05, 16);
    const cap = new THREE.Mesh(capGeo, bremboRedMat);
    cap.position.set(-0.95, 0.34, 0.24);
    cap.rotation.y = -Math.PI / 2;
    engineGroup.add(cap);

    group.add(engineGroup);

    // 6. FUEL TANK & BODYWORK (Dynamic to motorcycle style)
    const bodyGroup = new THREE.Group();

    // Sculpted Fuel Tank
    const tankGeo = isHeritage
      ? new THREE.CylinderGeometry(0.16, 0.18, 0.55, 16) // Vintage teardrop
      : isCruiser
      ? new THREE.CylinderGeometry(0.14, 0.24, 0.65, 16) // Low-slung muscle
      : new THREE.CylinderGeometry(0.16, 0.26, 0.58, 16); // High-tech angular sport

    const tank = new THREE.Mesh(tankGeo, bodyMat);
    tank.rotation.z = Math.PI / 2;
    tank.position.set(0.15, 0.82, 0);
    tank.scale.set(0.9, 1.0, 1.15);
    tank.castShadow = true;
    bodyGroup.add(tank);

    // Knee indent recesses
    const indentGeo = new THREE.BoxGeometry(0.24, 0.14, 0.06);
    const indentLeft = new THREE.Mesh(indentGeo, rubberMat);
    indentLeft.position.set(0.05, 0.78, 0.16);
    const indentRight = indentLeft.clone();
    indentRight.position.z = -0.16;
    bodyGroup.add(indentLeft);
    bodyGroup.add(indentRight);

    // Fuel Filler Cap
    const capFillerGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.015, 20);
    const capFiller = new THREE.Mesh(capFillerGeo, rimMat);
    capFiller.position.set(0.25, 0.94, 0);
    bodyGroup.add(capFiller);

    // 7. SEAT & TAIL SECTION
    const seatGeo = new THREE.BoxGeometry(0.38, 0.06, 0.2);
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(-0.25, 0.74, 0);
    bodyGroup.add(seat);

    // Tail Cowl
    const tailGeo = new THREE.ConeGeometry(0.14, 0.55, 16);
    const tailCowl = new THREE.Mesh(tailGeo, bodyMat);
    tailCowl.rotation.z = -Math.PI / 2 + 0.25;
    tailCowl.position.set(-0.62, 0.82, 0);
    tailCowl.scale.set(1.0, 1.0, 0.85);
    tailCowl.castShadow = true;
    bodyGroup.add(tailCowl);

    // Rear LED Tail light bar (vibrant red emissive)
    const tailLightGeo = new THREE.BoxGeometry(0.02, 0.02, 0.12);
    const tailLight = new THREE.Mesh(
      tailLightGeo,
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    tailLight.position.set(-0.86, 0.89, 0);
    bodyGroup.add(tailLight);

    // 8. FAIRING & NOSE COWL (SuperSport & Adventure specific)
    if (isSuperSport || bike.threeDConfig.hasFairing) {
      // Front Aerodynamic Nose
      const noseGeo = new THREE.ConeGeometry(0.18, 0.42, 16);
      const nose = new THREE.Mesh(noseGeo, bodyMat);
      nose.rotation.z = Math.PI / 2 - 0.25;
      nose.position.set(0.92, 0.9, 0);
      nose.scale.set(1.1, 1.0, 0.9);
      nose.castShadow = true;
      bodyGroup.add(nose);

      // Side fairing panels
      const panelGeo = new THREE.BoxGeometry(0.5, 0.45, 0.03);
      const leftPanel = new THREE.Mesh(panelGeo, bodyMat);
      leftPanel.position.set(0.5, 0.65, 0.17);
      leftPanel.rotation.y = 0.1;
      const rightPanel = leftPanel.clone();
      rightPanel.position.z = -0.17;
      rightPanel.rotation.y = -0.1;
      bodyGroup.add(leftPanel);
      bodyGroup.add(rightPanel);

      // Carbon Downforce Winglets
      const wingGeo = new THREE.BoxGeometry(0.08, 0.015, 0.16);
      const wingLeft = new THREE.Mesh(wingGeo, new THREE.MeshStandardMaterial({ color: 0x111113, roughness: 0.3 }));
      wingLeft.position.set(0.85, 0.82, 0.22);
      wingLeft.rotation.y = -0.3;
      wingLeft.rotation.z = 0.2;
      const wingRight = wingLeft.clone();
      wingRight.position.z = -0.22;
      wingRight.rotation.y = 0.3;
      bodyGroup.add(wingLeft);
      bodyGroup.add(wingRight);

      // Windscreen
      const screenGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.28, 16, 1, true, 0, Math.PI);
      const windscreen = new THREE.Mesh(screenGeo, screenMat);
      windscreen.position.set(0.78, 1.08, 0);
      windscreen.rotation.z = -0.8;
      windscreen.rotation.y = Math.PI / 2;
      bodyGroup.add(windscreen);
    }

    // 9. ADVENTURE TOURING EXTRAS (Windscreen & Panniers)
    if (isAdventure) {
      // Tall Rally Screen
      const tallScreenGeo = new THREE.PlaneGeometry(0.24, 0.35);
      const tallScreen = new THREE.Mesh(tallScreenGeo, screenMat);
      tallScreen.position.set(0.88, 1.25, 0);
      tallScreen.rotation.y = -Math.PI / 2;
      tallScreen.rotation.x = -0.3;
      bodyGroup.add(tallScreen);

      // Aluminum Side Panniers
      const pannierGeo = new THREE.BoxGeometry(0.38, 0.32, 0.2);
      const aluMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.3, metalness: 0.9 });
      const leftPannier = new THREE.Mesh(pannierGeo, aluMat);
      leftPannier.position.set(-0.72, 0.68, 0.28);
      const rightPannier = leftPannier.clone();
      rightPannier.position.z = -0.28;
      bodyGroup.add(leftPannier);
      bodyGroup.add(rightPannier);
    }

    // 10. HEADLIGHT PROJECTOR
    const headlightGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.02, 16);
    const headlightLensMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const headlightLens = new THREE.Mesh(headlightGeo, headlightLensMat);
    headlightLens.rotation.z = Math.PI / 2;
    headlightLens.position.set(isSuperSport ? 1.08 : 0.92, isAdventure ? 1.05 : 0.88, 0);
    bodyGroup.add(headlightLens);
    headlightGlowRef.current = headlightLens;

    group.add(bodyGroup);

    // Lift bike so wheels sit precisely on the floor plane (y = 0)
    group.position.y = 0.08;

    return group;
  }

  return (
    <div className={`relative w-full h-[580px] lg:h-[680px] rounded-2xl overflow-hidden bg-[#0a0a0d] border border-white/10 select-none shadow-2xl ${className}`}>
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left: Motorcycle Name & 3D Interactive Badge */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-black/60 backdrop-blur-md rounded border border-white/10">
            <Rotate3d className="w-3.5 h-3.5 text-[#E10600] animate-pulse" />
            Visualizzatore 3D Realtime
          </span>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Trascina per ruotare 360° · Rotella per zoom
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display drop-shadow-md">
          {motorcycle.name}
        </h3>
        <p className="text-xs text-[#E10600] font-medium tracking-wide">
          {motorcycle.tagline}
        </p>
      </div>

      {/* Top Right: Sound Simulator, Headlights & Engineering Toggles */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {/* Engine Sound Button */}
        <button
          onClick={toggleEngine}
          title={engineSounding ? 'Spegni Motore' : 'Accendi Motore (Audio Sintetico)'}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg backdrop-blur-md transition-all ${
            engineSounding
              ? 'bg-[#E10600] text-white shadow-[0_0_15px_rgba(225,6,0,0.5)]'
              : 'bg-black/60 text-slate-300 hover:text-white border border-white/10 hover:border-white/30'
          }`}
        >
          {engineSounding ? <Volume2 className="w-4 h-4 animate-bounce" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden sm:inline">{engineSounding ? 'Motore Acceso' : 'Avvia Motore'}</span>
        </button>

        {engineSounding && (
          <button
            onClick={revEngine}
            className="px-3 py-1.5 text-xs font-bold text-black bg-white rounded-lg hover:bg-slate-200 transition-transform active:scale-95 shadow-md flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E10600]" />
            Sgasata!
          </button>
        )}

        {/* Headlight Toggle */}
        <button
          onClick={() => setHeadlightsOn(!headlightsOn)}
          title="Fari a LED"
          className={`p-2 rounded-lg backdrop-blur-md transition-colors ${
            headlightsOn
              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
              : 'bg-black/60 text-slate-400 border border-white/10 hover:text-white'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
        </button>

        {/* Wireframe Engineering Mode */}
        <button
          onClick={() => setWireframeMode(!wireframeMode)}
          title="Modalità Tecnica Wireframe"
          className={`p-2 rounded-lg backdrop-blur-md transition-colors ${
            wireframeMode
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
              : 'bg-black/60 text-slate-400 border border-white/10 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Reset Camera */}
        <button
          onClick={resetCamera}
          title="Ripristina visuale"
          className="p-2 bg-black/60 text-slate-400 hover:text-white rounded-lg backdrop-blur-md border border-white/10 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Hotspots Overlay Bar */}
      <div className="absolute top-20 left-4 z-10 max-w-xs space-y-1.5 hidden md:block">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Eye className="w-3 h-3 text-[#E10600]" />
          Dettagli Tecnici Selezionabili:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {motorcycle.hotspots.map((hs) => (
            <button
              key={hs.id}
              onClick={() => setActiveHotspot(activeHotspot === hs.id ? null : hs.id)}
              className={`px-2.5 py-1 text-xs rounded transition-all text-left ${
                activeHotspot === hs.id
                  ? 'bg-[#E10600] text-white font-semibold shadow-md'
                  : 'bg-black/70 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              {hs.title}
            </button>
          ))}
        </div>

        {/* Active Hotspot Card */}
        {activeHotspot && (
          <div className="mt-2 p-3 bg-black/90 backdrop-blur-md border border-[#E10600]/40 rounded-lg text-xs shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between font-bold text-white mb-1">
              <span>{motorcycle.hotspots.find((h) => h.id === activeHotspot)?.title}</span>
              <button
                onClick={() => setActiveHotspot(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {motorcycle.hotspots.find((h) => h.id === activeHotspot)?.description}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Center Bar: Color Palette Selector */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2.5 px-4 py-2 bg-black/80 backdrop-blur-md rounded-full border border-white/10 shadow-xl">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Livrea:</span>
          {motorcycle.colors.map((c) => {
            const isSelected = selectedColor.hex === c.hex;
            return (
              <button
                key={c.name}
                onClick={() => onColorChange(c)}
                title={c.name}
                className={`group relative flex items-center justify-center w-7 h-7 rounded-full transition-transform ${
                  isSelected ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-black' : 'hover:scale-110 opacity-80'
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {isSelected && (
                  <CheckCircle2 className={`w-4 h-4 ${c.hex === '#f8fafc' || c.hex === '#f1f5f9' ? 'text-black' : 'text-white'}`} />
                )}
              </button>
            );
          })}
          <div className="h-4 w-px bg-white/20 mx-1 hidden sm:block" />
          <span className="text-xs font-semibold text-white whitespace-nowrap hidden sm:inline">
            {selectedColor.name}
          </span>
        </div>

        {/* Camera Views Quick Switch */}
        <div className="flex items-center gap-1 p-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/5">
          <button
            onClick={() => setPresetView('free')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
              cameraView === 'free' ? 'bg-[#E10600] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            360° Libero
          </button>
          <button
            onClick={() => setPresetView('side')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
              cameraView === 'side' ? 'bg-[#E10600] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Profilo Laterale
          </button>
          <button
            onClick={() => setPresetView('front')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
              cameraView === 'front' ? 'bg-[#E10600] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Frontale Fari
          </button>
          <button
            onClick={() => setPresetView('cockpit')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
              cameraView === 'cockpit' ? 'bg-[#E10600] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Posto Guida TFT
          </button>
        </div>
      </div>

      {/* Bottom Right: Quick Action Book Test Ride */}
      {onBookTestRide && (
        <div className="absolute bottom-4 right-4 z-10 hidden sm:block">
          <button
            onClick={onBookTestRide}
            className="px-4 py-2 text-xs font-bold text-white bg-[#E10600] hover:bg-red-700 rounded-lg shadow-lg shadow-red-950/40 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            Prenota Test Ride
          </button>
        </div>
      )}
    </div>
  );
};
