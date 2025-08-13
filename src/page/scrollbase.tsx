import { useRef, useEffect } from "react";
import { onResize, dbClick } from '../util/utils'
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import {intializeRendererControls} from '../util/rendererControl'
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
      height: mountRef.current.getBoundingClientRect().height, // Get actual height
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
    camera.position.set(0, 1, 30); // Set initial position correctly
    const cameraGroup = new THREE.Group()
    scene.add(cameraGroup)
    cameraGroup.add(camera)

    let scrollY = window.scrollY
    const scroll = () => {
        scrollY = window.scrollY;
        // Optional: Move the camera group based on scroll
        // cameraGroup.position.y = -scrollY / sizes.height * objDistance; // Adjust sensitivity
      };
    const raycaster = new THREE.Raycaster();
    const mouseVector2 = new THREE.Vector2();

    const handleMousemove = (e) => {
      mouseVector2.x = (e.clientX / sizes.width) * 2 - 1;
      mouseVector2.y = - (e.clientY / sizes.height) * 2 + 1; // Y is inverted
      cursor.x = e.clientX / sizes.width - 0.5
      cursor.y = e.clientY / sizes.height - 0.5
    }

    const parameters = {
        materialColor: '#1cca88',
        glowColor: '#d62977', // Color for the glowing effect
        glowScaleFactor: 1.05, // How much bigger the glow mesh is RELATIVE to the original
        glowOpacityPulse: 0.8 // Max opacity for the glow pulse
    }

    const textureLoader = new THREE.TextureLoader()
    const gradientTexture = textureLoader.load('/texture/fiveTone.jpg')
    const snowTexture = textureLoader.load('snowflake2_t.png')
    gradientTexture.magFilter = THREE.NearestFilter

    const material = new THREE.MeshToonMaterial({
      color: parameters.materialColor,
      gradientMap: gradientTexture,
    });

    gui.addColor(parameters, 'materialColor')
       .onChange(()=>{
            material.color.set(parameters.materialColor)
       })
    gui.addColor(parameters, 'glowColor')
       .onChange(()=>{
            glowMeshesRef.current.forEach(glowMesh => {
                 if (glowMesh.material instanceof THREE.MeshBasicMaterial) {
                     glowMesh.material.color.set(parameters.glowColor);
                 }
            });
       });
    gui.add(parameters, 'glowScaleFactor', 1.0, 1.2, 0.001).name('GlowSizeFactor'); // Renamed for clarity
    gui.add(parameters, 'glowOpacityPulse', 0.1, 1.0, 0.01).name('GlowOpacity');


    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 0).normalize();
    scene.add(light);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enabled = false; // Disable OrbitControls initially

    const objDistance = 4

    // --- Original Meshes ---
    const mesh1 = new THREE.Mesh(
            new THREE.TorusGeometry(1, 0.4, 16, 60),
            material
        )

    const mesh2 = new THREE.Mesh(
            new THREE.ConeGeometry(1, 2, 32),
            material
        )
    const mesh3 = new THREE.Mesh(
            new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
            material
        )

    mesh1.position.y = -objDistance * 0
    mesh2.position.y = -objDistance * 1
    mesh3.position.y = -objDistance * 2

    mesh1.position.x = 2
    mesh2.position.x = -2
    mesh3.position.x = 2

    // --- Glow Meshes ---
    const createGlowMesh = (originalMesh) => {
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: parameters.glowColor,
            transparent: true,
            opacity: 0, // Start hidden
            blending: THREE.AdditiveBlending, // Make it glow
            depthWrite: false, // Don't write to depth buffer
            depthTest: false,  // Disable depth testing
            side: THREE.BackSide // Render both sides for a full halo effect
        });

        // Use the same geometry, but clone it to be safe
        const glowMesh = new THREE.Mesh(originalMesh.geometry.clone(), glowMaterial);

        glowMesh.position.copy(originalMesh.position);
        originalMesh.userData.glowMesh = glowMesh;

        return glowMesh;
    };

    const glowMesh1 = createGlowMesh(mesh1);
    const glowMesh2 = createGlowMesh(mesh2);
    const glowMesh3 = createGlowMesh(mesh3);

    // Add glow meshes to the ref for cleanup and GUI color update
    glowMeshesRef.current.push(glowMesh1, glowMesh2, glowMesh3);


    const group = new THREE.Group()
    // Add both original and glow meshes to the group
    group.add(mesh1, glowMesh1, mesh2, glowMesh2, mesh3, glowMesh3);
    scene.add(group)


    // --- Comet Animation (Existing Particle System) ---
     const numberOfComets = 2000;
     const cometSpeedRange = { min: 0.5, max: 20 };
     const cometYRange = { min: -15, max: 15 };
     const cometZRange = { min: -15, max: 15 };
     const endXThreshold = 30;

     for (let i = 0; i < numberOfComets; i++) {
         const particleGeometry = new THREE.BufferGeometry();
         const vertices = new Float32Array([0, 0, 0]);
         particleGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
         const particleMaterial = new THREE.PointsMaterial({
             color: 0xffffff,
             size: 0.5,
             sizeAttenuation: true,
             map: snowTexture
         });
         const comet = new THREE.Points(particleGeometry, particleMaterial);

         const initialY = Math.random() * (cometYRange.max - cometYRange.min) + cometYRange.min;
         const initialZ = Math.random() * (cometZRange.max - cometZRange.min) + cometZRange.min;
         const initialX = Math.random() * (cometZRange.max - cometZRange.min) + cometZRange.min - 10;

         comet.position.set(initialX, initialY, initialZ);

         const speed = Math.random() * (cometSpeedRange.max - cometSpeedRange.min) + cometSpeedRange.min;
         const velocity = new THREE.Vector3(speed, (Math.random() - 0.5) * speed * 0.1, (Math.random() - 0.5) * speed * 0.1);

         comet.userData.velocity = velocity;
         comet.userData.initialPosition = comet.position.clone();
         comet.userData.endXThreshold = endXThreshold;

         scene.add(comet);
     }
    // --- End Comet Animation ---


    // --- Hover Animation Parameters ---
    const normalScale = 1; // Scale for the original mesh itself when not hovered
    const hoverScaleFactor = 1.2; // How much bigger the original mesh scales on hover
    const pulseDuration = 0.8; // Duration for one heartbeat pulse cycle
    const scaleDuration = pulseDuration * 0.5; // Time for the original mesh scale up/down


    // --- Animation Loop ---
    let previousTime = 0

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - previousTime
      previousTime = elapsedTime

      // --- Camera Parallax ---
      cameraGroup.position.x += (cursor.x * 10 - cameraGroup.position.x) * deltaTime * 3
      cameraGroup.position.y += (-cursor.y * 10 - cameraGroup.position.y) * deltaTime * 3

      // --- Object Animation (Rotation and Glow Scale Sync) ---
      // Iterate through all children in the group
      group.children.forEach(child => {
          // Check if this child is one of the original meshes
          if (child instanceof THREE.Mesh && child.userData.hasOwnProperty('glowMesh')) {
              const originalMesh = child; // The child is the original mesh
              const glowMesh = originalMesh.userData.glowMesh; // Get its corresponding glow mesh

              // Apply individual rotation to the original mesh ONLY IF it's NOT currently hovered
              if (originalMesh !== currentHoveredObjectRef.current) {
                   originalMesh.rotation.x += (Math.sin(elapsedTime * 0.5) - 0.5) * deltaTime * 2;
                   originalMesh.rotation.y += (Math.cos(elapsedTime * 0.5) - 0.5) * deltaTime * 2;
              }

              // --- Sync Glow Mesh Scale and Rotation ---
              // The glow mesh's scale should be the original mesh's CURRENT scale * glowScaleFactor
              // This handles both the normal state (scale 1) and the pulsed state (scale > 1)
              if (glowMesh instanceof THREE.Mesh) {
                 glowMesh.scale.copy(originalMesh.scale).multiplyScalar(parameters.glowScaleFactor);

                 // The glow mesh's rotation should always match the original mesh's rotation
                 glowMesh.rotation.copy(originalMesh.rotation);
              }
          }
           // If the child is NOT an original mesh (it's a glow mesh we created earlier),
           // its position, rotation, and scale are handled here based on its original mesh parent,
           // and its opacity is handled by the GSAP tween on hover.
      });


      // --- Comet Animation (Existing) ---
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
      // Raycast against ALL children in the group (original and glow meshes)
      // We'll filter results to make sure we only react to original meshes
      const intersects = raycaster.intersectObjects(group.children);

      let intersectedOriginalMesh: THREE.Mesh | null = null;
      if (intersects.length > 0 && intersects[0].object instanceof THREE.Mesh) {
           // We only care if the intersected object is one of the *original* meshes
           // Check if it has the 'glowMesh' property in userData
           const hitObject = intersects[0].object as THREE.Mesh;
           if (hitObject.userData.hasOwnProperty('glowMesh')) {
             intersectedOriginalMesh = hitObject;
           }
      }

      // --- Handle Hover State Change ---
      if (intersectedOriginalMesh !== currentHoveredObjectRef.current) {

        // If mouse left the *previously* hovered object
        if (currentHoveredObjectRef.current) {
            // Kill GSAP tweens on the original mesh scale
            gsap.killTweensOf(currentHoveredObjectRef.current.scale);
            // Tween original mesh scale back down to normal
            gsap.to(currentHoveredObjectRef.current.scale, {
                x: normalScale,
                y: normalScale,
                z: normalScale,
                duration: scaleDuration,
                ease: "power2.out"
            });

            // Get the corresponding glow mesh
            const prevGlowMesh = currentHoveredObjectRef.current.userData.glowMesh;
            if (prevGlowMesh && prevGlowMesh.material instanceof THREE.MeshBasicMaterial) {
                 // Kill GSAP tweens on the glow material opacity
                 gsap.killTweensOf(prevGlowMesh.material);
                 // Tween glow material opacity to 0
                 gsap.to(prevGlowMesh.material, {
                     opacity: 0,
                     duration: scaleDuration * 0.5, // Fade out faster
                 });
            }
        }

        // Update the currently hovered object ref
        currentHoveredObjectRef.current = intersectedOriginalMesh;

        // If mouse entered a *new* object
        if (currentHoveredObjectRef.current) {
             // --- Original Mesh Pulse Animation ---
             gsap.killTweensOf(currentHoveredObjectRef.current.scale);
             gsap.to(currentHoveredObjectRef.current.scale, {
                 x: hoverScaleFactor,
                 y: hoverScaleFactor,
                 z: hoverScaleFactor,
                 duration: scaleDuration,
                 ease: "power2.out",
                 yoyo: true,
                 repeat: -1,
                 repeatDelay: 0
             });

             // --- Glow Mesh Animation (Opacity Pulse) ---
             const currentGlowMesh = currentHoveredObjectRef.current.userData.glowMesh;
             if (currentGlowMesh && currentGlowMesh.material instanceof THREE.MeshBasicMaterial) {
                 // Kill any existing tweens on the glow material opacity
                 gsap.killTweensOf(currentGlowMesh.material);

                 // Start the pulse animation for glow material opacity
                 gsap.fromTo(currentGlowMesh.material,
                     { opacity: 0 }, // Start from fully transparent
                     {
                         opacity: parameters.glowOpacityPulse, // Pulse up to max glow opacity
                         duration: pulseDuration * 0.5, // Half the pulse duration
                         ease: "power2.out",
                         yoyo: true, // Pulse back down towards a lower opacity (or 0)
                         repeat: -1, // Repeat infinitely
                         repeatDelay: 0
                     }
                 );
             }
        }
      }

      if(controls.enabled) controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    // --- Event Listeners ---
    const handleResizeControl = () => onResize(camera, renderer);
    const handleDbClick = () => dbClick(canvas)

    window.addEventListener('scroll', scroll);
    window.addEventListener("dblclick", handleDbClick);
    window.addEventListener("resize", handleResizeControl);
    window.addEventListener("mousemove", handleMousemove);

    animate();
    // intializeRendererControls(gui, renderer) // Optional GUI for renderer settings

    // --- Cleanup Function ---
    return () => {
      window.removeEventListener('scroll', scroll);
      window.removeEventListener("dblclick", handleDbClick);
      window.removeEventListener("resize", handleResizeControl);
      window.removeEventListener("mousemove", handleMousemove);

      // Dispose Three.js objects
      group.children.forEach(child => {
          // Dispose geometry if it's an original mesh (geometry is shared material)
          if (child instanceof THREE.Mesh && child.userData.hasOwnProperty('glowMesh')) {
              child.geometry.dispose(); // Dispose original mesh geometry
          }
          // Dispose material if it's a glow mesh
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
              child.material.dispose(); // Dispose glow mesh material
               // No need to dispose glow mesh geometry here, it was a clone of the original
          }
      });
      // Dispose shared material for original meshes
      material.dispose();

       // Dispose comet objects
       scene.children.forEach(obj => {
          if (obj instanceof THREE.Points) {
              obj.geometry.dispose();
              if (Array.isArray(obj.material)) {
                  obj.material.forEach(m => m.dispose());
              } else {
                  obj.material.dispose();
              }
          }
      });

       group.clear(); // Removes all children (original and glow meshes)
       scene.remove(group);

      renderer.dispose();
      gui.destroy();

      // Kill any potentially running GSAP tweens on component unmount
      // Iterate through all meshes in the group
       group.children.forEach(child => {
           if (child instanceof THREE.Mesh) {
                gsap.killTweensOf(child.scale); // Kill scale tweens (original meshes)
                if (child.material instanceof THREE.MeshBasicMaterial || child.material instanceof THREE.MeshToonMaterial) {
                     gsap.killTweensOf(child.material); // Kill material tweens (glow meshes opacity)
                }
           }
       });
       if (currentHoveredObjectRef.current) {
            const glowMesh = currentHoveredObjectRef.current.userData.glowMesh;
             if (glowMesh && glowMesh.material instanceof THREE.MeshBasicMaterial) {
                 gsap.killTweensOf(glowMesh.material);
             }
       }


      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
       // Clear the ref
       glowMeshesRef.current = [];
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