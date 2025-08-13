import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { onResize, dbClick } from '../util/utils'
import GUI from 'lil-gui'; 
import {intializeRendererControls} from '../util/rendererControl'

const clock = new THREE.Clock()

export default function Haunted() {
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
      renderer.setClearColor('#262837')
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

      const fog = new THREE.Fog('#ff0000', 1, 15);
      scene.fog = fog

      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshStandardMaterial( { 
                        roughness: 0.4,
                        //color: 0xefefde 
                    },  );

      const textureLoader = new THREE.TextureLoader()
      const doorColorTexture = textureLoader.load('/public/brick_wall_001_arm_2k.jpg')
      const brickColorTexture = textureLoader.load('/public/marble_0008_color_2k.jpg')
      const brickNormalTexture = textureLoader.load('/public/marble_0008_normal_directx_2k.jpg')
      const brickRoughTexture = textureLoader.load('/public/marble_0008_roughness_2k.jpg')
      
      const house = new THREE.Group()
      scene.add(house)

      const walls = new THREE.Mesh(
        new THREE.BoxGeometry(4,2.5,4),
        new THREE.MeshStandardMaterial({
            map: brickColorTexture,
            normalMap: brickNormalTexture,
            roughnessMap: brickRoughTexture
        })
      )
      walls.geometry.setAttribute(
        'uv2', new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
      )

      walls.position.y =  1.25
      house.add(walls)

      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(3.5, 1, 4),
        new THREE.MeshStandardMaterial({color: '#b35f45'})
      )
      roof.position.y= 3
      roof.rotation.y = -Math.PI / 4
      house.add(roof)
      const door = new THREE.Mesh(
        new THREE.PlaneGeometry(2,2),
        new THREE.MeshStandardMaterial({      
           map: doorColorTexture,
           transparent: true
        })
      )
      door.position.set(0, 1, 2.0001)
      house.add(door)

      const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
      const bushMaterial = new THREE.MeshStandardMaterial({color: '#89c854'})
      const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
      bush1.scale.set(0.5, 0.5, 0.5)
      bush1.position.set(0.8,0.2,2.2)

      const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
      bush2.scale.set(0.25,0.25,0.25)
      bush2.position.set(1.4,0.1,2.1)

      const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
      bush3.scale.set(0.24,0.24,0.24)
      bush3.position.set(-1.3, 0.1,2.1)

      const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
      bush4.scale.set(0.4,0.4,0.4)
      bush4.position.set(-0.8,0.1,2.1)

      house.add(bush1, bush2, bush3, bush4)
      const graves = new THREE.Group()
      scene.add(graves)

      const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
      const graveMaterial = new THREE.MeshStandardMaterial({color:'#b2b6b1'})

      for(let i = 0; i< 50; i++)
      {
        const angle = Math.random() * Math.PI * 2
        const radius = 3 + Math.random()*6
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius
        const grave = new THREE.Mesh(graveGeometry, graveMaterial)
        grave.position.set(x, 0.2 ,z)
        grave.rotation.y = (Math.random() - 0.5) * 0.4
        grave.rotation.z = (Math.random() - 0.5) * 0.4
        grave.castShadow= true
        graves.add(grave)
      }
      const ambientLight = new THREE.AmbientLight(0xb9d5ff, 0.5)
      scene.add(ambientLight)
      const directionalLight = new THREE.DirectionalLight(0xb9d5ff, 0.3)
      directionalLight.position.set(-3,1.4, 1).normalize();
      directionalLight.castShadow = true; // default false
      scene.add(directionalLight)
    //   const hemisphereLight = new THREE.HemisphereLight(0x11aaac, 0xbbe2f1, 2)
    //   scene.add(hemisphereLight)
      const doorLight = new THREE.PointLight('#ff7d46', 1, 7)
      doorLight.position.set(0, 2.2, 2.7)
      house.add(doorLight)

    //   const cube = new THREE.Mesh(geometry, material);
    //   cube.position.x = 0
    //   cube.scale.set(1,1,1)
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(9, 10),
        new THREE.MeshStandardMaterial({color: '#a9c388'})
      )

      //plane.position.y = -0.5
      plane.rotation.x = Math.PI / -2
      plane.receiveShadow = true
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(0.3, 0.2, 16, 32),
        material
      )

      torus.position.x = 1.5
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        material
      )
      sphere.position.x = -1.5
      sphere.castShadow = true; //default is false
      sphere.receiveShadow = false; //default
      const axesHelper = new THREE.AxesHelper(5);

      scene.add(plane, torus, sphere, axesHelper,);

      intializeRendererControls(gui, renderer)

      camera.position.set(4,5,4)
      const controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true;

      gui.add(material, 'metalness').min(0).max(1).step(0.01)
      gui.add(material, 'roughness').min(0).max(1).step(0.01)
      gui.add(ambientLight, 'intensity').min(0).max(10).step(0.01).name('ambientInt')
      gui.add(directionalLight, 'intensity').min(0).max(3).step(0.01).name('DirecttInt')
      gui.addColor(ambientLight, 'color')
                    .name('ambientColor')
                    .onChange(() => {ambientLight.color.getHexString});
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