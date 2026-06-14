// js/main.js — 主入口，装配所有模块
import { initScene, getIntersections, controls, clock } from './scene.js';
import { initParticles, updateParticles } from './particles.js';
import { initRings } from './rings.js';
import { createNode, updateAllNodePositions, updateNodeVisuals, removeNode,
         getNodeMesh, getAllNodeMeshes, showLabel, hideLabel, highlightNode,
         updateNodeFloat } from './nodes.js';
import { createAllConnections, updateConnectionPositions,
         highlightConnections, rebuildAllConnections } from './connections.js';
import { initRipple } from './ripple.js';
import { initPanel, getSelectedPersonId, setSelectedPersonId } from './panel.js';
import { loadData, getPeople, getPerson, subscribe } from './data.js';

let hoveredMesh = null;

function boot() {
  const data = loadData();

  const canvas = document.getElementById('gl');
  initScene(canvas);

  initParticles();
  initRings();

  data.people.forEach(person => createNode(person));
  createAllConnections();

  const rippleCanvas = document.getElementById('ripple-canvas');
  initRipple(rippleCanvas);

  initPanel();

  setupInteraction();

  subscribe((state) => {
    refreshGraph(state);
  });

  requestAnimationFrame(loop);
}

function loop() {
  requestAnimationFrame(loop);
  const delta = Math.min(clock.getDelta(), 0.1);
  controls.update();
  updateParticles(delta);
  updateNodeFloat(delta);
  updateConnectionPositions();
}

function setupInteraction() {
  const canvas = document.getElementById('gl');

  canvas.addEventListener('mousemove', (e) => {
    const meshes = getAllNodeMeshes();
    const intersections = getIntersections(e, meshes);

    if (intersections.length > 0) {
      const mesh = intersections[0].object;
      if (mesh.userData.personId) {
        if (hoveredMesh !== mesh) {
          if (hoveredMesh) {
            hideLabel(hoveredMesh);
            highlightNode(hoveredMesh, false);
            highlightConnections(hoveredMesh.userData.personId, false);
          }
          hoveredMesh = mesh;
          showLabel(mesh);
          highlightNode(mesh, true);
          highlightConnections(mesh.userData.personId, true);
          canvas.style.cursor = 'pointer';

          const person = getPerson(mesh.userData.personId);
          if (person) {
            const tooltip = document.getElementById('tooltip');
            tooltip.textContent = person.name;
            tooltip.style.left = (e.clientX + 16) + 'px';
            tooltip.style.top = (e.clientY - 30) + 'px';
            tooltip.style.opacity = '1';
          }
        }
        return;
      }
    }

    if (hoveredMesh) {
      hideLabel(hoveredMesh);
      highlightNode(hoveredMesh, false);
      highlightConnections(hoveredMesh.userData.personId, false);
      hoveredMesh = null;
      canvas.style.cursor = 'grab';
      const tooltip = document.getElementById('tooltip');
      if (tooltip) tooltip.style.opacity = '0';
    }
  });

  canvas.addEventListener('click', (e) => {
    if (e.target !== canvas) return;
    const meshes = getAllNodeMeshes();
    const intersections = getIntersections(e, meshes);
    if (intersections.length > 0) {
      const mesh = intersections[0].object;
      if (mesh.userData.personId) {
        setSelectedPersonId(mesh.userData.personId);
        document.getElementById('panel').classList.remove('is-collapsed');
        flyCameraToNode(mesh);
      }
    }
  });
}

function flyCameraToNode(mesh) {
  const targetPos = mesh.position.clone();
  if (window.gsap) {
    gsap.to(controls.target, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 0.8,
      ease: 'power2.inOut',
    });
  } else {
    controls.target.copy(targetPos);
  }
}

function refreshGraph(state) {
  const existingIds = new Set(
    getAllNodeMeshes().map(m => m.userData.personId)
  );
  const stateIds = new Set(state.people.map(p => p.id));

  existingIds.forEach(id => {
    if (!stateIds.has(id)) {
      removeNode(id);
    }
  });

  state.people.forEach(person => {
    if (!existingIds.has(person.id)) {
      createNode(person);
    } else {
      updateNodeVisuals(person);
    }
  });

  updateAllNodePositions();
  rebuildAllConnections();
}

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'f':
    case 'F':
      if (window.gsap) {
        gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 0.8, ease: 'power2.inOut' });
      } else {
        controls.target.set(0, 0, 0);
      }
      break;
    case 'Escape':
      setSelectedPersonId(null);
      break;
    case 'p':
    case 'P':
      document.getElementById('panel').classList.toggle('is-collapsed');
      break;
  }
});

boot();
