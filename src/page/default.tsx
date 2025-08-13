import React, { useRef, useEffect } from "react";
import { onResize, dbClick } from '../util/utils'
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";


const clock = new THREE.Clock();
export default function Loadfont() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const gui = new GUI();
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

    const handleResizeControl = () => onResize(camera, renderer);

    const dbClick = () => {
      if (!document.fullscreenElement) {
        canvas.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    };
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      1000
    );
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.x = 2;
    pointLight.position.y = 3;
    pointLight.position.z = 4;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      roughness: 0.4,
      color: 0x331ff0,
    });

    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = -1.5;
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    plane.position.set(-1, 2, -1);
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.2, 16, 32),
      material
    );
    cube.position.set(1, 1, -1);
    cube.scale.set(1, 1, 1);
    torus.position.z = 1.5;
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      material
    );
    sphere.position.x = -1.5;
    scene.add(cube, plane, torus);

    const axesHelper = new THREE.AxesHelper();
    scene.add(axesHelper);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    camera.position.set(1, 1, 4);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    gui.add(material, "metalness").min(0).max(1).step(0.01);
    gui.add(material, "roughness").min(0).max(1).step(0.01);
    gui.add(material, "displacementScale").min(0).max(1).step(0.01);
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      controls.update();
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    addEventListener("dblclick", dbClick);
    addEventListener("resize", handleResizeControl);
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      removeEventListener("resize", handleResizeControl);
      removeEventListener("dblclick", dbClick);
      geometry.dispose();
      material.dispose();
      gui.destroy();
      renderer.dispose();
    };
  }, []);

  return <div className="w-screen h-screen" ref={mountRef} />;
}
