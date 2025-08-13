import React, { useRef, useEffect } from "react";
import { onResize, dbClick } from '../util/utils'
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import {intializeRendererControls} from '../util/rendererControl'

const clock = new THREE.Clock();
export const Test =()=> {
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

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      1000
    );
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const pointLight = new THREE.PointLight(0xffffff, 1.5);
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
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), material);
    plane.position.set(0, 0 ,0);
    plane.rotation.x = Math.PI / -2
    plane.receiveShadow = true
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.2, 16, 32),
      material
    );
    cube.position.set(1, 1, -1);
    cube.scale.set(1, 1, 1);
    cube.castShadow = true
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

        const mesh1 = new THREE.Mesh(
            new THREE.TorusGeometry(1, 0.4, 16, 60),
            new THREE.MeshBasicMaterial({color: '#ff0000'})
        )
        const mesh2 = new THREE.Mesh(
            new THREE.ConeGeometry(1, 2, 32),
            new THREE.MeshBasicMaterial({color: '#ff0000'})
        )
        const mesh3 = new THREE.Mesh(
            new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
            new THREE.MeshBasicMaterial({color: '#ff0000'})
        )
        scene.add(mesh1, mesh2, mesh3)

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
      geometry.dispose();
      material.dispose();
      plane.dispose();
      renderer.dispose();

      gui.destroy();
    };
  }, []);

  return <div className="w-screen h-screen" ref={mountRef} />;
}
