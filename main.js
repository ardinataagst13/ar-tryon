import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MindARThree } from 'mindar-face-three';

// ==========================================
// 1. DATA KATALOG PRODUK (KACAMATA & TOPI)
// ==========================================
const PRODUCTS = [
  {
    id: 'glasses-1',
    category: 'glasses',
    name: 'Kacamata Pixel "Deal With It"',
    price: 'Rp 99.000',
    badge: 'Trending 🔥',
    description: 'Kacamata pixel meme "Deal With It" ikonik bergaya retro 8-bit yang estetik.',
    modelPath: 'assets/models/deal_with_it_glasses_original.glb',
    // Default Kalibrasi Kacamata:
    scale: 0.42, // Dinaikkan 2.6x lipat agar besar & tebal menutup kedua mata
    offset: { x: 0, y: -0.015, z: 0.03 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 }, // 90° sumbu Y agar hadap depan
    color: '#0f172a'
  },
  {
    id: 'glasses-2',
    category: 'glasses',
    name: 'Kacamata Classic Aviator',
    price: 'Rp 179.000',
    badge: 'Best Seller',
    description: 'Frame metal tipis dengan lensa UV400 premium untuk gaya kasual.',
    modelPath: 'assets/models/glasses1.glb',
    scale: 0.38,
    offset: { x: 0, y: 0.0, z: 0.02 },
    rotation: { x: 0, y: 0, z: 0 },
    color: '#1e293b'
  },
  {
    id: 'glasses-3',
    category: 'glasses',
    name: 'Cyberpunk Visor Neon',
    price: 'Rp 229.000',
    badge: 'Futuristik',
    description: 'Desain visor satu kesatuan monolitik dengan finishing mirror neon.',
    modelPath: 'assets/models/glasses3.glb',
    scale: 0.40,
    offset: { x: 0, y: 0.01, z: 0.02 },
    rotation: { x: 0, y: 0, z: 0 },
    color: '#06b6d4'
  },
  {
    id: 'hat-1',
    category: 'hat',
    name: 'Topi Jerami Luvi (Straw Hat)',
    price: 'Rp 85.000',
    badge: 'Handmade UMKM ⭐',
    description: 'Topi jerami lebar rajutan UMKM pengrajin lokal terinspirasi anime.',
    modelPath: 'assets/models/topi_monyet_luvi.glb',
    // Default Kalibrasi Topi (Dinaikkan 2.6x lipat agar lingkar brim lebar):
    scale: 0.52,
    offset: { x: 0, y: -0.04, z: -0.09 }, // Diturunkan pas ke kepala
    rotation: { x: 0.22, y: 0, z: 0 }, // Miring ke depan menutup lubang bawah
    color: '#92400e'
  },
  {
    id: 'hat-2',
    category: 'hat',
    name: 'Snapback Cap Streetwear',
    price: 'Rp 125.000',
    badge: 'Casual',
    description: 'Topi snapback dengan bahan katun twill tebal dan bordir minimalis.',
    modelPath: 'assets/models/hat2.glb',
    scale: 0.18,
    offset: { x: 0, y: 0.02, z: -0.05 },
    rotation: { x: 0.1, y: 0, z: 0 },
    color: '#334155'
  }
];

// ==========================================
// 2. STATE APLIKASI
// ==========================================
let mindarThree = null;
let gltfLoader = new GLTFLoader();

let arRenderer = null;
let arScene = null;
let arCamera = null;

let glassesAnchor = null;
let hatAnchor = null;
let glassesAnchorGroup = null;
let hatAnchorGroup = null;

let currentCategory = 'glasses'; // 'glasses' | 'hat' | 'both'
let activeGlassesId = 'glasses-1';
let activeHatId = 'hat-1';

// Cache model yang sudah dibuat/diload
const loadedModels = new Map();

// Kalibrasi independen per-kategori
const categoryTransforms = {
  glasses: { scale: 1.0, posY: 0.0, posZ: 0.0, rotY: 0.0, rotX: 0.0 },
  hat: { scale: 1.0, posY: 0.0, posZ: 0.0, rotY: 0.0, rotX: 0.0 }
};

// ==========================================
// 3. ELEMEN DOM
// ==========================================
const startModal = document.getElementById('start-modal');
const btnStart = document.getElementById('btn-start');
const loadingModal = document.getElementById('loading-modal');
const loadingText = document.getElementById('loading-text');

const trackingBadge = document.getElementById('tracking-badge');
const trackingDot = document.getElementById('tracking-dot');
const trackingText = document.getElementById('tracking-text');

const itemsCarousel = document.getElementById('items-carousel');
const productNameEl = document.getElementById('product-name');
const productPriceEl = document.getElementById('product-price');
const productBadgeEl = document.getElementById('product-badge');

const tabGlasses = document.getElementById('tab-glasses');
const tabHats = document.getElementById('tab-hats');
const tabBoth = document.getElementById('tab-both');

// Drawer Kalibrasi
const btnAdjust = document.getElementById('btn-adjust');
const adjustPanel = document.getElementById('adjust-panel');
const btnCloseAdjust = document.getElementById('btn-close-adjust');
const adjustTargetBadge = document.getElementById('adjust-target-badge');

const sliderScale = document.getElementById('slider-scale');
const sliderPosY = document.getElementById('slider-pos-y');
const sliderPosZ = document.getElementById('slider-pos-z');
const sliderRotY = document.getElementById('slider-rot-y');
const sliderRotX = document.getElementById('slider-rot-x');

const labelScale = document.getElementById('label-scale');
const labelPosY = document.getElementById('label-pos-y');
const labelPosZ = document.getElementById('label-pos-z');
const labelRotY = document.getElementById('label-rot-y');
const labelRotX = document.getElementById('label-rot-x');

const btnFlip180 = document.getElementById('btn-flip-180');
const btnResetAdjust = document.getElementById('btn-reset-adjust');

// Snapshot
const btnSnapshot = document.getElementById('btn-snapshot');
const snapshotModal = document.getElementById('snapshot-modal');
const snapshotImage = document.getElementById('snapshot-image');
const btnDownloadSnapshot = document.getElementById('btn-download-snapshot');
const btnCloseSnapshot = document.getElementById('btn-close-snapshot');
const btnRetakeSnapshot = document.getElementById('btn-retake-snapshot');

// Info Modal
const btnInfo = document.getElementById('btn-info');
const infoModal = document.getElementById('info-modal');
const btnCloseInfo = document.getElementById('btn-close-info');
const btnConfirmInfo = document.getElementById('btn-confirm-info');

// ==========================================
// 4. PROCEDURAL 3D FALLBACK
// ==========================================
function createProceduralGlasses(colorHex = 0x111827) {
  const group = new THREE.Group();

  const frameMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    metalness: 0.8,
    roughness: 0.2
  });

  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0x050b14,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.85,
    transparent: true,
    opacity: 0.85,
    reflectivity: 0.9
  });

  const lensGeom = new THREE.CylinderGeometry(0.38, 0.38, 0.02, 32);
  lensGeom.rotateX(Math.PI / 2);

  const leftLens = new THREE.Mesh(lensGeom, lensMat);
  leftLens.position.set(-0.46, 0, 0);
  const rightLens = new THREE.Mesh(lensGeom, lensMat);
  rightLens.position.set(0.46, 0, 0);

  const ringGeom = new THREE.TorusGeometry(0.38, 0.035, 16, 32);
  const leftRing = new THREE.Mesh(ringGeom, frameMat);
  leftRing.position.set(-0.46, 0, 0);
  const rightRing = new THREE.Mesh(ringGeom, frameMat);
  rightRing.position.set(0.46, 0, 0);

  const bridgeGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.22, 16);
  bridgeGeom.rotateZ(Math.PI / 2);
  const bridge = new THREE.Mesh(bridgeGeom, frameMat);
  bridge.position.set(0, 0.08, 0.02);

  const armGeom = new THREE.BoxGeometry(0.03, 0.03, 1.2);
  const leftArm = new THREE.Mesh(armGeom, frameMat);
  leftArm.position.set(-0.85, 0, -0.6);
  const rightArm = new THREE.Mesh(armGeom, frameMat);
  rightArm.position.set(0.85, 0, -0.6);

  group.add(leftLens, rightLens, leftRing, rightRing, bridge, leftArm, rightArm);
  return group;
}

function createProceduralHat(colorHex = 0x334155) {
  const group = new THREE.Group();

  const hatMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.7,
    metalness: 0.1
  });

  const crownGeom = new THREE.SphereGeometry(0.85, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52);
  const crown = new THREE.Mesh(crownGeom, hatMat);
  crown.position.set(0, 0, -0.1);

  const visorGeom = new THREE.CylinderGeometry(1.0, 1.0, 0.04, 32, 1, false, -Math.PI * 0.35, Math.PI * 0.7);
  const visor = new THREE.Mesh(visorGeom, hatMat);
  visor.position.set(0, -0.05, 0.35);
  visor.rotation.x = 0.1;

  group.add(crown, visor);
  return group;
}

// ==========================================
// 5. INISIALISASI MINDAR & THREE.JS
// ==========================================
function showErrorBanner(message) {
  let errBox = document.getElementById('error-banner');
  if (!errBox) {
    errBox = document.createElement('div');
    errBox.id = 'error-banner';
    errBox.className = 'fixed top-4 left-4 right-4 z-50 bg-rose-950/95 border-2 border-rose-500 rounded-2xl p-4 shadow-2xl text-xs text-rose-100 flex flex-col space-y-2';
    document.body.appendChild(errBox);
  }
  errBox.innerHTML = `
    <div class="flex items-center space-x-2 font-bold text-rose-300">
      <svg class="w-5 h-5 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
      <span>Pemberitahuan Kamera WebAR</span>
    </div>
    <p class="leading-relaxed">${message}</p>
    <button onclick="this.parentElement.remove()" class="self-end px-3 py-1 bg-rose-700 hover:bg-rose-600 rounded-lg text-white font-semibold">Tutup</button>
  `;
}

async function initMindAR() {
  if (window.location.protocol === 'file:') {
    const errorMsg = '<strong>Website dibuka langsung lewat file (file:///)!</strong><br><br>' +
      'Browser memblokir kamera dan WebAR di protokol file://.<br><br>' +
      '👉 <strong>Solusi:</strong> Jalankan lewat <strong>Live Server di VS Code</strong> atau lewat terminal <code>npx serve .</code> (http://localhost), atau upload ke hosting HTTPS (Vercel).';
    showErrorBanner(errorMsg);
    alert('PERHATIAN: WebAR membutuhkan server lokal (http://localhost) atau hosting (https://). Kamera diblokir jika dibuka lewat file:///');
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showErrorBanner('Browser tidak mendukung akses kamera WebRTC atau koneksi tidak aman (wajib HTTPS / localhost).');
    return;
  }

  loadingModal.classList.remove('hidden');
  loadingText.innerText = 'Meminta izin & mengaktifkan kamera...';

  try {
    const container = document.getElementById('ar-container');
    
    mindarThree = new MindARThree({
      container: container,
      uiLoading: 'no',
      uiScanning: 'no',
      filterMinCF: 0.001,
      filterBeta: 1.0
    });

    const { renderer, scene, camera } = mindarThree;
    arRenderer = renderer;
    arScene = scene;
    arCamera = camera;

    renderer.setClearColor(0x000000, 0);
    scene.background = null;

    // Pencahayaan Realistis
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(0, 2, 2);
    scene.add(dirLight);

    const softFillLight = new THREE.DirectionalLight(0xa5b4fc, 0.8);
    softFillLight.position.set(0, -1, 1);
    scene.add(softFillLight);

    // Anchor Landmark MindAR:
    // 168: Batang hidung atas antara kedua mata (untuk kacamata)
    // 10: Dahi atas dekat garis rambut (untuk topi)
    glassesAnchor = mindarThree.addAnchor(168);
    hatAnchor = mindarThree.addAnchor(10);

    glassesAnchorGroup = new THREE.Group();
    hatAnchorGroup = new THREE.Group();

    glassesAnchor.group.add(glassesAnchorGroup);
    hatAnchor.group.add(hatAnchorGroup);

    // Jalankan Kamera Lebih Dulu
    loadingText.innerText = 'Mengaktifkan stream kamera...';
    await mindarThree.start();

    // Loop Render & Deteksi Status Wajah Real-Time
    let lastFaceDetected = null;
    renderer.setAnimationLoop(() => {
      // Cek apakah anchor terdeteksi oleh tracker di frame ini
      const isDetected = (glassesAnchor && glassesAnchor.group.visible) || (hatAnchor && hatAnchor.group.visible);
      
      if (isDetected !== lastFaceDetected) {
        lastFaceDetected = isDetected;
        if (isDetected) {
          trackingDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse';
          trackingText.innerText = 'Wajah Terdeteksi';
          trackingText.className = 'text-emerald-300 font-semibold tracking-wide';
          trackingBadge.className = 'flex items-center space-x-2 bg-emerald-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-500/50 shadow-lg text-xs transition-all duration-300';
        } else {
          trackingDot.className = 'w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping';
          trackingText.innerText = 'Mencari Wajah...';
          trackingText.className = 'text-slate-300 font-medium tracking-wide';
          trackingBadge.className = 'flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/60 shadow-lg text-xs transition-all duration-300';
        }
      }

      renderer.render(scene, camera);
    });

    // Load Model Awal
    loadingText.innerText = 'Memuat model 3D aksesoris...';
    await switchProduct(activeGlassesId, false);
    await switchProduct(activeHatId, false);
    updateActiveVisibility();

    loadingModal.classList.add('hidden');
  } catch (error) {
    console.error('Error saat inisialisasi AR:', error);
    loadingModal.classList.add('hidden');
    let msg = error.message || error;
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      msg = 'Izin kamera ditolak. Silakan klik ikon gembok di sebelah kiri address bar browser dan ubah izin kamera menjadi <strong>"Allow" (Izinkan)</strong>.';
    }
    showErrorBanner(`Gagal membuka kamera: ${msg}`);
  }
}

// ==========================================
// 6. LOAD & SWITCH MODEL
// ==========================================
async function getOrLoadModel(product) {
  if (loadedModels.has(product.id)) {
    return loadedModels.get(product.id);
  }

  return new Promise((resolve) => {
    gltfLoader.load(
      product.modelPath,
      (gltf) => {
        const rawScene = gltf.scene;

        // Auto-center model pivot via Bounding Box
        const box = new THREE.Box3().setFromObject(rawScene);
        const center = new THREE.Vector3();
        box.getCenter(center);
        rawScene.position.sub(center);

        const modelContainer = new THREE.Group();
        modelContainer.add(rawScene);

        applyProductTransforms(modelContainer, product);
        loadedModels.set(product.id, modelContainer);
        resolve(modelContainer);
      },
      undefined,
      (err) => {
        console.warn(`[Info] File ${product.modelPath} belum ditemukan. Menggunakan model fallback 3D otomatis.`, err);
        let fallback;
        if (product.category === 'glasses') {
          fallback = createProceduralGlasses(parseInt(product.color.replace('#', '0x')));
        } else {
          fallback = createProceduralHat(parseInt(product.color.replace('#', '0x')));
        }
        applyProductTransforms(fallback, product);
        loadedModels.set(product.id, fallback);
        resolve(fallback);
      }
    );
  });
}

function applyProductTransforms(object3d, product) {
  const t = categoryTransforms[product.category] || { scale: 1.0, posY: 0.0, posZ: 0.0, rotY: 0.0, rotX: 0.0 };
  const finalScale = product.scale * t.scale;
  object3d.scale.set(finalScale, finalScale, finalScale);
  object3d.position.set(
    product.offset.x,
    product.offset.y + t.posY,
    product.offset.z + t.posZ
  );
  object3d.rotation.set(
    product.rotation.x + t.rotX,
    product.rotation.y + t.rotY,
    product.rotation.z
  );
}

async function switchProduct(productId, updateUI = true) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  const model = await getOrLoadModel(product);

  if (product.category === 'glasses') {
    activeGlassesId = product.id;
    glassesAnchorGroup.clear();
    glassesAnchorGroup.add(model);
  } else if (product.category === 'hat') {
    activeHatId = product.id;
    hatAnchorGroup.clear();
    hatAnchorGroup.add(model);
  }

  if (updateUI) {
    updateProductCardUI(product);
    renderCarousel();
    updateActiveVisibility();
    syncSlidersToActiveCategory();
  }
}

function updateActiveVisibility() {
  if (!glassesAnchorGroup || !hatAnchorGroup) return;

  if (currentCategory === 'glasses') {
    glassesAnchorGroup.visible = true;
    hatAnchorGroup.visible = false;
  } else if (currentCategory === 'hat') {
    glassesAnchorGroup.visible = false;
    hatAnchorGroup.visible = true;
  } else if (currentCategory === 'both') {
    glassesAnchorGroup.visible = true;
    hatAnchorGroup.visible = true;
  }
}

function updateProductCardUI(product) {
  productNameEl.innerText = product.name;
  productPriceEl.innerText = product.price;
  productBadgeEl.innerText = product.badge;
}

// ==========================================
// 7. RENDER CAROUSEL PRODUK (MINIMALIST)
// ==========================================
function renderCarousel() {
  itemsCarousel.innerHTML = '';

  const filtered = PRODUCTS.filter((p) => {
    if (currentCategory === 'both') return true;
    return p.category === currentCategory;
  });

  filtered.forEach((item) => {
    const isSelected = item.id === activeGlassesId || item.id === activeHatId;

    const button = document.createElement('button');
    button.className = `flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center space-x-1.5 active:scale-95 ${
      isSelected
        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/30'
        : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
    }`;

    button.innerHTML = `
      <span>${item.category === 'glasses' ? '👓' : '👒'}</span>
      <span class="truncate max-w-[110px]">${item.name}</span>
    `;

    button.addEventListener('click', () => {
      switchProduct(item.id, true);
    });

    itemsCarousel.appendChild(button);
  });
}

// ==========================================
// 8. INTERAKSI & EVENT LISTENERS
// ==========================================
btnStart.addEventListener('click', () => {
  startModal.classList.add('hidden');
  initMindAR();
});

// Tab Kategori Kacamata
tabGlasses.addEventListener('click', () => {
  currentCategory = 'glasses';
  updateTabStyles();
  renderCarousel();
  updateActiveVisibility();
  const currentGlasses = PRODUCTS.find((p) => p.id === activeGlassesId);
  if (currentGlasses) updateProductCardUI(currentGlasses);
  syncSlidersToActiveCategory();
});

// Tab Kategori Topi
tabHats.addEventListener('click', () => {
  currentCategory = 'hat';
  updateTabStyles();
  renderCarousel();
  updateActiveVisibility();
  const currentHat = PRODUCTS.find((p) => p.id === activeHatId);
  if (currentHat) updateProductCardUI(currentHat);
  syncSlidersToActiveCategory();
});

// Tab Combo (Keduanya)
tabBoth.addEventListener('click', () => {
  currentCategory = 'both';
  updateTabStyles();
  renderCarousel();
  updateActiveVisibility();
  productNameEl.innerText = 'Kombinasi Kacamata & Topi';
  productPriceEl.innerText = 'Paket Bundling UMKM';
  productBadgeEl.innerText = 'Combo Set';
  syncSlidersToActiveCategory();
});

function updateTabStyles() {
  const activeClass = ['bg-indigo-600', 'text-white', 'shadow'];
  const inactiveClass = ['text-slate-400'];

  [tabGlasses, tabHats, tabBoth].forEach((t) => {
    t.classList.remove(...activeClass);
    t.classList.add(...inactiveClass);
  });

  if (currentCategory === 'glasses') {
    tabGlasses.classList.add(...activeClass);
    tabGlasses.classList.remove(...inactiveClass);
  } else if (currentCategory === 'hat') {
    tabHats.classList.add(...activeClass);
    tabHats.classList.remove(...inactiveClass);
  } else {
    tabBoth.classList.add(...activeClass);
    tabBoth.classList.remove(...inactiveClass);
  }
}

// ==========================================
// 9. KALIBRASI LIVE (PER-KATEGORI)
// ==========================================
function getActiveTargetCategory() {
  return currentCategory === 'hat' ? 'hat' : 'glasses';
}

function syncSlidersToActiveCategory() {
  const target = getActiveTargetCategory();
  const t = categoryTransforms[target];

  adjustTargetBadge.innerText = target === 'hat' ? '👒 Topi' : '👓 Kacamata';
  adjustTargetBadge.className = target === 'hat'
    ? 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-300 border border-amber-500/40 ml-1'
    : 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 ml-1';

  sliderScale.value = t.scale;
  labelScale.innerText = `${t.scale.toFixed(2)}x`;

  sliderPosY.value = t.posY;
  labelPosY.innerText = t.posY.toFixed(2);

  sliderPosZ.value = t.posZ;
  labelPosZ.innerText = t.posZ.toFixed(2);

  const degY = Math.round((t.rotY * 180) / Math.PI);
  sliderRotY.value = degY;
  labelRotY.innerText = `${degY}°`;

  const degX = Math.round((t.rotX * 180) / Math.PI);
  sliderRotX.value = degX;
  labelRotX.innerText = `${degX}°`;
}

btnAdjust.addEventListener('click', () => {
  syncSlidersToActiveCategory();
  adjustPanel.classList.toggle('hidden');
});
btnCloseAdjust.addEventListener('click', () => {
  adjustPanel.classList.add('hidden');
});

sliderScale.addEventListener('input', (e) => {
  const target = getActiveTargetCategory();
  categoryTransforms[target].scale = parseFloat(e.target.value);
  labelScale.innerText = `${categoryTransforms[target].scale.toFixed(2)}x`;
  reapplyActiveTransforms();
});

// Preset Buttons Ukuran Cepat
const btnScale1x = document.getElementById('btn-scale-1x');
const btnScale2x = document.getElementById('btn-scale-2x');
const btnScale3x = document.getElementById('btn-scale-3x');
const btnScale5x = document.getElementById('btn-scale-5x');

function setPresetScale(val) {
  const target = getActiveTargetCategory();
  categoryTransforms[target].scale = val;
  sliderScale.value = val;
  labelScale.innerText = `${val.toFixed(2)}x`;
  reapplyActiveTransforms();
}

if (btnScale1x) btnScale1x.addEventListener('click', () => setPresetScale(1.0));
if (btnScale2x) btnScale2x.addEventListener('click', () => setPresetScale(2.0));
if (btnScale3x) btnScale3x.addEventListener('click', () => setPresetScale(3.0));
if (btnScale5x) btnScale5x.addEventListener('click', () => setPresetScale(5.0));

sliderPosY.addEventListener('input', (e) => {
  const target = getActiveTargetCategory();
  categoryTransforms[target].posY = parseFloat(e.target.value);
  labelPosY.innerText = categoryTransforms[target].posY.toFixed(2);
  reapplyActiveTransforms();
});

sliderPosZ.addEventListener('input', (e) => {
  const target = getActiveTargetCategory();
  categoryTransforms[target].posZ = parseFloat(e.target.value);
  labelPosZ.innerText = categoryTransforms[target].posZ.toFixed(2);
  reapplyActiveTransforms();
});

sliderRotY.addEventListener('input', (e) => {
  const target = getActiveTargetCategory();
  const deg = parseFloat(e.target.value);
  categoryTransforms[target].rotY = (deg * Math.PI) / 180;
  labelRotY.innerText = `${deg}°`;
  reapplyActiveTransforms();
});

sliderRotX.addEventListener('input', (e) => {
  const target = getActiveTargetCategory();
  const deg = parseFloat(e.target.value);
  categoryTransforms[target].rotX = (deg * Math.PI) / 180;
  labelRotX.innerText = `${deg}°`;
  reapplyActiveTransforms();
});

// Tombol Balik Arah 180 Derajat
btnFlip180.addEventListener('click', () => {
  const target = getActiveTargetCategory();
  categoryTransforms[target].rotY += Math.PI;
  if (categoryTransforms[target].rotY > Math.PI) categoryTransforms[target].rotY -= Math.PI * 2;
  const deg = Math.round((categoryTransforms[target].rotY * 180) / Math.PI);
  sliderRotY.value = deg;
  labelRotY.innerText = `${deg}°`;
  reapplyActiveTransforms();
});

// Tombol Reset Kalibrasi
btnResetAdjust.addEventListener('click', () => {
  const target = getActiveTargetCategory();
  categoryTransforms[target] = { scale: 1.0, posY: 0.0, posZ: 0.0, rotY: 0.0, rotX: 0.0 };
  syncSlidersToActiveCategory();
  reapplyActiveTransforms();
});

function reapplyActiveTransforms() {
  const glasses = PRODUCTS.find((p) => p.id === activeGlassesId);
  const hat = PRODUCTS.find((p) => p.id === activeHatId);

  if (glasses && loadedModels.has(glasses.id)) {
    applyProductTransforms(loadedModels.get(glasses.id), glasses);
  }
  if (hat && loadedModels.has(hat.id)) {
    applyProductTransforms(loadedModels.get(hat.id), hat);
  }
}

// ==========================================
// 10. FITUR SNAPSHOT (AMBIL FOTO AR)
// ==========================================
btnSnapshot.addEventListener('click', () => {
  const video = document.querySelector('#ar-container video');
  const canvas = document.querySelector('#ar-container canvas');

  if (!video || !canvas || !arRenderer || !arScene || !arCamera) {
    alert('Kamera belum siap untuk mengambil foto.');
    return;
  }

  // 1. PENTING: Paksa render Three.js di detik ini juga!
  // Tanpa ini, WebGL buffer langsung dikosongkan (cleared) oleh GPU antar-frame
  // sehingga hasil poto menjadi transparan/efek 3D hilang.
  arRenderer.render(arScene, arCamera);

  const offscreenCanvas = document.createElement('canvas');
  const cw = canvas.width;
  const ch = canvas.height;
  offscreenCanvas.width = cw;
  offscreenCanvas.height = ch;
  const ctx = offscreenCanvas.getContext('2d');

  // 2. Hitung crop object-fit: cover agar frame foto sama persis dengan yang dilihat di layar
  const vw = video.videoWidth || cw;
  const vh = video.videoHeight || ch;
  const videoRatio = vw / vh;
  const canvasRatio = cw / ch;

  let sx, sy, sw, sh;
  if (videoRatio > canvasRatio) {
    sh = vh;
    sw = vh * canvasRatio;
    sx = (vw - sw) / 2;
    sy = 0;
  } else {
    sw = vw;
    sh = vw / canvasRatio;
    sx = 0;
    sy = (vh - sh) / 2;
  }

  // 3. Gambar video selfie (flip horizontal mirrored)
  ctx.save();
  ctx.translate(cw, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, cw, ch);
  ctx.restore();

  // 4. Gambar overlay 3D dari canvas WebGL tepat di atas video
  ctx.drawImage(canvas, 0, 0, cw, ch);

  const dataUrl = offscreenCanvas.toDataURL('image/png');
  snapshotImage.src = dataUrl;
  btnDownloadSnapshot.href = dataUrl;
  btnDownloadSnapshot.download = `ar-tryon-${Date.now()}.png`;

  snapshotModal.classList.remove('hidden');
});

btnCloseSnapshot.addEventListener('click', () => snapshotModal.classList.add('hidden'));
btnRetakeSnapshot.addEventListener('click', () => snapshotModal.classList.add('hidden'));

// Modal Info Project
btnInfo.addEventListener('click', () => infoModal.classList.remove('hidden'));
btnCloseInfo.addEventListener('click', () => infoModal.classList.add('hidden'));
btnConfirmInfo.addEventListener('click', () => infoModal.classList.add('hidden'));

// Render awal
renderCarousel();
syncSlidersToActiveCategory();
