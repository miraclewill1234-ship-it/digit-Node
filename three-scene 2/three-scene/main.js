const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05051a);
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000,
);
const canvas = document.querySelector("#bg");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(10, 10, 10),
  new THREE.MeshStandardMaterial({ color: 0xff6347 }),
);
cube.position.set(-15, 0, -15);
scene.add(cube);
const ico = new THREE.Mesh(
  new THREE.IcosahedronGeometry(10),
  new THREE.MeshPhongMaterial({ color: 0x00ff00 }),
);
ico.position.set(15, 0, -15);
scene.add(ico);
const knot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(5, 1, 250, 16, 2, 3),
  new THREE.MeshStandardMaterial({
    color: 0x66ccff,
    roughness: 0.1,
    metalness: 0.8,
  }),
);
knot.position.y = 20;
scene.add(knot);

const pos = [];
for (let i = 0; i < 1000; i++)
  pos.push(
    THREE.MathUtils.randFloatSpread(300),
    THREE.MathUtils.randFloatSpread(300),
    THREE.MathUtils.randFloatSpread(300),
  );
const sg = new THREE.BufferGeometry();
sg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
const stars = new THREE.Points(
  sg,
  new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 }),
);
scene.add(stars);

const pointLight = new THREE.PointLight(0xffffff, 1.2);
pointLight.position.set(0, 10, 10);
scene.add(pointLight, new THREE.AmbientLight(0xffffff, 0.5));
scene.add(
  new THREE.PointLightHelper(pointLight),
  new THREE.GridHelper(200, 50),
);

let theta = 0,
  phi = 1.25,
  radius = 55;
const target = new THREE.Vector3(0, 8, 0);
function placeCamera() {
  camera.position.set(
    target.x + radius * Math.sin(phi) * Math.sin(theta),
    target.y + radius * Math.cos(phi),
    target.z + radius * Math.sin(phi) * Math.cos(theta),
  );
  camera.lookAt(target);
}
const pts = new Map();
let lastDist = 0;
canvas.addEventListener("pointerdown", (e) => {
  canvas.setPointerCapture(e.pointerId);
  pts.set(e.pointerId, e);
});
canvas.addEventListener("pointerup", (e) => {
  pts.delete(e.pointerId);
  lastDist = 0;
});
canvas.addEventListener("pointermove", (e) => {
  if (!pts.has(e.pointerId)) return;
  const prev = pts.get(e.pointerId);
  pts.set(e.pointerId, e);
  if (pts.size === 1) {
    theta -= (e.clientX - prev.clientX) * 0.005;
    phi = Math.min(
      3.0,
      Math.max(0.2, phi - (e.clientY - prev.clientY) * 0.005),
    );
  } else if (pts.size === 2) {
    const [a, b] = [...pts.values()];
    const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    if (lastDist) radius = Math.min(150, Math.max(15, (radius * lastDist) / d));
    lastDist = d;
  }
});
canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    radius = Math.min(
      150,
      Math.max(15, radius * (1 + Math.sign(e.deltaY) * 0.08)),
    );
  },
  { passive: false },
);

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  ico.rotation.y -= 0.03;
  knot.rotation.x += 0.02;
  stars.rotation.y += 0.0005;
  placeCamera();
  renderer.render(scene, camera);
}
animate();

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
