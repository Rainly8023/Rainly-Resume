// js/rings.js — 四层同心环
import * as THREE from 'three';
import { scene } from './scene.js';

const RING_CONFIG = [
  { key: 'core', radius: 1.6, opacity: 0.15, color: '#5aae98', yOffset: 0 },
  { key: 'close', radius: 3.2, opacity: 0.10, color: '#6b8cff', yOffset: -0.1 },
  { key: 'acquaintance', radius: 5.4, opacity: 0.07, color: '#ffd93d', yOffset: -0.2 },
  { key: 'outer', radius: 7.8, opacity: 0.04, color: '#ffffff', yOffset: -0.3 },
];

const ringObjects = [];

export function initRings() {
  RING_CONFIG.forEach(config => {
    const group = new THREE.Group();
    group.name = `ring-${config.key}`;
    group.userData = { ringKey: config.key, config };

    // 环线
    const curve = new THREE.EllipseCurve(0, 0, config.radius, config.radius, 0, Math.PI * 2, false, 0);
    const points = curve.getPoints(256);
    const ringGeom = new THREE.BufferGeometry().setFromPoints(
      points.map(p => new THREE.Vector3(p.x, config.yOffset, p.y))
    );

    const ringMat = new THREE.LineBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: config.opacity,
      depthWrite: false,
    });
    const ringLine = new THREE.Line(ringGeom, ringMat);
    group.add(ringLine);

    // 虚线刻度
    const dotCount = 36;
    const dotsGeom = new THREE.BufferGeometry();
    const dotPositions = new Float32Array(dotCount * 3);
    for (let i = 0; i < dotCount; i++) {
      const angle = (i / dotCount) * Math.PI * 2;
      dotPositions[i * 3] = Math.cos(angle) * config.radius;
      dotPositions[i * 3 + 1] = config.yOffset;
      dotPositions[i * 3 + 2] = Math.sin(angle) * config.radius;
    }
    dotsGeom.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
    const dotsMat = new THREE.PointsMaterial({
      color: config.color,
      size: 0.03,
      transparent: true,
      opacity: config.opacity * 2,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dots = new THREE.Points(dotsGeom, dotsMat);
    group.add(dots);

    scene.add(group);
    ringObjects.push(group);
  });

  return ringObjects;
}

export function getRingObjects() {
  return ringObjects;
}

export function getRingConfig(key) {
  return RING_CONFIG.find(r => r.key === key);
}

export function getAllRingConfigs() {
  return RING_CONFIG;
}
