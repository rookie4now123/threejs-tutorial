import React, { useRef, useEffect } from "react";
import { onResize, dbClick } from "../util/utils";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { intializeRendererControls } from "../util/rendererControl";

const clock = new THREE.Clock();
export const Memorytest = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef(0);

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

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      1000
    );
    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.x = 2;
    pointLight.position.y = 3;
    pointLight.position.z = 4;

    function createImage() {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;

      const context = canvas.getContext("2d");
      context.fillStyle =
        "rgb(" +
        Math.floor(Math.random() * 256) +
        "," +
        Math.floor(Math.random() * 256) +
        "," +
        Math.floor(Math.random() * 256) +
        ")";
      context.fillRect(0, 0, 256, 256);

      return canvas;
    }

    const axesHelper = new THREE.AxesHelper();
    scene.add(axesHelper);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    camera.position.set(1, 1, 150);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    const animate = () => {
      const geometry = new THREE.SphereGeometry(
        50,
        Math.random() * 64,
        Math.random() * 32
      );
      const texture = new THREE.CanvasTexture(createImage());
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        wireframe: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      renderer.render(scene, camera);
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      texture.dispose();

      controls.update();
      requestAnimationFrame(animate);
    };

    animate();
    intializeRendererControls(gui, renderer);
    const handleResizeControl = () => onResize(camera, renderer);
    const handleDbClick = () => dbClick(canvas);
    addEventListener("dblclick", handleDbClick);
    addEventListener("resize", handleResizeControl);

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      cancelAnimationFrame(animationFrameId.current);
      removeEventListener("resize", handleResizeControl);
      removeEventListener("dblclick", dbClick);
      renderer.dispose();
      gui.destroy();
    };
  }, []);

  return <div className="w-screen h-screen" ref={mountRef} />;
};
