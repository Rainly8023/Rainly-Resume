// js/gallery-3d.js — Three.js 3D 拍立得旋转木马

/* global gsap */
import * as THREE from 'three';

export function initGallery(containerId, photos) {
  const container = document.getElementById(containerId);
  if (!container || photos.length === 0) return;

  const disposables = { geometries: [], materials: [], textures: [] };

  const w = window.innerWidth, h = window.innerHeight;
  const isMobile = w < 768;

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfafafa);

  // Camera
  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
  camera.position.set(0, 0.5, isMobile ? 8 : 7);
  camera.lookAt(0, 0, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xfff0f5, 1.5);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(2, 5, 5);
  scene.add(dirLight);
  const pinkLight = new THREE.PointLight(0xf8bbd0, 1.5, 20);
  pinkLight.position.set(-3, 1, 3);
  scene.add(pinkLight);
  const purpleLight = new THREE.PointLight(0xc5cae9, 1.2, 20);
  purpleLight.position.set(3, -1, -2);
  scene.add(purpleLight);

  // Background 3D stars
  const starsGeo = new THREE.BufferGeometry();
  const starsCount = 200;
  const starsPositions = new Float32Array(starsCount * 3);
  for (let i = 0; i < starsCount * 3; i += 3) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const r = 12 + Math.random() * 8;
    starsPositions[i] = r * Math.sin(phi) * Math.cos(theta);
    starsPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
    starsPositions[i + 2] = r * Math.cos(phi);
  }
  starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
  const starsMat = new THREE.PointsMaterial({ color: 0xf8bbd0, size: 0.08, transparent: true, opacity: 0.6 });
  disposables.geometries.push(starsGeo);
  disposables.materials.push(starsMat);
  const stars = new THREE.Points(starsGeo, starsMat);
  scene.add(stars);

  // Polaroid cards group
  const ringGroup = new THREE.Group();
  scene.add(ringGroup);
  const radius = isMobile ? 3.5 : 4.5;

  const cards = [];
  const textureLoader = new THREE.TextureLoader();

  photos.forEach((photo, i) => {
    const angle = (i / photos.length) * Math.PI * 2;

    const cardGroup = new THREE.Group();

    // White polaroid background
    const cardW = 1.6, cardH = 2.0;
    const whiteGeo = new THREE.PlaneGeometry(cardW, cardH);
    const whiteMat = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const whiteMesh = new THREE.Mesh(whiteGeo, whiteMat);
    whiteMesh.castShadow = true;
    whiteMesh.receiveShadow = true;
    cardGroup.add(whiteMesh);

    // Photo area (top portion of polaroid)
    const photoH = cardW * 0.9;
    const photoGeo = new THREE.PlaneGeometry(cardW - 0.2, photoH);
    const photoMat = new THREE.MeshPhongMaterial({
      color: photo.color || '#e8eaf6',
      side: THREE.DoubleSide,
    });
    const photoMesh = new THREE.Mesh(photoGeo, photoMat);
    photoMesh.position.y = (cardH - photoH) / 2 - 0.08;
    photoMesh.position.z = 0.01;
    cardGroup.add(photoMesh);

    disposables.geometries.push(whiteGeo, photoGeo);
    disposables.materials.push(whiteMat, photoMat);

    // Load real photo texture
    if (photo.image) {
      textureLoader.load(photo.image, tex => {
        disposables.textures.push(tex);
        photoMat.map = tex;
        photoMat.color.set(0xffffff);
        photoMat.needsUpdate = true;
      });
    }

    // Position on ring
    cardGroup.position.x = Math.cos(angle) * radius;
    cardGroup.position.z = Math.sin(angle) * radius;
    cardGroup.lookAt(0, 0, 0);
    cardGroup.rotateY(Math.PI);

    cardGroup.userData = { photo, index: i, angle, radius };
    ringGroup.add(cardGroup);
    cards.push(cardGroup);
  });

  // Interaction state
  let isDragging = false, prevX = 0, prevY = 0;
  let dragDistance = 0, startX = 0, startY = 0;
  let rotationY = 0, rotationX = 0;
  let targetRotationY = 0, targetRotationX = 0;
  let autoRotate = true;
  const autoSpeed = 0.003;
  let selectedCard = null;
  let mouseDirty = false;

  function onPointerDown(e) {
    isDragging = true;
    dragDistance = 0;
    startX = e.clientX;
    startY = e.clientY;
    prevX = e.clientX;
    prevY = e.clientY;
    autoRotate = false;
    renderer.domElement.style.cursor = 'grabbing';
  }

  function onPointerUp() {
    isDragging = false;
    renderer.domElement.style.cursor = 'grab';
    setTimeout(() => { if (!isDragging && !selectedCard) autoRotate = true; }, 2000);
  }

  function onPointerMove(e) {
    dragDistance = Math.hypot(e.clientX - startX, e.clientY - startY);
    if (!isDragging) return;
    const dx = e.clientX - prevX, dy = e.clientY - prevY;
    targetRotationY += dx * 0.005;
    targetRotationX += dy * 0.003;
    targetRotationX = Math.max(-0.5, Math.min(0.5, targetRotationX));
    prevX = e.clientX;
    prevY = e.clientY;
  }

  function onWheel(e) {
    e.preventDefault();
    if (selectedCard) return;
    targetRotationY += (e.deltaX || e.deltaY) * 0.003;
    autoRotate = false;
    setTimeout(() => { if (!isDragging && !selectedCard) autoRotate = true; }, 2000);
  }

  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onResize() {
    const nw = window.innerWidth, nh = window.innerHeight;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  }
  window.addEventListener('resize', onResize);

  function onMouseMove(e) {
    if (!isDragging) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseDirty = true;
    }
  }
  window.addEventListener('mousemove', onMouseMove);

  function onClick(e) {
    if (isDragging || dragDistance > 5) return;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cards, true);

    if (intersects.length > 0) {
      let cardObj = intersects[0].object;
      while (cardObj && !cardObj.userData.photo) cardObj = cardObj.parent;
      if (cardObj && cardObj.userData.photo) {
        if (selectedCard === cardObj) {
          deselectCard();
        } else {
          selectCard(cardObj);
        }
      }
    } else if (selectedCard) {
      deselectCard();
    }
  }
  renderer.domElement.addEventListener('click', onClick);

  function selectCard(card) {
    selectedCard = card;
    autoRotate = false;
    const detail = document.getElementById('gallery-detail');
    if (detail) {
      const p = card.userData.photo;
      const img = detail.querySelector('img');
      if (img) img.src = p.image || '';
      const h3 = detail.querySelector('h3');
      if (h3) h3.textContent = p.title || '';
      const descP = detail.querySelector('p');
      if (descP) descP.textContent = p.description || '';
      detail.style.display = 'block';
    }
    const target = card.position.clone();
    ringGroup.localToWorld(target);
    const camTarget = target.clone().multiplyScalar(1.3);
    gsap.to(camera.position, { x: camTarget.x, y: camTarget.y, z: camTarget.z, duration: 0.8, ease: 'power2.out' });
  }

  function deselectCard() {
    selectedCard = null;
    const detail = document.getElementById('gallery-detail');
    if (detail) detail.style.display = 'none';
    gsap.to(camera.position, { x: 0, y: 0.5, z: isMobile ? 8 : 7, duration: 0.8, ease: 'power2.out' });
    setTimeout(() => { if (!isDragging) autoRotate = true; }, 1000);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') deselectCard();
  }
  window.addEventListener('keydown', onKeyDown);

  renderer.domElement.style.cursor = 'grab';

  // Animation loop
  let lastTime = performance.now();
  let animId;
  const _tmpVec3 = new THREE.Vector3();

  function animate(timestamp) {
    animId = requestAnimationFrame(animate);
    const dt = Math.min((timestamp - lastTime) / 16, 3);
    lastTime = timestamp;

    if (autoRotate) {
      targetRotationY += autoSpeed * dt;
    }

    rotationY += (targetRotationY - rotationY) * 0.05 * dt;
    rotationX += (targetRotationX - rotationX) * 0.05 * dt;
    ringGroup.rotation.y = rotationY;
    ringGroup.rotation.x = rotationX;

    // Hover scale (only raycast when mouse has moved)
    let currentHovered = null;
    if (mouseDirty) {
      mouseDirty = false;
      raycaster.setFromCamera(mouse, camera);
      const hoverIntersects = raycaster.intersectObjects(cards, true);
      for (const h of hoverIntersects) {
        let obj = h.object;
        while (obj) {
          if (obj.userData.photo && cards.includes(obj)) { currentHovered = obj; break; }
          obj = obj.parent;
        }
        if (currentHovered) break;
      }
    }

    cards.forEach(c => {
      const isHovered = c === currentHovered && !selectedCard;
      const isSelected = c === selectedCard;
      const targetScale = isSelected ? 1.15 : (isHovered ? 1.08 : 1);
      c.scale.lerp(
        _tmpVec3.set(targetScale, targetScale, targetScale),
        0.1 * dt
      );
    });

    stars.rotation.y += 0.0003 * dt;
    stars.rotation.x += 0.0001 * dt;

    renderer.render(scene, camera);
  }
  animId = requestAnimationFrame(animate);

  function onVisibilityChange() {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      lastTime = performance.now();
      animId = requestAnimationFrame(animate);
    }
  }
  document.addEventListener('visibilitychange', onVisibilityChange);

  // Cleanup
  return () => {
    cancelAnimationFrame(animId);
    renderer.domElement.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointermove', onPointerMove);
    renderer.domElement.removeEventListener('wheel', onWheel);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('mousemove', onMouseMove);
    renderer.domElement.removeEventListener('click', onClick);
    window.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    disposables.geometries.forEach(g => g.dispose());
    disposables.materials.forEach(m => m.dispose());
    disposables.textures.forEach(t => t.dispose());
    renderer.dispose();
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
  };
}
