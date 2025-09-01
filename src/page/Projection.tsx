import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'; 
import { onResize, dbClick } from '../util/utils'


export default function Projection() {
  const mountRef = useRef<HTMLDivElement>(null);

  const gridSize = 24;
  const spacing = 0.65
  type MaskData = {
  gridWidth: number;
  gridHeight: number;
  data: Uint8ClampedArray; // The type for pixel data
};
  useEffect(() => {
    const gui = new GUI();
    //const canvas = document.querySelector('canvas.webgl');
    
    if (!mountRef.current) return;

    const sizes = {
      width : mountRef.current.clientWidth,
      height : mountRef.current.clientHeight
    }
    const renderer = new THREE.WebGLRenderer({ antialias: true, });
    renderer.setSize(
      sizes.width,
      sizes.height
    );

    renderer.setPixelRatio(Math.min(devicePixelRatio, 2 ))
    mountRef.current.appendChild(renderer.domElement);
    const canvas = renderer.domElement;
    mountRef.current.appendChild(canvas);

    const group = new THREE.Group();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      1000
    );
    const meshes: Mesh[] = [];
    const createGrid = (material: THREE.Material, maskInfo: MaskData) => {
      const { gridWidth, gridHeight, data } = maskInfo;
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          const meshGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
          const flippedY = gridHeight - 1 - y
          const pixelIndex = (flippedY * gridWidth + x) * 4
          const r = data[pixelIndex]
          const g = data[pixelIndex + 1]
          const b = data[pixelIndex + 2]

          const brightness = (r + g + b) / 3

          if(brightness < 128){
                      const uvX = x / gridSize;
          const uvY = y / gridSize;
          const uvWidth = 1 / gridSize;
          const uvHeight = 1 / gridSize;

          const uvAttribute = meshGeometry.attributes.uv
          const uvArray = uvAttribute.array

          for(let i = 0; i < uvArray.length; i += 2){
            uvArray[i] = uvX + (uvArray[i] * uvWidth)
            uvArray[i + 1] = uvY + (uvArray[i + 1] * uvHeight) 
          }
          uvAttribute.needsUpdate = true;

          const mesh = new THREE.Mesh(meshGeometry, material);
          mesh.position.x = (x - (gridSize - 1) / 2) * spacing;
          mesh.position.y = (y - (gridSize - 1) / 2) * spacing;
          mesh.position.z;
          group.add(mesh);
          meshes.push(mesh);
          }
        }
      }
      group.scale.setScalar(0.5);
    };

    const createVideoTexture = () => {
      const video = document.createElement("video");
      video.src =
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.play();

      // Create video texture
      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.colorSpace = THREE.SRGBColorSpace;
      videoTexture.wrapS = THREE.ClampToEdgeWrap;
      videoTexture.wrapT = THREE.ClampToEdgeWrap;

      // Create material with video texture
      const videoMaterial = new THREE.MeshBasicMaterial({
        map: videoTexture,
        side: THREE.FrontSide,
      });
      return videoMaterial;
    };

    const videoMaterial = createVideoTexture();

    const createMask=()=>{
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const maskImage = new Image()
      maskImage.crossOrigin = 'anonymous'
      maskImage.onload=()=>{
        if (!ctx) return;
            const originalWidth = maskImage.width
            const originalHeight = maskImage.height
            const aspectRatio = originalWidth / originalHeight
            let gridWidth, gridHeight;
            if(aspectRatio > 1){
              gridWidth = gridSize;
              gridHeight = Math.round(gridSize / aspectRatio)
            }else{
              gridHeight = gridSize
              gridWidth = Math.round(gridSize * aspectRatio)
            }

            canvas.width = gridWidth
            canvas.height = gridHeight
            ctx.drawImage(maskImage, 0, 0, gridWidth, gridHeight)
            const imageData = ctx.getImageData(0, 0, gridWidth, gridHeight)
            const data = imageData.data
            createGrid(videoMaterial, { gridWidth, gridHeight, data });
      }
      maskImage.src = '../heart.jpg'
    }
    
    
    createMask();

    scene.add( group );

    const ambient_light = new THREE.AmbientLight( 0xffffff ); // soft 
		scene.add( ambient_light );
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    camera.position.set(1,1,5)
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true;
    //camera.lookAt(cube.position)

    const animate = () => {
      controls.update();
      requestAnimationFrame(animate);
      meshes.forEach((mesh,index) => {
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.005;
        mesh.position.z = Math.sin(Date.now() * 0.005 + index * 0.1) * 0.1
      });
      renderer.render(scene, camera);
    };
    const handleResizeControl = () => onResize(camera, renderer);
    const handleDbClick = () => dbClick(canvas)
    window.addEventListener("dblclick", handleDbClick);
    window.addEventListener("resize", handleResizeControl);

    animate();

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      removeEventListener('resize', handleResizeControl);
      removeEventListener('dblclick', dbClick);
  meshes.forEach((mesh) => {
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    if (mesh.material) {
      if (mesh.material.map) {
        mesh.material.map.dispose();
      }
      mesh.material.dispose();
    }
  });
    if (scene) {
      while (scene.children.length > 0) {
          scene.remove(scene.children[0]);
      }
  }
      gui.destroy();
      renderer.dispose();
    };
  }, []);

  return <div className="w-screen h-screen" ref={mountRef} />;
};
