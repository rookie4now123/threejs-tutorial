import { useRef, useEffect } from "react";
import { onResize, dbClick } from '../util/utils'
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import {intializeRendererControls} from '../util/rendererControl'
import { random } from "gsap";

//Galaxy
const parameters = {
  count: 10000, // Example initial value
  size: 0.005,  // Example initial value
  radius: 5,
  branches: 3,
  spin: 3,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: '#ff6030',
  outsideColor: '#1b3984',
  ellipseX: 1.5,
  ellipseZ: 0.75,
  ellipseY: 1,
  verticalThickness: 0.6 
  // Add other parameters if needed
};

const clock = new THREE.Clock();
export const Test2 =()=> {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => { 
    const gui = new GUI({width: 300});
    if (!mountRef.current) return;
    const sizes = {
      width: mountRef.current.clientWidth,
      height: mountRef.current.clientHeight,
    };
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    const canvas = renderer.domElement;
    mountRef.current.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      1000
    );

    let geometry = null;
    let material = null;
    let points = null; 
    const generateGalaxy = () => {
      // Destroy old galaxy
      if (geometry || material || points) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
      }
    
      geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(parameters.count * 3);
      const colors = new Float32Array(parameters.count * 3);
      const colorInside = new THREE.Color(parameters.insideColor);
      const colorOutside = new THREE.Color(parameters.outsideColor);
    
      for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;
        const ellipseAngle = Math.random() * Math.PI *5;
        const ellipseRadius = Math.sqrt(Math.random());
        //const radius = Math.pow(Math.random(), 2) * parameters.radius;
        const radius = ellipseRadius * Math.cos(ellipseAngle) * parameters.radius;
        const spinAngle = radius * parameters.spin;
        const branchAngle = (Math.floor(Math.random() * parameters.branches) / parameters.branches) * Math.PI * 2;
    
        // --- MODIFICATION START ---
    
        // Calculate the base circular position
        const angle = branchAngle + spinAngle;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
    
        // Apply the elliptical scaling
        const finalX = x * parameters.ellipseX;
        const finalZ = z * parameters.ellipseZ;
    
        // Also scale the randomness to match the ellipse shape for a more natural look
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius * parameters.ellipseX;
        const randomY = ellipseRadius * Math.sin(ellipseAngle) * parameters.ellipseY;
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius * parameters.ellipseZ;
    
        positions[i3]     = finalX + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = finalZ + randomZ;
        // --- MODIFICATION END ---
    
        // Color (no change needed here)
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / parameters.radius);
        colors[i3]     = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
      }
    
      geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      );
    
      geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3)
      );
    
      material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
      });
    
      points = new THREE.Points(geometry, material);
      scene.add(points);
    };
    generateGalaxy()
    gui.add(parameters, 'count').min(100)
                      .max(100000).step(100).onFinishChange(generateGalaxy)
    gui.add(parameters, 'size').min(0.001)
                      .max(0.1).step(0.001).onFinishChange(generateGalaxy)
    gui.add(parameters, 'radius').min(0.01)
                      .max(20).step(0.01).onFinishChange(generateGalaxy)
    gui.add(parameters, 'branches').min(2)
                      .max(20).step(1).onFinishChange(generateGalaxy)
    gui.add(parameters, 'spin').min(-5)
                      .max(5).step(0.001).onFinishChange(generateGalaxy)
    gui.add(parameters, 'randomness').min(0)
                      .max(2).step(0.001).onFinishChange(generateGalaxy)
    gui.add(parameters, 'randomnessPower').min(1)
                      .max(10).step(0.001).onFinishChange(generateGalaxy)
    gui.add(parameters, 'ellipseZ').min(1)
                      .max(10).step(0.001).onFinishChange(generateGalaxy)
    gui.add(parameters, 'insideColor').onFinishChange(generateGalaxy)
    gui.add(parameters, 'outsideColor').onFinishChange(generateGalaxy)

    const axesHelper = new THREE.AxesHelper();
    scene.add(axesHelper);

    camera.position.set(1, 1, 4);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      controls.update();
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();
    intializeRendererControls(gui, renderer)
    const handleResizeControl = () => onResize(camera, renderer);
    const handleDbClick = () => dbClick(canvas)
    addEventListener("dblclick", handleDbClick);
    addEventListener("resize", handleResizeControl);
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      removeEventListener("resize", handleResizeControl);
      removeEventListener("dblclick", dbClick);
      // geometry.dispose();
      // material.dispose();
      renderer.dispose();

      gui.destroy();
    };
  }, []);

  return <div className="w-screen h-screen" ref={mountRef} />;
}
