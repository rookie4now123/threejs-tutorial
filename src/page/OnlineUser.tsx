import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'; 
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

const OnlineUser = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const gui = new GUI();
    //const canvas = document.querySelector('canvas.webgl');
    
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
    // const camera = new THREE.OrthographicCamera(
    //   -1, 1, 1, -1, 0.1, 100
    // )


    const geometry = new THREE.BufferGeometry()
    const positionArray = new Float32Array([
      0,0,0,
      0,1,0,
      1,0,0
    ]) 
    const count = 50;
    const positionsArray = new Float32Array(count * 3 * 3) 
    for(let i = 0; i< count *3 * 3; i++)
    {
      positionsArray[i] = (Math.random() - 0.5)*4

    }
    const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3)
    geometry.setAttribute('position', positionsAttribute)

    const parameters = {
      color: 0xff0000,
      spin:()=>{ },
    }
    const material = new THREE.MeshBasicMaterial(
      { 
        color: parameters.color,
        //wireframe: true
      });
    const circleGeomoetry = new THREE.RingGeometry(2, 4 ,8,12,Math.PI/3,Math.PI);
    const circle = new THREE.Mesh(circleGeomoetry, material);
    circle.position.set(1,1,1)
    scene.add(circle)

    const cube = new THREE.Mesh(geometry, material);
    parameters.spin = () => {
      gsap.to(cube.rotation, { duration: 1, y: cube.rotation.y + Math.PI * 2 });
    };

    // cube.position.y = 4
    // cube.position.x = 2
    // cube.position.z = -3
    cube.position.set(1,1,-1)
    cube.scale.set(1,1,1)
    scene.add(cube);

    const axesHelper = new THREE.AxesHelper();
    scene.add(axesHelper);
    
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    camera.position.set(70,10,40)
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true;
    //camera.lookAt(cube.position)

    const drawShape =()=>{
      const shape = new THREE.Shape() // create a basic shape
      shape.moveTo(3,6)
      shape.lineTo(10,40)// startpoint, straight line upwards
      // the top of the figure, curve to the right
      shape.bezierCurveTo(15, 15, 25, 25, 30, 40)
      shape.splineThru([new THREE.Vector2(32, 30), new
        THREE.Vector2(28, 20), new THREE.Vector2(30, 10)])
      const hole1 = new THREE.Path()
      hole1.absellipse(16, 24, 2, 3, 0, Math.PI * 2, true)
      shape.holes.push(hole1)
        const hole2 = new THREE.Path()
        hole2.absellipse(23, 24, 2, 3, 0, Math.PI * 2, true)
        shape.holes.push(hole2)
        const hole3 = new THREE.Path()
        hole3.absarc(20, 16, 2, 0, Math.PI, true)
        shape.holes.push(hole3)
        return shape
    }
    const shape = new THREE.Mesh(new THREE.ShapeGeometry(drawShape()), material)
    scene.add(shape)

    const animate = () => {
      // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3
      // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3
      // camera.lookAt(new THREE.Vector3())
      controls.update();
      requestAnimationFrame(animate);

      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      cube.rotation.z += 0.01;
      renderer.render(scene, camera);
    };

    animate();



    gui.add(cube.position, 'y', -3, 3, 0.01)
    gui.add(cube, 'visible')
    gui.add(material, 'wireframe')
    gui
        .addColor(parameters, 'color')
        .onChange(()=>{
          material.color.set(parameters.color)
        })
    gui.add(parameters, 'spin')

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      removeEventListener('mousemove', handleMouseMove);
      removeEventListener('resize', handleResizeControl);
      removeEventListener('dblclick', dbClick);
      gui.destroy();
    };
  }, []);

  return <div className="w-screen h-screen" ref={mountRef} />;
};

export default OnlineUser;
