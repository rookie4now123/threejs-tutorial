import { useRef, useEffect } from "react";
import { onResize, dbClick } from "../util/utils";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { intializeRendererControls } from "../util/rendererControl";
import * as CANNON from "cannon-es";
//Galaxy

interface Vec3D {
  x: number;
  y: number;
  z: number;
}

const clock = new THREE.Clock();
export const Test = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const gui = new GUI({ width: 300 });
    const debugObject = {}
    debugObject.createSphere=()=>{
      createSphere(Math.random() * 0.5, 
        {x: (Math.random() - 0.5) * 3, 
          y: 3, 
          z: (Math.random() - 0.5)* 3
        })
    }
    gui.add(debugObject, 'createSphere')

    debugObject.createBox=()=>{
      createBox(
        Math.random() * 0.5,
        Math.random() * 0.5,
        Math.random() * 0.5,
        {x: (Math.random() - 0.5) * 3, 
          y: 3, 
          z: (Math.random() - 0.5)* 3
        })
    }
    gui.add(debugObject, 'createBox')

    debugObject.reset=()=>{
      for(const object of objectsToUpdate)
      {
        object.body.removeEventListener('collide', playHitSound)
        world.removeBody(object.body)
        scene.remove(object.mesh)
      }
      objectsToUpdate.length = 0;
    }

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
    camera.position.set(-5, 5, 3);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    const axesHelper = new THREE.AxesHelper();
    scene.add(axesHelper);

    const hitSound = new Audio('/sounds/hit.mp3')
    const playHitSound = (collision)=>{
      const impactStrength = collision.contact.getImpactVelocityAlongNormal()
      if(impactStrength > 1.5)
      {
        hitSound.volume = Math.random()
        hitSound.currentTime = 0
        hitSound.play()
      }
    }

    const textureLoader = new THREE.TextureLoader();
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const environmentMapTexture = cubeTextureLoader.load([
      "/texture/matcap/1.png",
      "/marble_0008_roughness_2k.jpg",
      "/glow.png",
      "/marble_0008_normal_directx_2k.png",
      "/ifrxv1a628593nue.jpg",
      "/wgrsm3audxv0cni8.jpg",
    ]);
    const world = new CANNON.World();
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.allowSleep = true;
    world.gravity.set(0, -9.82, 0);

    const defaultMaterial = new CANNON.Material("default");
    const defaultContactMaterial = new CANNON.ContactMaterial(
      defaultMaterial,
      defaultMaterial,
      {
        friction: 0.1,
        restitution: 0.7,
      }
    );
    world.addContactMaterial(defaultContactMaterial);
    world.defaultContactMaterial = defaultContactMaterial;

    const objectsToUpdate = []
    //Sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
    const sphereMaterial = new THREE.MeshStandardMaterial({
      metalness: 0.3,
      roughness: 0.4,
      envMap: environmentMapTexture,
    })
    const createSphere = (radius: number, position: Vec3D) => {
      const mesh = new THREE.Mesh(
        sphereGeometry,
        sphereMaterial
      );
      mesh.scale.set(radius, radius, radius)
      mesh.castShadow = true;
      mesh.position.copy(position);
      scene.add(mesh);
      //Cannon.js body
      const shape = new CANNON.Sphere(radius);
      const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape,
        material: defaultMaterial,
      });
      body.position.copy(position);
      world.addBody(body);

      //save in objects to update
      objectsToUpdate.push({
        mesh,
        body
      })
      return { mesh, body };
    };

    //createSphere(0.5, { x: 0, y: 3, z: 0 });

    //Box
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
    const boxMaterial = new THREE.MeshStandardMaterial({
      metalness: 0.3,
      roughness: 0.4,
      envMap: environmentMapTexture,
    })
    const createBox = (width, height, depth, position: Vec3D) => {
      const mesh = new THREE.Mesh(
        boxGeometry,
        boxMaterial
      );
      mesh.scale.set(width, height, depth)
      mesh.castShadow = true;
      mesh.position.copy(position);
      scene.add(mesh);
      //Cannon.js body
      const shape = new CANNON.Box(new CANNON.Vec3(
        width * 0.5, height * 0.5, depth * 0.5
      ));
      const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape,
        material: defaultMaterial,
      });
      body.position.copy(position);
      body.addEventListener('collide', playHitSound)
      world.addBody(body);

      //save in objects to update
      objectsToUpdate.push({
        mesh,
        body
      })
      return { mesh, body };
    };

  //  createBox(0.5, { x: 0, y: 3, z: 0 });
    //

    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body();
    floorBody.material = defaultMaterial;
    floorBody.mass = 0;
    floorBody.addShape(floorShape);
    floorBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI * 0.5
    );
    world.addBody(floorBody);

    /**
     * Lights
     */
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.camera.far = 15;
    directionalLight.shadow.camera.left = -7;
    directionalLight.shadow.camera.top = 7;
    directionalLight.shadow.camera.right = 7;
    directionalLight.shadow.camera.bottom = -7;
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({
        color: "#777777",
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5,
      })
    );
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI * 0.5;
    scene.add(floor);
    let oldElapsedTime = 0;
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - oldElapsedTime;
      oldElapsedTime = elapsedTime;
      world.step(1/60, deltaTime, 3)
      for(const object of objectsToUpdate)
      {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
      }
      controls.update();
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
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
      removeEventListener("resize", handleResizeControl);
      removeEventListener("dblclick", dbClick);
      // geometry.dispose();
      // material.dispose();
      renderer.dispose();

      gui.destroy();
    };
  }, []);

  return <div className="w-screen h-screen" ref={mountRef} />;
};
