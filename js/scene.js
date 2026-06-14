// js/scene.js — Three.js 场景、相机、渲染器、灯光、渲染循环
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export let scene, camera, renderer, controls, clock;

export function initScene(canvas) {
  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#f5f3ef');
  scene.fog = new THREE.FogExp2('#f5f3ef', 0.00012);

  // Camera
  camera = new THREE.PerspectiveCamera(
    50, canvas.clientWidth / canvas.clientHeight, 0.1, 50
  );
  camera.position.set(0, 3, 12);
  camera.lookAt(0, 0, 0);

  // Lights
  const ambient = new THREE.AmbientLight('#ffffff', 0.4);
  scene.add(ambient);

  const key = new THREE.DirectionalLight('#ffffff', 1.8);
  key.position.set(10, 15, 10);
  scene.add(key);

  const rim = new THREE.DirectionalLight('#5aae98', 1.2);
  rim.position.set(-8, -3, -5);
  scene.add(rim);

  const fill = new THREE.DirectionalLight('#6b8cff', 0.6);
  fill.position.set(0, -1, 3);
  scene.add(fill);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enableZoom = true;
  controls.minDistance = 4;
  controls.maxDistance = 25;
  controls.enablePan = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.2;
  controls.target.set(0, 0, 0);
  controls.update();

  // Clock
  clock = new THREE.Clock();

  // Resize
  window.addEventListener('resize', () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  return { scene, camera, renderer, controls, clock };
}

// ═══════════ Raycaster for node picking ═══════════
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

export function getIntersections(event, targets) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  return raycaster.intersectObjects(targets, false);
}

export function screenToWorld(clientX, clientY, targetZ = 0) {
  const rect = renderer.domElement.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((clientY - rect.top) / rect.height) * 2 + 1;
  const vec = new THREE.Vector3(x, y, 0.5);
  vec.unproject(camera);
  vec.sub(camera.position).normalize();
  const distance = (targetZ - camera.position.z) / vec.z;
  return camera.position.clone().add(vec.multiplyScalar(distance));
}
