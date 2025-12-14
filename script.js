// ===== THREE.JS SETUP =====
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("three-canvas"),
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);

// ===== PARTICLES =====
const particleCount = 2000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < positions.length; i++) {
  positions[i] = (Math.random() - 0.5) * 10;
}

geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
  color: 0x00ffff,
  size: 0.03
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// ===== HAND TRACKING =====
const videoElement = document.getElementById("video");

let handX = 0;
let handY = 0;

const hands = new Hands({
  locateFile: file =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(results => {
  if (results.multiHandLandmarks.length > 0) {
    const indexFinger = results.multiHandLandmarks[0][8];

    // Normalize (-1 to 1)
    handX = (indexFinger.x - 0.5) * 2;
    handY = -(indexFinger.y - 0.5) * 2;
  }
});

// ===== CAMERA =====
const cameraFeed = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 640,
  height: 480
});

cameraFeed.start();

// ===== ANIMATION LOOP =====
function animate() {
  requestAnimationFrame(animate);

  particles.rotation.y += 0.002;

  // Move particles with hand
  particles.position.x = handX * 2;
  particles.position.y = handY * 2;

  renderer.render(scene, camera);
}

animate();

// ===== RESIZE =====
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
