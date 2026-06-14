// js/connections.js — 人物间连线管理
import * as THREE from 'three';
import { scene } from './scene.js';
import { getPeople } from './data.js';
import { getNodeMesh } from './nodes.js';

const connectionLines = new Map(); // "id1-id2" → THREE.Line
let highlightedPersonId = null;

export function createAllConnections() {
  clearConnections();

  const people = getPeople();
  const seen = new Set();

  people.forEach(person => {
    person.connections.forEach(targetId => {
      const key = [person.id, targetId].sort().join('-');
      if (seen.has(key)) return;
      seen.add(key);

      const target = people.find(p => p.id === targetId);
      if (!target) return;

      createConnectionLine(person, target);
    });
  });
}

function createConnectionLine(personA, personB) {
  const meshA = getNodeMesh(personA.id);
  const meshB = getNodeMesh(personB.id);
  if (!meshA || !meshB) return;

  const key = [personA.id, personB.id].sort().join('-');
  const sameRing = personA.ring === personB.ring;
  const opacity = sameRing ? 0.35 : 0.12;

  const points = [meshA.position.clone(), meshB.position.clone()];
  const geom = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({
    color: '#444444',
    transparent: true,
    opacity,
    depthWrite: false,
  });

  const line = new THREE.Line(geom, mat);
  line.userData = { personIdA: personA.id, personIdB: personB.id, key, sameRing };
  line.name = `connection-${key}`;
  scene.add(line);
  connectionLines.set(key, line);

  return line;
}

export function updateConnectionPositions() {
  connectionLines.forEach((line) => {
    const meshA = getNodeMesh(line.userData.personIdA);
    const meshB = getNodeMesh(line.userData.personIdB);
    if (!meshA || !meshB) return;

    const positions = line.geometry.attributes.position.array;
    positions[0] = meshA.position.x;
    positions[1] = meshA.position.y;
    positions[2] = meshA.position.z;
    positions[3] = meshB.position.x;
    positions[4] = meshB.position.y;
    positions[5] = meshB.position.z;
    line.geometry.attributes.position.needsUpdate = true;
  });
}

export function highlightConnections(personId, on = true) {
  highlightedPersonId = on ? personId : null;

  connectionLines.forEach(line => {
    const isRelated =
      line.userData.personIdA === personId ||
      line.userData.personIdB === personId;

    if (on && isRelated) {
      line.material.opacity = 0.8;
      line.material.color.set('#4a9d8a');
    } else if (!on) {
      const sameRing = line.userData.sameRing;
      line.material.opacity = sameRing ? 0.35 : 0.12;
      line.material.color.set('#444444');
    } else {
      line.material.opacity = 0.03;
      line.material.color.set('#444444');
    }
  });
}

function clearConnections() {
  connectionLines.forEach(line => {
    scene.remove(line);
    line.geometry.dispose();
    line.material.dispose();
  });
  connectionLines.clear();
}

export function rebuildAllConnections() {
  clearConnections();
  createAllConnections();
}

export function getConnectionLines() {
  return connectionLines;
}
