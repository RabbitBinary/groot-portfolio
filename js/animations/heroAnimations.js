import * as THREE from "three";

let scene, camera, renderer;
let surfaceParticles, surfaceGeometry, surfaceMaterial;
let emittedParticles, emittedGeometry, emittedMaterial;
let animationFrameId = null;
const canvasElement = document.getElementById("hero-canvas");
const mouse = new THREE.Vector2(-1000, -1000);
const sphereRadius = 1.8;
const surfaceParticleCount = 3500;
const surfaceParticleSize = 0.015;
const clock = new THREE.Clock();
const color1 = new THREE.Color(0xda70d6);
const color2 = new THREE.Color(0x9370db);

let originalPositions = null;
let surfaceParticleData = [];
let resizeTimeout;
let frameCounter = 0;

function setSize() {
  if (!camera || !renderer || !canvasElement) return false;
  const width = canvasElement.clientWidth;
  const height = canvasElement.clientHeight;
  if (width === 0 || height === 0) return false;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const targetPixelRatio = isMobile
    ? Math.min(window.devicePixelRatio, 1.5)
    : Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(targetPixelRatio);
  return true;
}

function initThreeJS() {
  if (!canvasElement) return;
  scene = new THREE.Scene();

  const initialWidth = canvasElement.clientWidth;
  const initialHeight = canvasElement.clientHeight;
  if (initialWidth === 0 || initialHeight === 0) return;

  camera = new THREE.PerspectiveCamera(
    70,
    initialWidth / initialHeight,
    0.1,
    100
  );
  camera.position.z = 4.0;
  camera.lookAt(scene.position);

  scene.fog = new THREE.Fog("#121212", 2.5, 6.5);

  renderer = new THREE.WebGLRenderer({
    canvas: canvasElement,
    antialias: true,
    alpha: true,
  });
  setSize();

  // === Povrchová sféra ===
  surfaceGeometry = new THREE.BufferGeometry();
  const surfacePositions = new Float32Array(surfaceParticleCount * 3);
  const surfaceColors = new Float32Array(surfaceParticleCount * 3);
  originalPositions = new Float32Array(surfaceParticleCount * 3);
  surfaceParticleData = [];
  const phi = Math.PI * (3.0 - Math.sqrt(5.0));
  for (let i = 0; i < surfaceParticleCount; i++) {
    const y = 1 - (i / (surfaceParticleCount - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;
    const x = Math.cos(theta) * radiusAtY * sphereRadius;
    const z = Math.sin(theta) * radiusAtY * sphereRadius;
    const currentY = y * sphereRadius;
    const index3 = i * 3;
    surfacePositions[index3] = x;
    surfacePositions[index3 + 1] = currentY;
    surfacePositions[index3 + 2] = z;
    originalPositions[index3] = x;
    originalPositions[index3 + 1] = currentY;
    originalPositions[index3 + 2] = z;
    const mixedColor = color1.clone().lerp(color2, Math.random());
    surfaceColors[index3] = mixedColor.r;
    surfaceColors[index3 + 1] = mixedColor.g;
    surfaceColors[index3 + 2] = mixedColor.b;
    surfaceParticleData.push({
      originalPos: new THREE.Vector3(x, currentY, z),
      velocity: new THREE.Vector3(),
      noiseSeed: Math.random() * 100,
    });
  }
  surfaceGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(surfacePositions, 3)
  );
  surfaceGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(surfaceColors, 3)
  );
  surfaceMaterial = new THREE.PointsMaterial({
    size: surfaceParticleSize,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  surfaceParticles = new THREE.Points(surfaceGeometry, surfaceMaterial);
  scene.add(surfaceParticles);

  // === Emitované častice z POVRCHU sféry ===
  emittedGeometry = new THREE.BufferGeometry();
  const maxEmitted = 2200;
  const emittedPositions = new Float32Array(maxEmitted * 3);
  const emittedVelocities = new Float32Array(maxEmitted * 3);
  const emittedAlphas = new Float32Array(maxEmitted);
  emittedGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(emittedPositions, 3)
  );
  emittedGeometry.setAttribute(
    "alpha",
    new THREE.BufferAttribute(emittedAlphas, 1)
  );
  emittedGeometry.attributes.alpha.needsUpdate = true;

  // Farba - rovnaký princíp ako pri povrchových časticiach
  const emittedColors = new Float32Array(maxEmitted * 3);
  for (let i = 0; i < maxEmitted; i++) {
    const mixedColor = color1.clone().lerp(color2, Math.random());
    emittedColors[i * 3] = mixedColor.r;
    emittedColors[i * 3 + 1] = mixedColor.g;
    emittedColors[i * 3 + 2] = mixedColor.b;
  }
  emittedGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(emittedColors, 3)
  );

  // Materiál s upraveným shaderom pre správne zobrazenie farby
  emittedMaterial = new THREE.PointsMaterial({
    size: 0.012,
    vertexColors: true,
    transparent: true,
    opacity: 1.0, // plná viditeľnosť
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  // Shader upravíme, aby farba správne svietila
  emittedMaterial.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      "void main() {",
      "attribute float alpha; varying float vAlpha; void main() { vAlpha = alpha;"
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "void main() {",
      "varying float vAlpha; void main() {"
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
      "gl_FragColor = vec4( outgoingLight * vAlpha, vAlpha );" // zvýraznenie farby
    );
  };

  emittedParticles = new THREE.Points(emittedGeometry, emittedMaterial);
  scene.add(emittedParticles);

  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(onWindowResize, 150);
    },
    false
  );
  window.addEventListener("mousemove", onMouseMove, false);

  animate();
  frameCounter = 0;
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
  setSize();
}

function animate() {
  animationFrameId = requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = clock.getDelta();
  frameCounter++;

  // === Reakcia na myš ===
  const mouseForce = new THREE.Vector3(mouse.x * 1, -mouse.y * 1, 0); // Premeníme 2D myš na 3D silu
  const mouseDistanceThreshold = 0.8; // Aká blízko musí byť myš k častici, aby na ňu pôsobila
  const maxForceDistance = 3.0; // Maximálny dosah vplyvu myši

  const surfacePositions = surfaceGeometry.attributes.position.array;
  for (let i = 0; i < surfaceParticleCount; i++) {
    const index = i * 3;
    const data = surfaceParticleData[i];
    const currentPos = new THREE.Vector3(
      surfacePositions[index],
      surfacePositions[index + 1],
      surfacePositions[index + 2]
    );

    // Vypočítame vzdialenosť častice od smeru myši (v 2D, ignorujeme Z)
    const particleScreenPos = currentPos.clone().project(camera);
    const distanceToMouse = mouse.distanceTo(
      new THREE.Vector2(particleScreenPos.x, particleScreenPos.y)
    );

    // Ak je myš dostatočne blízko, pridáme silu
    if (distanceToMouse < mouseDistanceThreshold) {
      const forceIntensity =
        (1 - distanceToMouse / mouseDistanceThreshold) * 0.2;
      const force = mouseForce
        .clone()
        .multiplyScalar(forceIntensity)
        .sub(data.velocity.clone().multiplyScalar(0.4)); // Tlmenie
      data.velocity.add(force);
    }

    // Pôvodná "vibračná" logika
    const originalPos = data.originalPos;
    const vibrationOffset = new THREE.Vector3(
      Math.sin(elapsedTime * 0.6 + data.noiseSeed) * 0.05,
      Math.cos(elapsedTime * 0.6 + data.noiseSeed) * 0.05,
      Math.sin(elapsedTime * 0.6 + data.noiseSeed * 0.5) * 0.05
    );
    const targetPos = originalPos.clone().add(vibrationOffset);
    const springForce = new THREE.Vector3()
      .subVectors(targetPos, currentPos)
      .multiplyScalar(0.015);
    data.velocity.add(springForce);
    data.velocity.multiplyScalar(0.96); // Tlmenie

    // Aktualizácia pozície
    surfacePositions[index] += data.velocity.x;
    surfacePositions[index + 1] += data.velocity.y;
    surfacePositions[index + 2] += data.velocity.z;
  }
  surfaceGeometry.attributes.position.needsUpdate = true;
  surfaceParticles.rotation.y += 0.0005;

  // Emitovanie častíc z povrchu sféry
  const emittedPositions = emittedGeometry.attributes.position.array;
  const emittedAlphas = emittedGeometry.attributes.alpha.array;
  const emittedVelocities =
    emittedGeometry.userData.velocities ||
    new Float32Array(emittedPositions.length);

  if (!emittedGeometry.userData.velocities) {
    emittedGeometry.userData.velocities = emittedVelocities;
  }

  const maxEmitted = emittedAlphas.length;
  if (frameCounter % 2 === 0) {
    for (let i = 0; i < maxEmitted; i++) {
      if (emittedAlphas[i] <= 0.0) {
        const pickIndex = Math.floor(Math.random() * surfaceParticleCount);
        const px = originalPositions[pickIndex * 3];
        const py = originalPositions[pickIndex * 3 + 1];
        const pz = originalPositions[pickIndex * 3 + 2];
        const dir = new THREE.Vector3(px, py, pz).normalize();
        const speed = 0.004 + Math.random() * 0.008;
        emittedPositions[i * 3 + 0] = px;
        emittedPositions[i * 3 + 1] = py;
        emittedPositions[i * 3 + 2] = pz;
        emittedVelocities[i * 3 + 0] = dir.x * speed;
        emittedVelocities[i * 3 + 1] = dir.y * speed;
        emittedVelocities[i * 3 + 2] = dir.z * speed;
        emittedAlphas[i] = 1.0;
        const color = color1.clone().lerp(color2, 0.5); // stála ružovo-fialová farba
        emittedGeometry.attributes.color.array[i * 3] = color.r;
        emittedGeometry.attributes.color.array[i * 3 + 1] = color.g;
        emittedGeometry.attributes.color.array[i * 3 + 2] = color.b;
        break;
      }
    }
  }

  for (let i = 0; i < maxEmitted; i++) {
    if (emittedAlphas[i] > 0.0) {
      emittedPositions[i * 3 + 0] += emittedVelocities[i * 3 + 0];
      emittedPositions[i * 3 + 1] += emittedVelocities[i * 3 + 1];
      emittedPositions[i * 3 + 2] += emittedVelocities[i * 3 + 2];
      // Odstránené miznutie častíc — ostávajú stále viditeľné
      emittedAlphas[i] = 1.0;
    }
  }

  emittedGeometry.attributes.position.needsUpdate = true;
  emittedGeometry.setAttribute(
    "alpha",
    new THREE.BufferAttribute(emittedAlphas, 1)
  );

  renderer.render(scene, camera);
}

export function setupHeroAnimation() {
  disposeThreeJS();
  setTimeout(initThreeJS, 100);
}

function stopAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function disposeThreeJS() {
  stopAnimation();
  clearTimeout(resizeTimeout);
  window.removeEventListener("mousemove", onMouseMove, false);
  if (scene) {
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((m) => m.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    while (scene.children.length > 0) scene.remove(scene.children[0]);
    scene = null;
  }
  if (renderer) {
    renderer.dispose();
    renderer = null;
  }
  camera = null;
  surfaceParticles = null;
  surfaceGeometry = null;
  surfaceMaterial = null;
  emittedParticles = null;
  emittedGeometry = null;
  emittedMaterial = null;
  originalPositions = null;
  surfaceParticleData = [];
}
