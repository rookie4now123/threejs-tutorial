import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import GUI from 'lil-gui'; 


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

export default function Loadfont() {
    const mountRef = useRef<HTMLDivElement>(null);
    const animationFrameId = useRef(0);
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

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        sizes.width / sizes.height,
        0.1,
        1000
      );
      const textureLoader = new THREE.TextureLoader();
      const matcapTexture = textureLoader.load('/texture/matcap/1.png')
    
      const loader = new FontLoader();
      const font = loader.load(
          // resource URL
          'fonts/helvetiker_regular.typeface.json',
        (font)=>{
            const textGeometry = new TextGeometry(
                    'WELCOME',
                    {
                        font: font,
                        size: 1,
                        depth: 1,
                        curveSegments: 10,
                        bevelEnabled: true,
                        bevelThickness: 0.03,
                        bevelSize: 0.02,
                        bevelOffset: 0,
                        bevelSegments: 10
                    }
            );
            // textGeometry.computeBoundingBox()
            // textGeometry.translate(
            //   -  textGeometry.boundingBox.max.x * 0.5,
            //    - textGeometry.boundingBox.max.y * 0.5,
            //    - textGeometry.boundingBox.max.z * 0.5,
            // )
            textGeometry.center()
            const textMaterial = new THREE.MeshMatcapMaterial(
                            {
                             matcap: matcapTexture
                            })
            const text = new THREE.Mesh(textGeometry, textMaterial) 
            scene.add(text)
        },
      
          // onProgress callback
          function ( xhr ) {
              console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
          },
      
          // onError callback
          function ( err ) {
              console.log( 'An error happened' );
          }
      );
      const donutsGroup = new THREE.Group();
      scene.add(donutsGroup); 
      const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 10, 15)
      const donutMaterial = new THREE.MeshMatcapMaterial({matcap: matcapTexture})
      //console.time('donutsGroup')
      for(let i = 0; i < 100; i++)
      {
        const donut  = new THREE.Mesh(donutGeometry, donutMaterial)
        donut.position.x = (Math.random() -0.5) * 10
        donut.position.y = (Math.random() -0.5) * 10
        donut.position.z = (Math.random() -0.5) * 10
        donut.rotation.x = Math.random() * Math.PI
        donut.rotation.y = Math.random() * Math.PI

        const scale = Math.random()
        donut.scale.set(scale, scale, scale)

        donut.userData.rotationSpeedX = (Math.random() - 0.5) * 0.1; // Random speed between -0.02 and +0.02
        donut.userData.rotationSpeedY = (Math.random() - 0.5) * 0.1; // Random speed between -0.02 and +0.02

        scene.add(donut)
        donutsGroup.add(donut);
      }
      //console.timeEnd('donutsGroup')
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshStandardMaterial( { 
                                            color: 0x331ff0 },  );
      material.mapIntensity = 100

      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = -1.5
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1)
        , material
      )
      plane.position.set(-1, 2, -1)
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(1, 0.2, 16, 32),
        material
      )
      cube.position.set(1,1,-1)
      cube.scale.set(1,1,1)
      torus.position.z = 1.5
      scene.add(cube, plane, torus);
  
      const axesHelper = new THREE.AxesHelper();
      scene.add(axesHelper);
      
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(1, 1, 1).normalize();
      scene.add(light);
  
      camera.position.set(1,1,4)
      const controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true;

      gui.add(material, 'metalness').min(0).max(1).step(0.01)
      gui.add(material, 'roughness').min(0).max(1).step(0.01)
      gui.add(material, 'displacementScale').min(0).max(1).step(0.01)
      const animate = () => {
        const elapsedTime = clock.getElapsedTime()
        controls.update();
        requestAnimationFrame(animate);
        camera.position.x = cursor.x * 10
        camera.position.y = cursor.y * 10
        plane.rotation.y = 0.1 * elapsedTime
        torus.rotation.y = 0.1 * elapsedTime

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        cube.rotation.z += 0.01;
        for (const donut of donutsGroup.children) {
            // Individual rotation
            // donut.rotation.x += 0.01;
            // donut.rotation.y += 0.005;
            donut.rotation.x += donut.userData.rotationSpeedX;
            donut.rotation.y += donut.userData.rotationSpeedY;
         }
        renderer.render(scene, camera);
      };
  
      animate();

      addEventListener('dblclick', dbClick);
      addEventListener('mousemove', handleMouseMove)
      addEventListener('resize', handleResizeControl);
      return () => {
        if (mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
        cancelAnimationFrame(animationFrameId.current);
        removeEventListener('mousemove', handleMouseMove);
        removeEventListener('resize', handleResizeControl);
        removeEventListener('dblclick', dbClick);

        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
              if(object.geometry) object.geometry.dispose();
              if(object.material) {
                  // If the material is an array, dispose each one
                  if(Array.isArray(object.material)) {
                      object.material.forEach(material => material.dispose());
                  } else {
                      object.material.dispose();
                  }
              }
          }
      });

        donutGeometry.dispose();
        geometry.dispose();
        if (material) material.dispose(); // Check if font has loaded
        donutMaterial.dispose();
        controls.dispose();
        renderer.dispose();
        matcapTexture.dispose();
        gui.destroy()
      };
    }, []);
  
    return <div className="w-screen h-screen" ref={mountRef} />;
  };