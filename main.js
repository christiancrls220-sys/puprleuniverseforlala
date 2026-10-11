import * as THREE from 'three';
import './style.css';

const canvas = document.querySelector('#universe');
const intro = document.querySelector('#intro');
const mainText = document.querySelector('#main-text');
const subText = document.querySelector('#sub-text');
const exitButton = document.querySelector('#exit-button');
const endPage = document.querySelector('#end-page');
const replayButton = document.querySelector('#replay-button');

if (!canvas || !intro || !mainText || !subText ||
    !exitButton || !endPage || !replayButton) {
  throw new Error('Ada ID HTML yang belum cocok.');
}

mainText.style.opacity = '0';
subText.style.opacity = '0';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#020204');

const camera = new THREE.PerspectiveCamera(
  45, innerWidth / innerHeight, 0.1, 100
);
camera.position.set(0, 0, 13);

const renderer = new THREE.WebGLRenderer({
  canvas, antialias: true
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

scene.add(new THREE.AmbientLight(0xffffff, 1.8));

const purpleLight = new THREE.PointLight(0xb66aff, 4);
purpleLight.position.set(2, 4, 6);
scene.add(purpleLight);

const hint = document.createElement('div');
hint.textContent = 'TAP TO CONTINUE';
Object.assign(hint.style, {
  position: 'absolute',
  left: '50%',
  bottom: '12%',
  transform: 'translateX(-50%)',
  color: '#eadcff',
  font: '13px Georgia, serif',
  letterSpacing: '3px',
  textShadow: '0 0 14px #b56cff',
  cursor: 'pointer',
  zIndex: '5'
});
intro.appendChild(hint);

const loveScript = document.createElement('div');
loveScript.textContent = 'i love you sayang';
Object.assign(loveScript.style, {
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  textAlign: 'center',
  pointerEvents: 'none',
  opacity: '0',
  color: '#e8c8ff',
  fontFamily: '"Brush Script MT", "Segoe Script", cursive',
  fontSize: 'clamp(38px, 6vw, 78px)',
  textShadow: '0 0 12px #c084fc, 0 0 35px #9333ea',
  transition: 'opacity 1s ease',
  zIndex: '1'
});
intro.appendChild(loveScript);

// ---------- PARTICLE RING AND PARTICLE TEXT ----------

const COUNT = 6500;
const positions = new Float32Array(COUNT * 3);
const targets = new Float32Array(COUNT * 3);
const colors = new Float32Array(COUNT * 3);

const geometry = new THREE.BufferGeometry();
geometry.setAttribute(
  'position', new THREE.BufferAttribute(positions, 3)
);
geometry.setAttribute(
  'color', new THREE.BufferAttribute(colors, 3)
);

for (let i = 0; i < COUNT; i++) {
  const k = i * 3;
  colors[k] = 0.78;
  colors[k + 1] = 0.48;
  colors[k + 2] = 1;
}

const material = new THREE.PointsMaterial({
  size: 0.04,
  vertexColors: true,
  transparent: true,
  opacity: 0.95,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const cloud = new THREE.Points(geometry, material);
scene.add(cloud);

const rand = (a, b) => a + Math.random() * (b - a);

function setTarget(i, x, y, z) {
  const k = i * 3;
  targets[k] = x;
  targets[k + 1] = y;
  targets[k + 2] = z;
}


function makeRing() {
  for (let i = 0; i < COUNT; i++) {
    const u = rand(0, Math.PI * 2);
    const v = rand(0, Math.PI * 2);
    const r = 2.15 + 0.4 * Math.cos(v);

    setTarget(
      i,
      r * Math.cos(u),
      r * Math.sin(u),
      0.4 * Math.sin(v)
    );
  }
}

makeRing();

for (let i = 0; i < COUNT * 3; i++) {
  positions[i] = targets[i];
}

geometry.attributes.position.needsUpdate = true;
cloud.visible = true;



function makeText(lines) {
  const c = document.createElement('canvas');
  c.width = 1400;
  c.height = 420;

  const ctx = c.getContext('2d', {
    willReadFrequently: true
  });

  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = 'bold 88px Georgia';
  ctx.fillText(lines[0], 700, lines.length > 1 ? 130 : 210, 1320);

  if (lines.length > 1) {
    ctx.font = '38px Georgia';
    ctx.fillText(lines[1], 700, 285, 1320);
  }

  const pixels = ctx.getImageData(
    0, 0, c.width, c.height
  ).data;

  const samples = [];

  for (let y = 0; y < c.height; y += 3) {
    for (let x = 0; x < c.width; x += 3) {
      if (pixels[(y * c.width + x) * 4 + 3] > 100) {
        samples.push([x, y]);
      }
    }
  }

  for (let i = 0; i < COUNT; i++) {
    const p = samples[i % samples.length];

    setTarget(
      i,
      (p[0] / c.width - 0.5) * 9.5,
      (0.5 - p[1] / c.height) * 3.1,
      rand(-0.02, 0.02)
    );
  }
}


 // ---------- SEVEN REAL 3D TULIPS ----------

const bouquet = new THREE.Group();
scene.add(bouquet);
bouquet.visible = false;

const tulipHeads = [];

const green = new THREE.MeshStandardMaterial({
  color: '#32894c',
  roughness: 0.48,
  metalness: 0.05
});

function makePetalGeometry() {
  const verts = [];
  const indices = [];
  const rows = 24;
  const cols = 16;

  for (let r = 0; r <= rows; r++) {
    const t = r / rows;

    for (let c = 0; c <= cols; c++) {
      const u = c / cols * 2 - 1;

      const width =
        0.36 * Math.pow(Math.sin(Math.PI * t), 0.65)
        + 0.035;

      const x = u * width;
      const y = t * 0.9;

      const z =
        0.16 * u * u
        + 0.12 * t * t
        - 0.16 * (1 - u * u) * Math.sin(t * Math.PI);

      verts.push(x, y, z);
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = r * (cols + 1) + c;
      const b = a + cols + 1;

      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }

  const g = new THREE.BufferGeometry();

  g.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(verts, 3)
  );

  g.setIndex(indices);
  g.computeVertexNormals();

  return g;
}

const petalGeometry = makePetalGeometry();

function makeLeaf(length, angle) {
  const leaf = new THREE.Mesh(
    new THREE.SphereGeometry(1, 16, 12),
    new THREE.MeshStandardMaterial({
      color: '#32894c',
      roughness: 0.48,
      metalness: 0.05
    })
  );

  leaf.scale.set(0.12, length / 2, 0.035);
  leaf.rotation.z = angle;
  return leaf;
}


const bloomParts = [];

function makeTulip(x, y, z, scale, flowerIndex) {
  const flower = new THREE.Group();
  flower.position.set(x, y, z);
  flower.scale.setScalar(scale);
  bouquet.add(flower);

  // Batang
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.055, 1.7, 12),
    new THREE.MeshStandardMaterial({
      color: 0x39b54a,
      roughness: 0.3,
      metalness: 0.15
    })
  );
  stem.position.y = -0.85;
  flower.add(stem);

  // Daun
  for (let i = 0; i < 2; i++) {
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 12),
      new THREE.MeshStandardMaterial({
        color: 0x42d66b,
        roughness: 0.25,
        metalness: 0.12,
        emissive: 0x123d18,
        emissiveIntensity: 0.25
      })
    );

    leaf.scale.set(0.18, 0.65, 0.09);
    leaf.position.set(i === 0 ? -0.18 : 0.18, -0.85, 0);
    leaf.rotation.z = i === 0 ? -0.65 : 0.65;
    flower.add(leaf);
  }

  const colors = [
    0xb86bff, 0xd9a0ff, 0x9333ea,
    0xe0b3ff, 0xa855f7, 0xc084fc,
    0xf0c8ff, 0x7e22ce
  ];

  const color = colors[flowerIndex % colors.length];

  const petalMaterial = new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.16,
    metalness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    emissive: color,
    emissiveIntensity: 0.28
  });

  const head = new THREE.Group();
  head.position.y = 0.05;
  flower.add(head);

  // Kelopak berlapis seperti bunga mawar
  const layers = [
    { count: 5, radius: 0.28, size: 0.34, height: 0.22 },
    { count: 7, radius: 0.20, size: 0.29, height: 0.12 },
    { count: 6, radius: 0.11, size: 0.22, height: 0.02 }
  ];

  let petalNumber = 0;

  layers.forEach((layer, layerIndex) => {
    for (let i = 0; i < layer.count; i++) {
      const angle =
        (i / layer.count) * Math.PI * 2 +
        layerIndex * 0.48 +
        flowerIndex * 0.17;

      const petal = new THREE.Mesh(
        new THREE.SphereGeometry(1, 20, 16),
        petalMaterial.clone()
      );

      // Bentuk kelopak lonjong dan sedikit melengkung
      petal.scale.set(0.001, 0.001, 0.001);
      petal.position.set(
        Math.cos(angle) * layer.radius,
        layer.height,
        Math.sin(angle) * layer.radius
      );

      petal.rotation.set(
        0.25 * Math.cos(angle),
        -angle,
        0.25 * Math.sin(angle)
      );

      petal.userData.targetScale = {
        x: layer.size * (0.85 + Math.random() * 0.3),
        y: layer.size * 1.15,
        z: 0.09
      };

      petal.userData.targetRotationZ =
        Math.sin(angle) * 0.5 + (layerIndex === 2 ? 0.2 : 0);

      petal.userData.bloomDelay =
        flowerIndex * 0.13 + petalNumber * 0.025;

      petal.userData.originalRotationZ = petal.rotation.z;
      petal.userData.layer = layerIndex;

      head.add(petal);
      bloomParts.push(petal);
      petalNumber++;
    }
  });

  // Pusat bunga berkilau
  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.105, 20, 16),
    new THREE.MeshPhysicalMaterial({
      color: 0xffe5ff,
      emissive: 0xf0abfc,
      emissiveIntensity: 2,
      roughness: 0.12,
      metalness: 0.15
    })
  );

  center.scale.setScalar(0.001);
  center.userData.bloomDelay = flowerIndex * 0.13 + 0.18;
  center.userData.targetScale = { x: 1, y: 1, z: 1 };
  center.userData.originalRotationZ = 0;
  center.userData.isCenter = true;

  head.add(center);
  bloomParts.push(center);

  // Cahaya ungu di sekitar bunga
  const glow = new THREE.PointLight(color, 1.8, 3.2);
  glow.position.y = 0.15;
  head.add(glow);
}



function makeBouquet() {
  bouquet.clear();

  // Reset animasi kelopak jika memakai sistem bloomParts
  if (typeof bloomParts !== 'undefined') {
    bloomParts.length = 0;
  }

  const flowers = [
    { x: -4.8, y:  2.5, z: 0, s: 0.45 },
    { x: -3.0, y:  3.1, z: 0, s: 0.65 },
    { x: -1.0, y:  2.4, z: 0, s: 0.42 },
    { x:  1.2, y:  3.0, z: 0, s: 0.55 },
    { x:  3.4, y:  2.4, z: 0, s: 0.72 },
    { x:  4.8, y:  1.0, z: 0, s: 0.48 },

    { x: -4.4, y:  0.0, z: 0, s: 0.78 },
    { x: -2.4, y:  0.7, z: 0, s: 0.55 },
    { x:  0.0, y:  0.2, z: 0, s: 0.90 },
    { x:  2.3, y:  0.3, z: 0, s: 0.62 },
    { x:  4.1, y: -0.6, z: 0, s: 0.75 },

    { x: -4.7, y: -2.1, z: 0, s: 0.58 },
    { x: -2.8, y: -2.7, z: 0, s: 0.85 },
    { x: -0.8, y: -1.9, z: 0, s: 0.52 },
    { x:  1.2, y: -2.5, z: 0, s: 0.72 },
    { x:  3.1, y: -2.0, z: 0, s: 0.48 },
    { x:  4.6, y: -2.8, z: 0, s: 0.65 }
  ];

  flowers.forEach((f, i) => {
    makeTulip(f.x, f.y, f.z, f.s, i);
  });
}



// ---------- HOLLOW 3D PURPLE HEART ----------

const heart = new THREE.Group();
scene.add(heart);
heart.visible = false;

function heartPoint(t, scale) {
  return new THREE.Vector3(
    16 * Math.pow(Math.sin(t), 3) / 8 * scale,
    (
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)
    ) / 8 * scale + 0.2,
    0
  );
}


function makeHeart() {
  heart.clear();

  const heartLayers = [];
  const heartDetails = [];

  // 9 lapisan garis hati, muncul satu per satu
  for (let layer = 0; layer < 9; layer++) {
    const scale = 1 - layer * 0.065;
    const points = [];

    for (let i = 0; i <= 240; i++) {
      points.push(
        heartPoint((i / 240) * Math.PI * 2, scale)
      );
    }

    const curve = new THREE.CatmullRomCurve3(points);

    const frontTube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 280, 0.009 + layer * 0.0005, 6, false),
      new THREE.MeshBasicMaterial({
        color: layer % 2 === 0 ? '#d8a0ff' : '#9333ea',
        transparent: true,
        opacity: 0.88,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );

    frontTube.scale.setScalar(0.001);
    heart.add(frontTube);

    heartLayers.push({
      object: frontTube,
      delay: layer * 0.19
    });

    // Lapisan belakang untuk efek 3D
    const backPoints = points.map(
      p => new THREE.Vector3(p.x, p.y, -1 - layer * 0.045)
    );

    const backCurve = new THREE.CatmullRomCurve3(backPoints);

    const backTube = new THREE.Mesh(
      new THREE.TubeGeometry(backCurve, 280, 0.008, 6, false),
      new THREE.MeshBasicMaterial({
        color: '#a855f7',
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );

    backTube.scale.setScalar(0.001);
    heart.add(backTube);

    heartLayers.push({
      object: backTube,
      delay: layer * 0.19 + 0.09
    });
  }

  // Garis penghubung depan-belakang
  for (let i = 0; i < 36; i++) {
    const p = heartPoint((i / 36) * Math.PI * 2, 1);

    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(p.x, p.y, 0),
      new THREE.Vector3(p.x, p.y, -1.45)
    ]);

    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({
        color: '#c084fc',
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );

    line.scale.setScalar(0.001);
    heart.add(line);

    heartDetails.push({
      object: line,
      delay: 1.65 + i * 0.018
    });
  }

  // Bintang berkilau di sekitar garis hati
  const sparklePositions = [];

  for (let i = 0; i < 550; i++) {
    const p = heartPoint(
      Math.random() * Math.PI * 2,
      rand(0.65, 1.05)
    );

    sparklePositions.push(
      p.x + rand(-0.035, 0.035),
      p.y + rand(-0.035, 0.035),
      rand(-1.5, 0.1)
    );
  }

  const starGeometry = new THREE.BufferGeometry();

  starGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(sparklePositions, 3)
  );

  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      color: '#f0d9ff',
      size: 0.035,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })
  );

  stars.scale.setScalar(0.001);
  heart.add(stars);

  heartDetails.push({
    object: stars,
    delay: 2.2
  });

  // Simpan daftar animasi pada heart
  heart.userData.heartLayers = heartLayers;
  heart.userData.heartDetails = heartDetails;
  heart.userData.animationStart = performance.now();
}


// ---------- DIAMOND AND BACKGROUND STARS ----------

const diamond = new THREE.Mesh(
  new THREE.OctahedronGeometry(0.5, 0),
  new THREE.MeshBasicMaterial({
    color: '#c99aff',
    wireframe: true
  })
);
diamond.position.y = 2.8;
scene.add(diamond);

const starPositions = [];

for (let i = 0; i < 600; i++) {
  starPositions.push(
    rand(-17, 17), rand(-11, 11), rand(-15, -4)
  );
}

const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(starPositions, 3)
);

const stars = new THREE.Points(
  starGeo,
  new THREE.PointsMaterial({
    color: '#e5d5ff',
    size: 0.045,
    transparent: true,
    opacity: 0.8
  })
);
scene.add(stars);


 // ---------- STORY AND TRANSITIONS ----------

let stage = 0;
let mode = 'ring';
let transition = 1;
let lastStageTime = 0;

function setText(lines) {
  makeText(lines);
  mode = 'text';
  diamond.visible = false;
  cloud.visible = true;
  bouquet.visible = false;
  heart.visible = false;
  loveScript.style.opacity = '0';
}


function showStage() {
  if (performance.now() - lastStageTime < 450) return;
  lastStageTime = performance.now();

  stage++;

  if (stage === 1 || stage === 2) {
    setText(
      stage === 1
        ? ['IN A WORLD FULL OF STARS', 'I FOUND MY FAVOURITE']
        : ['AND SOMEHOW', 'IT ALWAYS LEADS TO YOU']
    );

    hint.style.display = '';


} else if (stage === 3) {
  cloud.visible = false;
  diamond.visible = false;
  heart.visible = false;

  makeBouquet();

  bouquet.position.set(0, 0, 0);
  bouquet.scale.setScalar(1);
  bouquet.visible = true;

  transition = 0;
  mode = 'bouquet';

  loveScript.style.opacity = '0';
  hint.style.display = '';


  } else if (stage === 4) {
    cloud.visible = false;
    bouquet.visible = false;
    diamond.visible = false;

    makeHeart();

    heart.visible = true;
    heart.position.set(0, 0, 0);

    transition = 0;
    mode = 'heart';

   loveScript.style.opacity = '0';
hint.style.display = '';
exitButton.hidden = true;

  } else {
    stage = 5;

    cloud.visible = false;
    bouquet.visible = false;
    heart.visible = false;
    diamond.visible = false;

    intro.hidden = true;
    exitButton.hidden = false;
    hint.style.display = 'none';

    mode = 'end';
  }
}



function resetScene() {
  stage = 0;
  mode = 'ring';
  transition = 1;
  lastStageTime = 0;

  // Show the opening screen again.
  intro.hidden = false;
  endPage.hidden = true;
  exitButton.hidden = true;
  hint.style.display = '';

  // Reset visibility.
  diamond.visible = true;
  cloud.visible = true;
  bouquet.visible = false;
  heart.visible = false;

  // Reset text.
  loveScript.style.opacity = '0';
  mainText.style.opacity = '0';
  subText.style.opacity = '0';

  // Reset rotations.
  cloud.rotation.set(0, 0, 0);
  diamond.rotation.set(0, 0, 0);

  // Rebuild the particle ring.
  makeRing();

  const pos = geometry.attributes.position.array;

  for (let i = 0; i < COUNT * 3; i++) {
    pos[i] = targets[i];
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.computeBoundingSphere();
}




function goToEnd() {
  intro.hidden = true;
  exitButton.hidden = true;
  endPage.hidden = false;
}

intro.addEventListener('click', showStage);

exitButton.addEventListener('click', e => {
  e.stopPropagation();
  goToEnd();
});

replayButton.addEventListener('click', resetScene);

// ---------- ANIMATION ----------


function animate() {
  requestAnimationFrame(animate);

  const now = performance.now() * 0.001;

  // Bouquet muncul perlahan lalu diam.


if (mode === 'bouquet') {
  const elapsed = (performance.now() - lastStageTime) / 1000;

  bloomParts.forEach((part) => {
    const delay = part.userData.bloomDelay || 0;
    const progress = THREE.MathUtils.clamp(
      (elapsed - delay) / 0.65,
      0,
      1
    );

    // Gerakan mekar yang halus
    const eased = 1 - Math.pow(1 - progress, 3);
    const target = part.userData.targetScale;

    if (target) {
      part.scale.set(
        target.x * eased,
        target.y * eased,
        target.z * eased
      );
    }

    // Kelopak membuka ke arah luar
    if (!part.userData.isCenter) {
      const layer = part.userData.layer || 0;
      const openAmount = eased * (layer === 0 ? 1.1 : 0.65);

      part.rotation.z =
        part.userData.originalRotationZ +
        Math.sin(part.userData.originalRotationZ + 1) * openAmount;
    }
  });

  // Kilau kecil yang berdenyut
  bouquet.traverse((obj) => {
    if (obj.isPointLight) {
      obj.intensity = 1.5 + Math.sin(performance.now() * 0.004 + obj.position.y) * 0.7;
    }
  });
}

 
if (mode === 'heart') {
  const elapsed =
    (performance.now() - (heart.userData.animationStart || performance.now())) / 1000;

  // Durasi zoom-in setiap garis
  const lineDuration = 0.42;

  // Animasi kontur hati
  const layers = heart.userData.heartLayers || [];

  layers.forEach((item) => {
    const progress = THREE.MathUtils.clamp(
      (elapsed - item.delay) / lineDuration,
      0,
      1
    );

    // Zoom-in dengan efek ease-out
    const eased = 1 - Math.pow(1 - progress, 3);

    item.object.scale.setScalar(
      Math.max(0.001, eased)
    );
  });

  // Garis penghubung dan bintang muncul setelah kontur
  const details = heart.userData.heartDetails || [];

  details.forEach((item) => {
    const progress = THREE.MathUtils.clamp(
      (elapsed - item.delay) / 0.35,
      0,
      1
    );

    const eased = 1 - Math.pow(1 - progress, 3);

    item.object.scale.setScalar(
      Math.max(0.001, eased)
    );
  });

  // Hati membesar perlahan saat garis terbentuk
  const formation = THREE.MathUtils.clamp(elapsed / 2.8, 0, 1);
  const formationEase = 1 - Math.pow(1 - formation, 3);

  // Setelah terbentuk, hati berdenyut lembut
  const heartbeat = elapsed > 3
    ? 1 + Math.sin(now * 2.4) * 0.025
    : 1;

  heart.scale.setScalar(
    (0.95 + formationEase * 0.3) * heartbeat
  );

  // Efek melayang dan rotasi 3D
  heart.position.y = Math.sin(now * 0.8) * 0.06;
  heart.rotation.y = Math.sin(now * 0.35) * 0.12;
  heart.rotation.x = Math.sin(now * 0.5) * 0.04;
  heart.rotation.z = Math.sin(now * 0.65) * 0.02;

  // Cahaya garis berdenyut setelah terbentuk
  heart.traverse((child) => {
    if (
      child.material &&
      child.material.transparent &&
      child.material.color
    ) {
      child.material.opacity =
        0.72 + Math.sin(now * 1.8) * 0.15;
    }
  });
} 
if (mode === 'heart') {
  const elapsed =
    (performance.now() -
      (heart.userData.animationStart || performance.now())) / 1000;

  const layers = heart.userData.heartLayers || [];
  const details = heart.userData.heartDetails || [];

  // Garis love zoom-in satu per satu
  layers.forEach((item) => {
    const progress = THREE.MathUtils.clamp(
      (elapsed - item.delay) / 0.42,
      0,
      1
    );

    const eased = 1 - Math.pow(1 - progress, 3);
    item.object.scale.setScalar(Math.max(0.001, eased));
  });

  // Garis penghubung dan bintang menyusul
  details.forEach((item) => {
    const progress = THREE.MathUtils.clamp(
      (elapsed - item.delay) / 0.35,
      0,
      1
    );

    const eased = 1 - Math.pow(1 - progress, 3);
    item.object.scale.setScalar(Math.max(0.001, eased));
  });

  // Love membesar, kemudian berdenyut
  const formation = THREE.MathUtils.clamp(elapsed / 2.8, 0, 1);
  const formationEase = 1 - Math.pow(1 - formation, 3);
  const heartbeat = elapsed > 3
    ? 1 + Math.sin(now * 2.4) * 0.025
    : 1;

  heart.scale.setScalar(
    (0.95 + formationEase * 0.3) * heartbeat
  );

  heart.position.y = Math.sin(now * 0.8) * 0.06;
  heart.rotation.y = Math.sin(now * 0.35) * 0.12;
  heart.rotation.x = Math.sin(now * 0.5) * 0.04;
  heart.rotation.z = Math.sin(now * 0.65) * 0.02;

  // Teks dan tombol baru muncul setelah animasi selesai
  const textDelay = 3.5;
const textProgress = THREE.MathUtils.clamp(
  (elapsed - textDelay) / 2.5,
  0,
  1
);

  loveScript.style.opacity = textProgress;

  if (textProgress >= 1) {
    hint.style.display = 'none';
    exitButton.hidden = false;
  } else {
    exitButton.hidden = true;
  }
} else {
  heart.position.y = 0;
}



  // Cincin partikel berputar.
  if (mode === 'ring') {
    cloud.rotation.y += 0.003;
    cloud.rotation.z += 0.002;

    diamond.rotation.y += 0.008;
    diamond.rotation.x += 0.004;
  } else if (mode === 'text') {
    cloud.rotation.set(0, 0, 0);
  }

  // Partikel bergerak perlahan menuju bentuk target.
  const pos = geometry.attributes.position.array;

  if (cloud.visible) {
    for (let i = 0; i < COUNT * 3; i++) {
      pos[i] += (targets[i] - pos[i]) * 0.045;
    }

    geometry.attributes.position.needsUpdate = true;
  }

  // Bintang latar berkelip.
  stars.material.opacity = 0.65 + Math.sin(now * 1.5) * 0.15;

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});
