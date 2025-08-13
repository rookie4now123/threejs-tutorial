import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import GUI from 'lil-gui'; 
import cabi from '@assets/cabi.jpg';
import hippo from '@assets/hippo.png';
import CustomBounce from 'gsap/CustomBounce';
import gsap from 'gsap'

const cursor={
    x:0,
    y:0
  }
const mouseMove = (e, objsizes) => {
    cursor.x = e.clientX / objsizes.width - 0.5;
    cursor.y = e.clientY / objsizes.height - 0.5;
  };
  
  const resizeControl=(sizes, camera, renderer)=>{
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height)
  }
const clock = new THREE.Clock()
export default function Texture() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const gui = new GUI();
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
  
      const handleMouseMove = (e) => mouseMove(e, sizes);
      const handleResizeControl=()=> resizeControl(sizes, camera, renderer)
  
      const dbClick=()=>{
        if(!document.fullscreenElement)
        {
          canvas.requestFullscreen()
        }
        else
        {
          document.exitFullscreen()
        }
      }
      addEventListener('dblclick', dbClick);
      addEventListener('mousemove', handleMouseMove)
      addEventListener('resize', handleResizeControl);
  
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        sizes.width / sizes.height,
        0.1,
        1000
      );
      const loadingManager = new THREE.LoadingManager()
      loadingManager.onStart = ()=>{
        console.log('start')
      }
      loadingManager.onLoad = ()=>{
        console.log('Loadded')
      }
      loadingManager.onProgress = ()=>{
        console.log('Progress')
      }

      const textureLoader  = new THREE.TextureLoader(loadingManager);
      const colorTexture = textureLoader.load(cabi)
      const environmentMapTexture = new THREE.CubeTextureLoader()
      .setPath('/src/assets/')          
      .load([
        'hippo.png',
        '3ddisplay.png',
        '3ddisplay.png',
        '3ddisplay.png',
        '3ddisplay.png',
        '3ddisplay.png',
      ])
      const geometry = new THREE.SphereGeometry(0.5, 16, 16)
      const material = new THREE.MeshStandardMaterial( { envMap: environmentMapTexture,//map:colorTexture, 
                                                        color: 0x331ff0 },  );
      material.mapIntensity = 100
      //const material = new THREE.MeshStandardMaterial({color: 0x331ff0})
      //material.flatShading = true
      //material.wireframe = true
      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = -1.5
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1)
        , material
      )
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(1, 0.2, 16, 32),
        material
      )
      cube.position.set(1,1,-1)
      cube.scale.set(1,1,1)
      torus.position.x = -2.5
      scene.add(cube, plane, torus);
  
      const axesHelper = new THREE.AxesHelper();
      scene.add(axesHelper);
      
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(1, 1, 1).normalize();
      scene.add(light);
  
      camera.position.set(1,1,4)
      const controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true;

      // gui.add(material, 'metalness').min(0).max(1).step(0.01)
      // gui.add(material, 'roughness').min(0).max(1).step(0.01)
      // gui.add(material, 'displacementScale').min(0).max(1).step(0.01)
      const animate = () => {
        const elapsedTime = clock.getElapsedTime()
        controls.update();
        requestAnimationFrame(animate);
        
        plane.rotation.y = 0.1 * elapsedTime
        torus.rotation.y = 0.1 * elapsedTime
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        cube.rotation.z += 0.01;
        renderer.render(scene, camera);
      };
  
      animate();
  
      return () => {
        if (mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
        removeEventListener('mousemove', handleMouseMove);
        removeEventListener('resize', handleResizeControl);
        removeEventListener('dblclick', dbClick);
        gui.destroy()
      };
    }, []);
  
    return <div className="w-screen h-screen" ref={mountRef} />;
  };