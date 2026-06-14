// js/nodes.js — 人物节点创建、更新、布局
import * as THREE from 'three';
import { scene } from './scene.js';
import { getRingConfig } from './rings.js';
import { getPeople } from './data.js';

const nodeObjects = new Map(); // personId → THREE.Mesh

export function createNode(person) {
  const config = getRingConfig(person.ring);
  if (!config) return null;

  const ring = person.ring;
  const ringItems = getPeople().filter(p => p.ring === ring);
  const idx = ringItems.findIndex(p => p.id === person.id);
  const total = ringItems.length;
  const angle = total > 1
    ? (idx / total) * Math.PI * 2 + (Math.random() - 0.5) * (Math.PI / total * 0.6)
    : 0;

  const x = Math.cos(angle) * config.radius;
  const z = Math.sin(angle) * config.radius;
  const y = config.yOffset + (Math.random() - 0.5) * 0.6;

  // 节点球体
  const radius = 0.10 + person.size * 0.18;
  const geom = new THREE.SphereGeometry(radius, 32, 32);
  const mat = new THREE.MeshStandardMaterial({
    color: person.color || '#e8e8e8',
    roughness: 0.2,
    metalness: 0.1,
    emissive: person.color || '#e8e8e8',
    emissiveIntensity: 0.4,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(x, y, z);
  mesh.userData = {
    personId: person.id,
    ring: person.ring,
    basePosition: new THREE.Vector3(x, y, z),
    floatOffset: Math.random() * Math.PI * 2,
    floatSpeed: 0.3 + Math.random() * 0.5,
    floatAmp: 0.05 + Math.random() * 0.1,
  };
  mesh.castShadow = true;

  // 光晕
  const glowGeom = new THREE.SphereGeometry(radius * 1.8, 16, 16);
  const glowMat = new THREE.MeshBasicMaterial({
    color: person.color || '#e8e8e8',
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
  });
  const glow = new THREE.Mesh(glowGeom, glowMat);
  mesh.add(glow);

  // 名字标签 sprite
  const labelSprite = createLabel(person.name, person.color);
  labelSprite.position.set(0, radius * 2.5, 0);
  labelSprite.visible = false;
  mesh.add(labelSprite);

  scene.add(mesh);
  nodeObjects.set(person.id, mesh);
  return mesh;
}

function createLabel(name, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.font = 'bold 28px "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(name, 128, 36);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(2.5, 0.625, 1);
  return sprite;
}

export function updateAllNodePositions() {
  const people = getPeople();
  const ringGroups = { core: [], close: [], acquaintance: [], outer: [] };

  people.forEach(p => {
    if (ringGroups[p.ring]) ringGroups[p.ring].push(p);
  });

  for (const [ring, group] of Object.entries(ringGroups)) {
    const config = getRingConfig(ring);
    if (!config) continue;
    const total = group.length;
    group.forEach((person, idx) => {
      const angle = total > 1
        ? (idx / total) * Math.PI * 2 + (Math.random() - 0.5) * (Math.PI / total * 0.5)
        : 0;
      const x = Math.cos(angle) * config.radius;
      const z = Math.sin(angle) * config.radius;
      const y = config.yOffset + (Math.random() - 0.5) * 0.6;

      const mesh = nodeObjects.get(person.id);
      if (mesh) {
        mesh.userData.basePosition = new THREE.Vector3(x, y, z);
        if (window.gsap) {
          gsap.to(mesh.position, { x, y, z, duration: 0.8, ease: 'power2.out' });
        } else {
          mesh.position.set(x, y, z);
        }
      }
    });
  }
}

export function updateNodeVisuals(person) {
  const mesh = nodeObjects.get(person.id);
  if (!mesh) return;

  mesh.material.color.set(person.color);
  mesh.material.emissive.set(person.color);

  const glow = mesh.children[0];
  if (glow) glow.material.color.set(person.color);

  const newRadius = 0.10 + person.size * 0.18;
  mesh.scale.setScalar(newRadius / (0.10 + 0.5 * 0.18));

  const label = mesh.children[1];
  if (label) {
    const canvas = label.material.map.image;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = person.color;
    ctx.font = 'bold 28px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(person.name, 128, 36);
    label.material.map.needsUpdate = true;
  }
}

export function removeNode(personId) {
  const mesh = nodeObjects.get(personId);
  if (mesh) {
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
    nodeObjects.delete(personId);
  }
}

export function getNodeMesh(personId) {
  return nodeObjects.get(personId);
}

export function getAllNodeMeshes() {
  return Array.from(nodeObjects.values());
}

export function showLabel(mesh) {
  if (mesh && mesh.children[1]) mesh.children[1].visible = true;
}

export function hideLabel(mesh) {
  if (mesh && mesh.children[1]) mesh.children[1].visible = false;
}

export function highlightNode(mesh, on = true) {
  if (!mesh) return;
  if (on) {
    mesh.material.emissiveIntensity = 1.2;
    if (mesh.children[0]) mesh.children[0].material.opacity = 0.35;
  } else {
    mesh.material.emissiveIntensity = 0.4;
    if (mesh.children[0]) mesh.children[0].material.opacity = 0.12;
  }
}

export function updateNodeFloat(delta) {
  nodeObjects.forEach(mesh => {
    const ud = mesh.userData;
    ud.floatOffset += delta * ud.floatSpeed;
    const floatY = Math.sin(ud.floatOffset) * ud.floatAmp;
    const floatX = Math.cos(ud.floatOffset * 1.3) * ud.floatAmp * 0.5;
    mesh.position.x = ud.basePosition.x + floatX;
    mesh.position.y = ud.basePosition.y + floatY;
  });
}
