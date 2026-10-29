/* ---------- Dark / light mode ---------- */
const root = document.documentElement;
const toggle = document.getElementById("theme-toggle");
let saved = null;
try { saved = localStorage.getItem("theme"); } catch (e) {}
if (saved) setTheme(saved);

function setTheme(mode) {
  root.setAttribute("data-theme", mode);
  toggle.textContent = mode === "dark" ? "Light mode" : "Dark mode";
  try { localStorage.setItem("theme", mode); } catch (e) {}
  if (window.updateHeroColors) window.updateHeroColors();
}
toggle.addEventListener("click", () => {
  setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
});

/* ---------- 3D hero (Three.js) ---------- */
(function () {
  const canvas = document.getElementById("hero-canvas");
  if (!window.THREE) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 6;

  const group = new THREE.Group();
  scene.add(group);

  const shapeMat = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.55 });
  const main = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 1), shapeMat);
  const inner = new THREE.Mesh(new THREE.OctahedronGeometry(0.9, 0), shapeMat);
  group.add(main, inner);

  const count = 450;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < pos.length; i++) pos[i] = (Math.random() - 0.5) * 16;
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pMat = new THREE.PointsMaterial({ size: 0.03, transparent: true, opacity: 0.8 });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  window.updateHeroColors = function () {
    const dark = root.getAttribute("data-theme") === "dark";
    shapeMat.color.set(dark ? 0xa78bfa : 0x6d3ee0);
    pMat.color.set(dark ? 0xc4b5fd : 0x6d3ee0);
  };
  window.updateHeroColors();

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    group.position.x = w > 800 ? 2.6 : 0;   // shape sits on the right on wide screens
    group.position.y = w > 800 ? 0 : -1.6;  // and lower on phones, below the text
  }
  window.addEventListener("resize", resize);
  resize();

  let mx = 0, my = 0;
  window.addEventListener("mousemove", (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);
    if (!reduceMotion) {
      main.rotation.x += 0.003;
      main.rotation.y += 0.004;
      inner.rotation.x -= 0.006;
      inner.rotation.y -= 0.005;
      points.rotation.y += 0.0004;
    }
    group.rotation.y += (mx * 0.5 - group.rotation.y) * 0.03;
    group.rotation.x += (my * 0.3 - group.rotation.x) * 0.03;
    renderer.render(scene, camera);
  }
  animate();
})();

/* ---------- Scroll reveal ---------- */
const items = document.querySelectorAll(".section h2, .glass, .tags");
items.forEach((el) => el.classList.add("reveal"));
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("show"); io.unobserve(en.target); }
  });
}, { threshold: 0.15 });
items.forEach((el) => io.observe(el));

/* ---------- Contact form (Formspree) ---------- */
const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.textContent = "Sending...";
  try {
    const res = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    });
    if (res.ok) { status.textContent = "Message sent. I'll reply soon."; form.reset(); }
    else { status.textContent = "Could not send. Please email me directly instead."; }
  } catch (err) {
    status.textContent = "No internet connection. Please try again.";
  }
});