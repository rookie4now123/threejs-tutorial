import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { onResize, dbClick } from '../util/utils'
import GUI from 'lil-gui'; 
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';

const clock = new THREE.Clock()

export default function Light() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const gui = new GUI();
      if (!mountRef.current) return;
      const sizes = {
        width : mountRef.current.clientWidth,
        height : mountRef.current.clientHeight
      }
      const renderer = new THREE.WebGLRenderer({ antialias: true, });
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      renderer.setSize(
        sizes.width,
        sizes.height
      );
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2 ))
      mountRef.current.appendChild(renderer.domElement);
      const canvas = renderer.domElement;
      mountRef.current.appendChild(canvas);
  
      const handleResizeControl=()=> onResize(camera, renderer)
      const handleDbClick=()=>dbClick(canvas)

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        sizes.width / sizes.height,
        0.1,
        1000
      );
      const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
      scene.add(ambientLight)
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3)
      directionalLight.position.set(1,0.25, 0).normalize();
      directionalLight.castShadow = true; // default false
      scene.add(directionalLight)
      const hemisphereLight = new THREE.HemisphereLight(0x11aaac, 0xbbe2f1, 2)
      scene.add(hemisphereLight)
    //   const pointLight = new THREE.PointLight(0xafcc1f, 10)
    //   pointLight.position.x = 2
    //   pointLight.position.y = 3
    //   pointLight.position.z = 4
    //   const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1)
    //   rectAreaLight.position.set( 0,0, 2 );
    //   const helper = new RectAreaLightHelper( rectAreaLight );
    //   rectAreaLight.add( helper )
    //   scene.add(rectAreaLight)

      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshStandardMaterial( { 
                        roughness: 0.4,
                        //color: 0xefefde 
                    },  );

      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = 0
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10)
        , material
      )
      plane.position.y = -0.5
      plane.rotation.x = Math.PI / -2
      plane.receiveShadow = true
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(0.3, 0.2, 16, 32),
        material
      )
      cube.scale.set(1,1,1)
      torus.position.x = 1.5
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        material
      )
      sphere.position.x = -1.5
      sphere.castShadow = true; //default is false
      sphere.receiveShadow = false; //default
      const axesHelper = new THREE.AxesHelper();
  
      scene.add(cube, plane, torus, sphere, 
                axesHelper,
            );

      camera.position.set(1,1,4)
      const controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true;

      gui.add(material, 'metalness').min(0).max(1).step(0.01)
      gui.add(material, 'roughness').min(0).max(1).step(0.01)
      gui.add(ambientLight, 'intensity').min(0).max(10).step(0.01).name('ambientInt')
      gui.add(directionalLight, 'intensity').min(0).max(3).step(0.01).name('DirecttInt')
      //gui.add(ambientLight, 'intensity').min(0).max(1).step(0.01)
      const animate = () => {
        const elapsedTime = clock.getElapsedTime()
        controls.update();
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
  
      animate();

      addEventListener('dblclick', handleDbClick);
      addEventListener('resize', handleResizeControl);
      return () => {
        if (mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
        removeEventListener('resize', handleResizeControl);
        removeEventListener('dblclick', dbClick);
        gui.destroy()
      };
    }, []);
  
    return <div className="w-screen h-screen" ref={mountRef} />;
  };