import { useEffect, useRef, useState, useTransition } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Define the shape IDs and their config in one place
type ShapeId = 'heart' | 'codrops' | 'smile';

// This data can be moved outside the component as it's static
const shapes: { id: ShapeId; svg: JSX.Element; bgColorClass: string }[] = [
  {
    id: 'heart',
    svg: <svg width="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1079.4 875.4"><path fill="currentColor" d="M.9,256.8c1.6-5.7,1.7-11.7,1.8-17.7.9-12.2,3.5-24.3,5.8-36.2,4.9-21.2,11.9-42.3,22.6-61.3,5.1-10.7,10.4-21,17.8-30.3,5.4-7.3,10.6-14.2,17.6-20.3,4.2-4.3,7-9.3,11.3-13.3,5.5-4.5,11.8-10.9,17.6-15.8,7.7-5.4,15.7-10.9,22.8-16.9C178.9,8.1,252.8-9.3,323.3,5c70.7,8.5,132.7,52.8,173.4,109.7,13.5,18.8,25.1,39.4,35.1,61.1,1.9,4.9,6.5,9.6,10.2,3,4-8.1,6.4-17,12.2-24,5.9-10.9,12-22.2,19.4-32.4,4-6.6,9.7-11.6,15-17.3,5.6-6.8,10.7-14.2,17-20.5,37-38.2,83.4-67.6,136-76.1,20.5-5,41.5-8.6,62.8-6.9,12.4.7,25.1-.8,37.5.8,11.3,2.4,22.5,3.6,33.9,5.4,44.8,13.8,92.1,35.7,125.3,69.4,7.2,7.9,14.1,17.1,21.9,24.4,7.6,8.9,13.2,18.9,19.5,28.7,8,12.2,12.5,26.4,18.2,39.7,2.4,7.3,5.1,14.3,7.3,21.8,1.7,6.5,1.9,14,3.9,20.2,2.5,12.5,4.9,25,4.8,37.9.6,5.7,2.7,10.4,2.8,16.2,0,8-1.6,15.9-2.7,23.8-2.9,14.6,0,31-4.5,45.4-4.1,8.3-5.6,18.3-8.8,26.8-3.5,7.5-5.7,15.7-9.5,23.1-5.5,12-8.8,25.2-16.2,36.2-10.2,19.2-21.4,37.8-35.1,54.7-8.6,12.2-17.6,24.2-28.3,34.5-3.3,4-4.5,7.7-8,11.6-4.2,4.5-10.3,9.1-15.1,13.7-5.2,4.3-9.1,10.1-14,14.1-3.6,3-7.9,5.1-11.3,8.4-3.4,3.2-6.4,8-9.7,11-3.3,3.1-6.8,4.7-10.3,7.5-4.6,3.9-8.6,8.6-13.6,11.9-11.5,8.8-22.3,19-34.4,26.9-7.9,7.2-16.1,13.2-24.7,19.2-19.9,15.5-39.7,31-60,46-38.2,29.7-76.9,58.7-114.4,89.2-4.4,4.1-9.4,6.7-13.7,11.1-2.9,3.1-5.7,6.7-8.7,9.7-12.6,12-28.3,22.2-41.5,34.6-14.6,13.3-26,30-40.9,42.9-8.8,8.1-16.2,10.5-23.8-.9-6.3-7.6-13.5-17-19.9-23.6-3.9-3.5-9.3-4.9-13.5-8.6-5.9-5.1-11.1-13.2-16.4-18.8-4.4-5.1-10.1-6.7-15-10.9-3.3-2.7-6.1-6.9-9.5-9.9-15.5-12.3-30.5-25.3-45.9-37.9-4.1-3.7-9.6-6.2-13.9-9.8-8.6-7.9-17.3-14.9-26.6-21.7-24.8-16.9-47.7-36.3-72.2-53.6-28.1-21.2-55.8-43.1-83.9-64.3-11.2-8.4-21.9-17.7-32.7-26.7-4.3-3.5-8.7-5.9-12.5-9.7-3.8-3.8-6.9-8.6-10.8-12.3-4.5-4.2-9.3-5.6-13.8-9.7-7.6-7.8-13.4-16.2-22-23.3-5.3-4.8-11.2-9.5-16.1-14.6-4-4.3-5.4-9.2-9.6-13.5-5.5-5.3-11.4-10.1-15.4-16.7-7-8.6-14.4-18.2-20.5-27.6-23.7-32.7-40.2-70.6-49.9-109.7-2.1-9-4.2-17.9-5.7-27-1.3-6.2-3.2-12.2-2.9-18.7,0-6,.2-12.6,0-18.5-.3-7.8-2-16-.1-23.7v-.2Z"/></svg>,
    bgColorClass: 'data-[current=heart]:bg-[#e19800]',
  },
  {
    id: 'codrops',
    svg: <svg width="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 217.6 346"><path fill="currentColor" d="M217.6,211.9v12.2c0,24.2-6.3,48.3-19.6,68.5-17.2,26.2-48,48-78.5,53.2-6.5.3-13.2,0-19.4-.8-26.4-3.9-59.5-23-75.4-44.8C-46.5,202.9,53.8,84.4,106.8,0c35,52,102.5,150.8,110.8,211.9Z"/></svg>,
    bgColorClass: 'data-[current=codrops]:bg-[#00a00b]',
  },
  {
    id: 'smile',
    svg: <svg width="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080"><path fill="currentColor" d="M176.2,141.2C495.5-153.5,1021.8,40.6,1075.6,469.4c55.6,443.1-421.8,762-808.2,536.1C-48.1,821-92,388.7,176.2,141.2ZM720.6,269.4c-77.2,3.9-82.7,198.4-19,224.2,66.7,27.1,87.8-72.8,85.4-119.9-1.8-34.5-21.9-106.5-66.4-104.3ZM326.3,486.8c45.6,39.8,84.3-21.5,92.5-62.1,8.4-41.4,1.2-124.7-39.8-148.1-49.9-28.5-82.7,46.1-87.6,85.5s7.4,100.7,34.9,124.7ZM797.9,771.4c55.6-63.9,91.9-151.5,87.6-237.1l-9.2-8.5c-27.4-12.4-22.6,55.6-25.7,71.5-65.2,337.2-549,339.1-619.7,12.9-3.6-16.5-4.6-69.5-11.8-78.9-12.6-16.3-29.2-1.9-28.3,19.3,12.3,308.5,403.3,454.6,607.1,220.7Z"/></svg>,
    bgColorClass: 'data-[current=smile]:bg-[#b90000]',
  },
];

const Projection = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const glAppRef = useRef<GLAppAPI | null>(null);

  const [currentShape, setCurrentShape] = useState<ShapeId>('heart');
  const [isPending, startTransition] = useTransition();
  const [isAnimating, setIsAnimating] = useState(false);
  useEffect(() => {
    if (mountRef.current && !glAppRef.current) {
      glAppRef.current = createGLApp(mountRef.current);
      glAppRef.current.animate();
    }

    return () => {
      glAppRef.current?.cleanup();
      glAppRef.current = null;
    };
  }, []);

 const handleShapeChange = (newShape: ShapeId) => {
    // Add a guard against clicks while animating, just in case
    if (newShape === currentShape || isAnimating || !glAppRef.current) return;

    // Call the updated changeShape method with our callbacks
    glAppRef.current.models.changeShape(newShape, currentShape, {
      onStart: () => {
        setIsAnimating(true);
        // We set the new shape state here, at the beginning of the animation
        setCurrentShape(newShape);
      },
      onComplete: () => {
        setIsAnimating(false);
      },
    });
  };
  const backgroundClasses = shapes.map(s => s.bgColorClass).join(' ');
  return (
    <div ref={mountRef} data-current={currentShape}

  className={`w-full h-full relative overflow-hidden transition-colors 
              duration-3000 ${backgroundClasses}`}
    >
      <ul className="absolute z-10 flex flex-row gap-52 left-1/2 bottom-8 transform -translate-x-1/2">
        {shapes.map(({ id, svg }, index) => (
          <li
            key={id}
            className={`transition-transform duration-300 ${index % 2 !== 0 ? '-translate-y-12' : ''}`}
          >
            <button
              onClick={() => handleShapeChange(id)}
              disabled={isPending}
              className={`group flex justify-center items-center w-15 h-15 rounded-full transition-colors duration-200 text-white
                ${currentShape === id
                  ? 'bg-black/20 border-2 border-white/40 pointer-events-none'
                  : 'bg-black/5 hover:bg-black border-2 border-transparent hover:border-white/20'
              }`}
            >
              <div className="h-4 w-4 transition-transform duration-500 group-hover:scale-110">
                {svg}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};


export default Projection;

type GridId = 'heart' | 'codrops' | 'smile';

interface GridConfig {
  id: GridId;
  mask: string;
  video: string;
}

// --- Define the Public API of our module ---
// This interface describes the object our factory function will return.
export interface ModelsAPI {
  isReady: boolean;
  group: THREE.Group;
  update: () => void;
  changeShape: (newId: GridId, oldId: GridId,
callbacks?: { onStart?: () => void; onComplete?: () => void }
  ) => void;
}

// --- The Factory Function: createModels ---
function createModels(scene: THREE.Scene): ModelsAPI {
  // --- State and Constants (previously instance properties) ---
  // These are now local variables within the function's scope.
  let isReady = false;
  let isAnimating = false;
  const group = new THREE.Group();
  const grids: Map<GridId, THREE.Group> = new Map();

  const gridSize = 24;
  const spacing = 0.65;
  const animationDuration = 1;
  const gridsConfig: GridConfig[] = [
    { id: 'heart', mask: '/images/heart.jpg', video: '/videos/fruits_trail_squared-transcode.mp4' },
    { id: 'codrops', mask: '/images/codrops.jpg', video: '/videos/KinectCube_1350-transcode.mp4' },
    { id: 'smile', mask: '/images/smile.jpg', video: '/videos/infinte-grid_squared-transcode.mp4' },
  ];

  // --- Private Helper Functions (previously private methods) ---
  // These are nested functions that have access to the state variables above via closure.
  
  const createGrid = (config: GridConfig, data: Uint8ClampedArray, gridWidth: number, gridHeight: number) => {
    const video = document.createElement('video');
    video.src = config.video;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.play();

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    
    const material = new THREE.MeshBasicMaterial({ map: videoTexture });
    const gridGroup = new THREE.Group();

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const flippedY = gridHeight - 1 - y;
        const pixelIndex = (flippedY * gridWidth + x) * 4;
        const brightness = (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3;

        if (brightness < 128) {
          const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
          
          const uvX = x / gridSize, uvY = y / gridSize;
          const uvWidth = 1 / gridSize, uvHeight = 1 / gridSize;
          const uvAttribute = geometry.attributes.uv;
          const uvArray = uvAttribute.array as Float32Array;
          for (let i = 0; i < uvArray.length; i += 2) {
            uvArray[i] = uvX + (uvArray[i] * uvWidth);
            uvArray[i + 1] = uvY + (uvArray[i + 1] * uvHeight);
          }
          uvAttribute.needsUpdate = true;

          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(
            (x - (gridSize - 1) / 2) * spacing,
            (y - (gridSize - 1) / 2) * spacing,
            0
          );
          gridGroup.add(mesh);
        }
      }
    }
    
    group.add(gridGroup);
    grids.set(config.id, gridGroup);
  };
  
  const createGridFromMask = (config: GridConfig): Promise<void> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const maskImage = new Image();
      maskImage.crossOrigin = 'anonymous';
      maskImage.src = config.mask;

      maskImage.onload = () => {
        const { width: originalWidth, height: originalHeight } = maskImage;
        const aspectRatio = originalWidth / originalHeight;

        let gridWidth: number, gridHeight: number;
        if (aspectRatio > 1) {
          gridWidth = gridSize;
          gridHeight = Math.round(gridSize / aspectRatio);
        } else {
          gridHeight = gridSize;
          gridWidth = Math.round(gridSize * aspectRatio);
        }

        canvas.width = gridWidth;
        canvas.height = gridHeight;
        ctx.drawImage(maskImage, 0, 0, gridWidth, gridHeight);
        const imageData = ctx.getImageData(0, 0, gridWidth, gridHeight);
        
        createGrid(config, imageData.data, gridWidth, gridHeight);
        resolve();
      };
    });
  };

  // --- Public API Functions (previously public methods) ---

  const update = () => {
    if (!isReady) return;
    // Continuous animation logic can go here
  };

const changeShape = (newId: GridId, oldId: GridId, callbacks?: { onStart?: () => void; onComplete?: () => void }) => {
    if (isAnimating || newId === oldId) return;
    isAnimating = true;
    callbacks?.onStart?.();
    const newGrid = grids.get(newId);
    const oldGrid = grids.get(oldId);

    // A single, master timeline. The onComplete will only run when
    // ALL animations within it are finished, fixing the race condition.
    const masterTl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
        callbacks?.onComplete?.();
      }
    });

    const defaults = {
      ease: 'power3.inOut',
      duration: animationDuration
    };

    // Animate the old grid out (if it exists)
  if (oldGrid) {
    oldGrid.children.forEach((child, index) => {
      masterTl.to(child.scale, { ...defaults, x: 0, y: 0, z: 0 }, index * 0.001);
      masterTl.to(child.position, { ...defaults, z: -6, onComplete: () => { gsap.set(child.position, { z: 0 }); } }, '<');
    });
  }

    // Animate the new grid in (if it exists)
  if (newGrid) {
    const revealStartTime = animationDuration * 0.25;
    newGrid.children.forEach((child, index) => {
      masterTl.to(child.scale, { ...defaults, x: 1, y: 1, z: 1 }, revealStartTime + index * 0.001);
      masterTl.to(child.position, { ...defaults, z: 0 }, '<');
    });
  }
  };
  // --- Initialization Logic ---
  const init = async () => {
    scene.add(group);
    await Promise.all(gridsConfig.map(config => createGridFromMask(config)));
    
    group.scale.setScalar(0.15);
    
    grids.forEach((grid, id) => {
      if (id !== 'heart') {
        grid.children.forEach(mesh => mesh.scale.setScalar(0));
      }
    });

    isReady = true; // Mutate the state variable
  };

  init(); // Start the async initialization process

  // --- Return the Public API ---
  // We use a getter for `isReady` so the consumer always gets the current value.
  return {
    get isReady() { return isReady; },
    group,
    update,
    changeShape,
  };
}

interface GLAppAPI {
  models: ModelsAPI;
  animate: () => void;
  cleanup: () => void;
}

// --- The Factory Function: createGLApp ---
export function createGLApp(container: HTMLElement): GLAppAPI {
  let animationFrameId: number | null = null;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  container.appendChild(renderer.domElement);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.z = 6;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 3);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  const models = createModels(scene);

  const handleMouseMove = (event: MouseEvent) => {
    // This is where you can add mouse interaction logic
  };

  const dbClick = () => {
    const fullscreenElement = document.fullscreenElement;
    if (!fullscreenElement) {
        if (container.requestFullscreen) {
            container.requestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
  };

  const onResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    const newPixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(newPixelRatio);
  };

  onResize();

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    if (models.isReady) {
      models.update();
    }
    controls.update();
    renderer.render(scene, camera);
  };

  const cleanup = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    window.removeEventListener('resize', onResize);
    container.removeEventListener('mousemove', handleMouseMove);
    container.removeEventListener('dblclick', dbClick);

    if (container && renderer.domElement) {
      container.removeChild(renderer.domElement);
    }

    renderer.dispose();
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  };

  window.addEventListener('resize', onResize);
  container.addEventListener('mousemove', handleMouseMove);
  container.addEventListener('dblclick', dbClick);

  return { models, animate, cleanup };
}