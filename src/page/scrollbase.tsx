import { useRef, useEffect } from "react";
import { onResize, dbClick } from '../util/utils'
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { gsap } from "gsap"

export const Scrollbase =()=> {
  const currentHoveredObjectRef = useRef<THREE.Mesh | null>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const glowMeshesRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    // --- Basic Setup ---
    const clock = new THREE.Clock();
    const cursor ={x: 0, y:0 }
    const gui = new GUI();

    if (!mountRef.current) return;
    const sizes = {
      width: mountRef.current.clientWidth,
      height: mountRef.current.getBoundingClientRect().height,
    };

    const renderer = new THREE.WebGLRenderer({antialias: true });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const canvas = renderer.domElement;
    mountRef.current.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      35,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.set(0, 1, 30);
    const cameraGroup = new THREE.Group()
    scene.add(cameraGroup)
    cameraGroup.add(camera)

    let scrollY = window.scrollY
    const scroll = () => {
        scrollY = window.scrollY;
        // cameraGroup.position.y = -scrollY / sizes.height * objDistance;
      };
    const raycaster = new THREE.Raycaster();
    const mouseVector2 = new THREE.Vector2();

    // --- CHANGE 1: Corrected Mouse Coordinate Calculation ---
    const handleMousemove = (e: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = canvas.getBoundingClientRect();
      // Calculate mouse position relative to the canvas element
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Convert to normalized device coordinates (-1 to +1)
      mouseVector2.x = (x / rect.width) * 2 - 1;
      mouseVector2.y = -(y / rect.height) * 2 + 1;

      // Update cursor for parallax effect (also relative to canvas)
      cursor.x = (x / rect.width) - 0.5;
      cursor.y = (y / rect.height) - 0.5;
    }

    const parameters = {
        materialColor: '#1cca88',
        glowColor: '#d62977',
        glowScaleFactor: 1.05,
        glowOpacityPulse: 0.8
    }

    const textureLoader = new THREE.TextureLoader()
    const gradientTexture = textureLoader.load('/texture/fiveTone.jpg')
    const snowTexture = textureLoader.load('snowflake2_t.png')
    gradientTexture.magFilter = THREE.NearestFilter

    const material = new THREE.MeshToonMaterial({
      color: parameters.materialColor,
      gradientMap: gradientTexture,
    });

    gui.addColor(parameters, 'materialColor').onChange(() => material.color.set(parameters.materialColor))
    gui.addColor(parameters, 'glowColor').onChange(() => {
        glowMeshesRef.current.forEach(glowMesh => {
            if (glowMesh.material instanceof THREE.MeshBasicMaterial) {
                glowMesh.material.color.set(parameters.glowColor);
            }
        });
    });
    gui.add(parameters, 'glowScaleFactor', 1.0, 1.2, 0.001).name('GlowSizeFactor');
    gui.add(parameters, 'glowOpacityPulse', 0.1, 1.0, 0.01).name('GlowOpacity');

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 0).normalize();
    scene.add(light);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enabled = false;

    const objDistance = 4

    // --- Original Meshes ---
    const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);
    const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);
    const mesh3 = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16), material);

    mesh1.position.set(2, -objDistance * 0, 0);
    mesh2.position.set(-2, -objDistance * 1, 0);
    mesh3.position.set(2, -objDistance * 2, 0);

    // --- CHANGE 2: Create a dedicated array for hoverable objects ---
    const objectsToTest = [mesh1, mesh2, mesh3];


    // --- Glow Meshes ---
    const createGlowMesh = (originalMesh: THREE.Mesh) => {
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: parameters.glowColor,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false,
            side: THREE.BackSide
        });
        const glowMesh = new THREE.Mesh(originalMesh.geometry, glowMaterial); // No need to clone, geometry is shared
        glowMesh.position.copy(originalMesh.position);
        originalMesh.userData.glowMesh = glowMesh;
        return glowMesh;
    };

    const glowMesh1 = createGlowMesh(mesh1);
    const glowMesh2 = createGlowMesh(mesh2);
    const glowMesh3 = createGlowMesh(mesh3);

    glowMeshesRef.current.push(glowMesh1, glowMesh2, glowMesh3);

    const group = new THREE.Group()
    group.add(...objectsToTest, ...glowMeshesRef.current);
    scene.add(group)

    // --- Comet Animation (Particle System) ---
    // ... (Your comet code is fine, no changes needed here) ...
    const numberOfComets = 2000;
    const cometSpeedRange = { min: 0.5, max: 20 };
    const cometYRange = { min: -15, max: 15 };
    const cometZRange = { min: -15, max: 15 };
    const endXThreshold = 30;

    for (let i = 0; i < numberOfComets; i++) {
        const particleGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([0, 0, 0]);
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        const particleMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, sizeAttenuation: true, map: snowTexture });
        const comet = new THREE.Points(particleGeometry, particleMaterial);
        const initialY = Math.random() * (cometYRange.max - cometYRange.min) + cometYRange.min;
        const initialZ = Math.random() * (cometZRange.max - cometZRange.min) + cometZRange.min;
        const initialX = Math.random() * (cometZRange.max - cometZRange.min) + cometZRange.min - 10;
        comet.position.set(initialX, initialY, initialZ);
        const speed = Math.random() * (cometSpeedRange.max - cometSpeedRange.min) + cometSpeedRange.min;
        const velocity = new THREE.Vector3(speed, (Math.random() - 0.5) * speed * 0.1, (Math.random() - 0.5) * speed * 0.1);
        comet.userData = { velocity, initialPosition: comet.position.clone(), endXThreshold };
        scene.add(comet);
    }
    // --- End Comet Animation ---

    const normalScale = 1;
    const hoverScaleFactor = 1.2;
    const pulseDuration = 0.8;
    const scaleDuration = pulseDuration * 0.5;

    let previousTime = 0
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - previousTime
      previousTime = elapsedTime

      cameraGroup.position.x += (cursor.x * 10 - cameraGroup.position.x) * deltaTime * 3
      cameraGroup.position.y += (-cursor.y * 10 - cameraGroup.position.y) * deltaTime * 3

      // --- Object & Glow Animation ---
      objectsToTest.forEach(originalMesh => {
          const glowMesh = originalMesh.userData.glowMesh as THREE.Mesh;

          if (originalMesh !== currentHoveredObjectRef.current) {
              originalMesh.rotation.x += (Math.sin(elapsedTime * 0.5) - 0.5) * deltaTime * 2;
              originalMesh.rotation.y += (Math.cos(elapsedTime * 0.5) - 0.5) * deltaTime * 2;
          }
          if (glowMesh) {
             glowMesh.scale.copy(originalMesh.scale).multiplyScalar(parameters.glowScaleFactor);
             glowMesh.rotation.copy(originalMesh.rotation);
          }
      });

      // --- Comet Animation Update ---
      // ... (Your comet animation update code is fine) ...
      for ( let i = 0; i < scene.children.length; i ++ ) {
        const object = scene.children[ i ];
        if ( object instanceof THREE.Points && object.userData.velocity ) {
          object.position.addScaledVector(object.userData.velocity, deltaTime);
          if (object.position.x > object.userData.endXThreshold) {
              const startX = object.userData.initialPosition.x;
              const newY = Math.random() * (cometYRange.max - cometYRange.min) + cometYRange.min;
              const newZ = Math.random() * (cometZRange.max - cometZRange.min) + cometZRange.min;
              object.position.set(startX + (Math.random()-0.5)*5, newY, newZ);
          }
        }
      }

      // --- Hover Detection and Animation Logic ---
      raycaster.setFromCamera(mouseVector2, camera);

      // --- CHANGE 2 (cont.): Raycast against the specific list of objects ---
      const intersects = raycaster.intersectObjects(objectsToTest);

      const intersectedOriginalMesh = (intersects.length > 0 ? intersects[0].object : null) as THREE.Mesh | null;

      if (intersectedOriginalMesh !== currentHoveredObjectRef.current) {
        if (currentHoveredObjectRef.current) {
            const prevOriginalMesh = currentHoveredObjectRef.current;
            const prevGlowMesh = prevOriginalMesh.userData.glowMesh;

            gsap.killTweensOf(prevOriginalMesh.scale);
            gsap.to(prevOriginalMesh.scale, {
                x: normalScale, y: normalScale, z: normalScale,
                duration: scaleDuration, ease: "power2.out"
            });

            if (prevGlowMesh?.material) {
                 gsap.killTweensOf(prevGlowMesh.material);
                 gsap.to(prevGlowMesh.material, { opacity: 0, duration: scaleDuration * 0.5 });
            }
        }

        currentHoveredObjectRef.current = intersectedOriginalMesh;

        if (currentHoveredObjectRef.current) {
             const currentOriginalMesh = currentHoveredObjectRef.current;
             const currentGlowMesh = currentOriginalMesh.userData.glowMesh;

             gsap.killTweensOf(currentOriginalMesh.scale);
             gsap.to(currentOriginalMesh.scale, {
                 x: hoverScaleFactor, y: hoverScaleFactor, z: hoverScaleFactor,
                 duration: scaleDuration, ease: "power2.out",
                 yoyo: true, repeat: -1
             });

             if (currentGlowMesh?.material) {
                 gsap.killTweensOf(currentGlowMesh.material);
                 gsap.fromTo(currentGlowMesh.material,
                     { opacity: 0 },
                     { opacity: parameters.glowOpacityPulse, duration: pulseDuration * 0.5, ease: "power2.out", yoyo: true, repeat: -1 }
                 );
             }
        }
      }

      if(controls.enabled) controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    //const handleResizeControl = () => onResize(camera, renderer);
    const handleResizeControl = () => {
      // Use the canvas's client dimensions to set sizes
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };
    const handleDbClick = () => dbClick(canvas)

    window.addEventListener('scroll', scroll);
    window.addEventListener("dblclick", handleDbClick);
    window.addEventListener("resize", handleResizeControl);
    window.addEventListener("mousemove", handleMousemove);

    animate();

    // --- CHANGE 3: Refined Cleanup Function ---
    return () => {
      window.removeEventListener('scroll', scroll);
      window.removeEventListener("dblclick", handleDbClick);
      window.removeEventListener("resize", handleResizeControl);
      window.removeEventListener("mousemove", handleMousemove);

      // Kill all GSAP animations BEFORE disposing objects
      gsap.globalTimeline.clear(); // A more robust way to kill all tweens
      
      // Dispose Three.js objects
      scene.traverse(object => {
          if (object instanceof THREE.Mesh) {
              object.geometry.dispose();
              if (Array.isArray(object.material)) {
                  object.material.forEach(material => material.dispose());
              } else {
                  object.material.dispose();
              }
          }
          if (object instanceof THREE.Points) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                object.material.dispose();
            }
          }
      });
      gradientTexture.dispose();
      snowTexture.dispose();
      
      scene.clear();
      renderer.dispose();
      gui.destroy();

      if (mountRef.current && mountRef.current.contains(canvas)) {
        mountRef.current.removeChild(canvas);
      }
      
      glowMeshesRef.current = [];
      currentHoveredObjectRef.current = null;
    };
  }, []);

  return (
    <div
        className="w-screen h-screen"
        ref={mountRef}
        style={{ position: 'relative', overflow: 'hidden' }}
    >
    </div>
  );
}