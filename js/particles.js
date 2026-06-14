// js/particles.js — 星空粒子背景
import * as THREE from 'three';
import { scene } from './scene.js';

let particlesMesh;
const PARTICLE_COUNT = 2500;
const SPREAD = 20;

export function initParticles() {
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 3 + Math.random() * SPREAD;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const colorChoice = Math.random();
    if (colorChoice < 0.7) {
      colors[i * 3] = 0.6 + Math.random() * 0.4;
      colors[i * 3 + 1] = 0.65 + Math.random() * 0.35;
      colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
    } else if (colorChoice < 0.85) {
      colors[i * 3] = 0.5 + Math.random() * 0.5;
      colors[i * 3 + 1] = 0.55 + Math.random() * 0.45;
      colors[i * 3 + 2] = 0.4 + Math.random() * 0.3;
    } else {
      colors[i * 3] = 0.3 + Math.random() * 0.3;
      colors[i * 3 + 1] = 0.5 + Math.random() * 0.5;
      colors[i * 3 + 2] = 0.6 + Math.random() * 0.4;
    }

    sizes[i] = Math.random() * 2.5 + 0.5;
  }

  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    size: 0.04,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  particlesMesh = new THREE.Points(geom, mat);
  particlesMesh.name = 'starfield';
  scene.add(particlesMesh);

  return particlesMesh;
}

export function updateParticles(delta) {
  if (!particlesMesh) return;
  particlesMesh.rotation.y += delta * 0.015;
  particlesMesh.rotation.x += delta * 0.005;
  particlesMesh.rotation.z += delta * 0.008;
}

export function getParticles() {
  return particlesMesh;
}
