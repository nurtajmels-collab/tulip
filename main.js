const canvas = document.querySelector('#webgl-canvas');
const status = document.querySelector('.model-status');
const model = new THREE.Group();
const scene = new THREE.Scene();

// ИСПРАВЛЕНО: Увеличили дальность видимости камеры со 100 до 1000
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (error) {
  status.textContent = 'WebGL өшірулі: браузер параметрлерін тексеріңіз';
  throw error;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.setClearColor(0x000000, 0); // Прозрачный фон
scene.add(model);

// Добавляем красивый свет
scene.add(new THREE.HemisphereLight(0xf6f1df, 0x23452a, 2.4));
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);
const keyLight = new THREE.DirectionalLight(0xffe7b3, 4.5);
keyLight.position.set(3, 5, 5);
scene.add(keyLight);

let scrollTimeline;

function showModel(loadedModel, label) {
  model.clear();
  
  // 1. Центрируем саму 3D-модель (исправляем кривой якорь внутри файла)
  const box = new THREE.Box3().setFromObject(loadedModel);
  const center = box.getCenter(new THREE.Vector3());
  loadedModel.position.x = -center.x;
  loadedModel.position.y = -center.y;
  loadedModel.position.z = -center.z;
  
  model.add(loadedModel);

  // 2. Настраиваем масштаб и позицию (сдвиг вправо на главном экране)
  // Если тюльпан слишком большой или маленький, меняй только цифры 12
  model.scale.set(12, 12, 12); 
  
  // Если нужно подвинуть модель левее/правее, меняй первое число (сейчас 2.5)
  model.position.set(2.5, 0, 0); 

  // 3. Ставим камеру жестко перед сценой
  camera.position.set(0, 0, 500);
  camera.lookAt(0, 0, 0);

  scrollTimeline?.kill();
  scrollTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1
    }
  });

  const finalSection = 'finalSection';
  const finalFocusY = -100;

  scrollTimeline
    .to(model.rotation, { y: Math.PI * 2, duration: 1 })
    .to(model.position, { x: -2.5, duration: 1 }, '<')
    .to(model.rotation, { y: Math.PI * 4, z: 0.18, duration: 1 })
    .to(model.position, { x: 2.5, duration: 1 }, '<')
    .add(finalSection)
    .to(model.position, { x: 0, y: finalFocusY, duration: 1 }, finalSection)
    .to(model.rotation, { x: 0.3, z: 0, duration: 1 }, finalSection)
    .to(model.scale, { x: 18, y: 18, z: 18, duration: 1 }, finalSection);

  status.textContent = label;
  if(status.classList) status.classList.add('ready');
}

// Загрузка модели
const loader = new THREE.GLTFLoader();
loader.load(
  'tulip.glb',
  (gltf) => showModel(gltf.scene, '3D модель дайын'),
  undefined,
  () => { status.textContent = '3D модель жүктелмеді'; }
);

// Анимация вращения
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Адаптивность при изменении размера окна
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});