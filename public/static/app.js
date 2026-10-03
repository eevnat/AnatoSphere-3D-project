// AnatoSphere 3D – main application
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { buildBody } from './model.js'

const $ = (s) => document.querySelector(s)
const $$ = (s) => [...document.querySelectorAll(s)]
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

// ═════════════ STATE ═════════════
const S = {
  data: null, reg: null, sysById: {},
  tab: 'explore', level: localStorage.getItem('as-level') || 'beginner',
  selected: null, hovered: null, system: null,
  hidden: new Set(), exploded: new Set(), extracted: null, extractOffset: null,
  xray: false, labels: false,
  layers: { skin: { on: true, op: 0 }, muscle: { on: true, op: 0.22 }, bone: { on: true, op: 1 }, organ: { on: true, op: 1 }, vessel: { on: true, op: 1 } },
  focusSet: null, // Set of ids that are "in focus" (journey / quiz); others ghosted
  journey: null, quiz: null,
  ai: { history: [] },
}
const PROG_KEY = 'anatosphere-progress-v1'
const P = Object.assign({ viewed: [], journeys: [], quizzes: [], asked: 0 }, JSON.parse(localStorage.getItem(PROG_KEY) || '{}'))
const saveP = () => localStorage.setItem(PROG_KEY, JSON.stringify(P))
const markViewed = (id) => { if (!P.viewed.includes(id)) { P.viewed.push(id); saveP(); checkAchievements() } }

// ═════════════ THREE SETUP ═════════════
const viewerEl = $('#viewer')
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.05
renderer.outputColorSpace = THREE.SRGBColorSpace
viewerEl.appendChild(renderer.domElement)

const scene = new THREE.Scene()
const pmrem = new THREE.PMREMGenerator(renderer)
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
scene.fog = new THREE.Fog(0x070b16, 4, 9)

const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 50)
camera.position.set(0.6, 1.3, 4.2)
const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(0, 0.95, 0)
controls.enableDamping = true; controls.dampingFactor = 0.08
controls.minDistance = 0.12; controls.maxDistance = 6
controls.autoRotateSpeed = 1.2
controls.zoomSpeed = 1.1

scene.add(new THREE.HemisphereLight(0xbfdfff, 0x1a1020, 0.7))
const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(1.5, 3, 2.5); scene.add(key)
const rim = new THREE.DirectionalLight(0x66ccff, 1.0); rim.position.set(-2, 2, -2.5); scene.add(rim)
const fill = new THREE.DirectionalLight(0xffd6c0, 0.45); fill.position.set(-1.5, 0.5, 2); scene.add(fill)

// platform
{
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.45, 96), new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.5, side: THREE.DoubleSide }))
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.002; scene.add(ring)
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.42, 96), new THREE.MeshBasicMaterial({ color: 0x0d2340, transparent: true, opacity: 0.55 }))
  disc.rotation.x = -Math.PI / 2; scene.add(disc)
  const grid = new THREE.PolarGridHelper(1.6, 12, 8, 96, 0x1d3357, 0x14223d); grid.position.y = -0.001; scene.add(grid)
}

// ═════════════ HELPERS ═════════════
const E = (id) => S.reg.get(id)
const descendants = (id) => { const out = [id]; for (const c of E(id)?.children || []) out.push(...descendants(c)); return out }
const ancestors = (id) => { const out = []; let e = E(id); while (e?.parent) { out.push(e.parent); e = E(e.parent) } return out }
const topOf = (id) => { const a = ancestors(id); return a.length ? a[a.length - 1] : id }
const worldCenter = (id) => {
  const e = E(id), v = e.center.clone()
  let g = e.group; while (g && g !== bodyRoot) { v.add(g.position); g = g.parent }
  return v
}
const sizeOf = (id) => { const s = E(id).size; return Math.max(s.x, s.y, s.z) }
const displayName = (id) => E(id)?.data?.name || id
const sysColor = (sys) => S.sysById[sys]?.color || '#fff'
function toast(msg, ms = 2200) { const t = $('#toast'); t.innerHTML = msg; t.hidden = false; clearTimeout(t._t); t._t = setTimeout(() => (t.hidden = true), ms) }
function speak(text, rate = 0.92) {
  if (!('speechSynthesis' in window)) return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text); u.rate = rate; u.lang = 'en-US'
  speechSynthesis.speak(u)
}

// ═════════════ CAMERA TWEEN ═════════════
const cam = { tgt: null, dist: null, dir: null, follow: false }
function focusOn(id, mult = 2.8) {
  const c = worldCenter(id)
  cam.tgt = c; cam.dist = Math.min(3.2, Math.max(0.22, sizeOf(id) * mult + 0.12)); cam.dir = null; cam.follow = false
}
function focusBox(ids) {
  const box = new THREE.Box3()
  ids.forEach((id) => { const e = E(id); if (e?.meshes.length || e?.children.length) box.expandByObject(e.group) })
  if (box.isEmpty()) return
  const s = box.getSize(new THREE.Vector3())
  cam.tgt = box.getCenter(new THREE.Vector3()); cam.dist = Math.min(3.2, Math.max(0.35, Math.max(s.x, s.y * 1.1, s.z) * 1.9 + 0.2)); cam.dir = null; cam.follow = false
}
function resetCamera() { cam.tgt = new THREE.Vector3(0, 0.95, 0); cam.dist = 2.75; cam.dir = new THREE.Vector3(0, 0.05, 1).normalize(); cam.follow = false }
controls.addEventListener('start', () => { if (!cam.follow) cam.tgt = null; cam.dir = null; userInteracted = true })
let userInteracted = false
function updateCamera() {
  if (!cam.tgt) return
  const k = cam.follow ? 0.06 : 0.09
  controls.target.lerp(cam.tgt, k)
  const dir = cam.dir || camera.position.clone().sub(controls.target).normalize()
  const desired = controls.target.clone().addScaledVector(dir, cam.dist)
  camera.position.lerp(desired, k)
  if (!cam.follow && camera.position.distanceTo(desired) < 0.002 && controls.target.distanceTo(cam.tgt) < 0.002) cam.tgt = null
}

// ═════════════ VISIBILITY / MATERIALS ═════════════
const GHOST = 0.045
function effOpacity(e) {
  if (e.id === 'skin') return 0
  if (S.hidden.has(e.id) || ancestors(e.id).some((a) => S.hidden.has(a))) return 0
  const L = S.layers[e.layer]
  if (S.focusSet) return S.focusSet.has(e.id) ? 1 : GHOST
  if (!L.on) return 0
  let op
  if (S.system) op = e.system === S.system ? 1 : GHOST * 0.8
  else op = L.op * e.defaultOp
  const selSet = S.selected ? new Set(descendants(S.selected)) : null
  if (selSet) {
    // soft focus: selected structure solid, everything else faded so it is never hidden
    if (selSet.has(e.id)) op = 1
    else if (ancestors(S.selected).includes(e.id)) op = Math.min(op, 0.5)
    else op = Math.min(op, S.xray ? 0.07 : 0.2)
  } else if (S.xray) op = Math.min(op, 0.3)
  return op
}
function applyVisibility() {
  for (const e of S.reg.values()) {
    if (e.id === 'skin') {
      const L = S.layers.skin
      const ctx = !!(S.focusSet || S.system || S.extracted)
      e.holo.uniforms.opacity.value = L.on ? (ctx ? 0.35 : 0.85) : 0
      for (const m of e.meshes) {
        if (m.userData.holo) m.visible = L.on
        else m.userData.targetOp = L.on && !ctx && !S.xray ? L.op : 0
      }
      continue
    }
    const op = effWithExtract(e)
    for (const m of e.meshes) m.userData.targetOp = op
  }
  updateLabelsSet()
}
function tickMaterials(t) {
  const selSet = S.selected ? new Set(descendants(S.selected)) : null
  const pulse = 0.5 + 0.5 * Math.sin(t * 4)
  for (const e of S.reg.values()) {
    const isSel = selSet?.has(e.id)
    const isHov = S.hovered && descendants(S.hovered).includes(e.id)
    for (const m of e.meshes) {
      if (m.userData.holo) continue
      const mat = m.material, tgt = m.userData.targetOp ?? 1
      mat.opacity += (tgt - mat.opacity) * 0.15
      if (Math.abs(mat.opacity - tgt) < 0.003) mat.opacity = tgt
      m.visible = mat.opacity > 0.004
      const transp = mat.opacity < 0.995
      mat.transparent = transp; mat.depthWrite = !transp
      if (mat.emissive) {
        if (isSel) mat.emissive.setRGB(0.05 + 0.12 * pulse, 0.25 + 0.25 * pulse, 0.32 + 0.3 * pulse)
        else if (isHov) mat.emissive.setRGB(0.12, 0.16, 0.2)
        else mat.emissive.setRGB(0, 0, 0)
      }
    }
  }
}

// ═════════════ OFFSET ANIMATION (extract / explode) ═════════════
function setGroupTarget(obj, v) { obj.userData.posTarget = v }
function tickOffsets() {
  for (const e of S.reg.values()) {
    const g = e.group
    if (g.userData.posTarget) g.position.lerp(g.userData.posTarget, 0.12)
    for (const m of e.meshes) if (m.userData.posTarget) m.position.lerp(m.userData.posTarget, 0.12)
  }
}
function computeOffsets() {
  for (const e of S.reg.values()) {
    let off = new THREE.Vector3()
    if (S.extracted === e.id && S.extractOffset) off.add(S.extractOffset)
    if (e.parent && S.exploded.has(e.parent)) {
      const p = E(e.parent), d = e.center.clone().sub(p.center)
      off.addScaledVector(d, 1.1).addScaledVector(d.clone().normalize(), sizeOf(e.parent) * 0.18)
    }
    setGroupTarget(e.group, off)
    // mesh-level explode for leaf structures with several meshes
    const meshExplode = S.exploded.has(e.id) && !e.children.length
    for (const m of e.meshes) {
      const base = m.userData.basePos
      if (!meshExplode || m.userData.holo || m.userData.solid) { m.userData.posTarget = base.clone(); continue }
      const d = m.userData.center.clone().sub(e.center)
      m.userData.posTarget = base.clone().addScaledVector(d, 0.9)
    }
  }
}
const canExplode = (id) => id && (E(id).children.length > 0 || E(id).meshes.length > 1)
const explodeTarget = (id) => (!id ? null : canExplode(id) && !E(id).parent ? id : E(id).parent && canExplode(E(id).parent) ? E(id).parent : canExplode(id) ? id : null)

// ═════════════ PICKING ═════════════
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2()
let pickables = []
function pick(ev) {
  const r = renderer.domElement.getBoundingClientRect()
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1)
  ray.setFromCamera(ndc, camera)
  pickables = []
  for (const e of S.reg.values()) for (const m of e.meshes) {
    if (m.userData.holo || !m.visible) continue
    if ((m.userData.targetOp ?? 1) < 0.15) continue
    pickables.push(m)
  }
  const hits = ray.intersectObjects(pickables, false)
  // prefer solid structures; fall back to faded ones so everything stays clickable
  const hit = hits.find((h) => (h.object.userData.targetOp ?? 1) >= 0.45) || hits[0]
  return hit ? resolvePick(hit.object.userData.sid) : null
}
// clicking a sub-part selects its parent until the parent is "opened"
function resolvePick(id) {
  const e = E(id)
  if (!e.parent) return id
  const p = e.parent
  const open = S.selected === p || (S.selected && E(S.selected).parent === p) || S.extracted === p || S.exploded.has(p) || (S.focusSet && S.journey)
  return open ? id : resolvePick(p)
}

let downPos = null, lastMove = 0
renderer.domElement.addEventListener('pointerdown', (ev) => { downPos = [ev.clientX, ev.clientY] })
renderer.domElement.addEventListener('pointerup', (ev) => {
  if (!downPos) return
  const moved = Math.hypot(ev.clientX - downPos[0], ev.clientY - downPos[1])
  downPos = null
  if (moved > 6 || S.quiz?.active) return
  const id = pick(ev)
  if (id) select(id, { focus: false })
  else if (!S.journey) select(null)
})
renderer.domElement.addEventListener('pointermove', (ev) => {
  const now = performance.now(); if (now - lastMove < 40) return; lastMove = now
  const tip = $('#hover-tip')
  if (S.quiz?.active || ev.buttons) { tip.hidden = true; S.hovered = null; return }
  const id = pick(ev)
  S.hovered = id
  renderer.domElement.style.cursor = id ? 'pointer' : 'grab'
  if (id) {
    const r = viewerEl.getBoundingClientRect()
    tip.hidden = false; tip.style.left = ev.clientX - r.left + 'px'; tip.style.top = ev.clientY - r.top + 'px'
    tip.innerHTML = `<span style="color:${sysColor(E(id).system)}">●</span> ${esc(displayName(id))}`
  } else tip.hidden = true
})
renderer.domElement.addEventListener('pointerleave', () => { $('#hover-tip').hidden = true; S.hovered = null })
renderer.domElement.addEventListener('dblclick', (ev) => { const id = pick(ev); if (id) focusOn(id) })

// ═════════════ SELECTION ═════════════
function ensureVisible(id) {
  const e = E(id)
  ;[id, ...ancestors(id)].forEach((x) => S.hidden.delete(x))
  if (S.system && S.system !== e.system) S.system = null
  if (!S.layers[e.layer].on) S.layers[e.layer].on = true
  if (!S.system && !S.focusSet && S.layers[e.layer].op * e.defaultOp < 0.3) {
    // muscles / skull are faint by default: switch to the structure's system so it pops
    S.system = e.system
  }
  if (S.extracted && !descendants(S.extracted).includes(id) && !ancestors(id).includes(S.extracted)) { S.extracted = null; S.extractOffset = null }
  for (const ex of [...S.exploded]) if (!descendants(ex).includes(id)) S.exploded.delete(ex)
  computeOffsets()
}
function select(id, opts = {}) {
  S.selected = id
  if (id) {
    if (opts.reveal) ensureVisible(id)
    markViewed(id)
    if (opts.focus !== false) focusOn(id)
  }
  applyVisibility(); renderToolbar(); renderTree(); renderBreadcrumb(); renderSystems()
  if (S.tab === 'explore' || id) { if (S.tab !== 'explore' && !S.journey && !S.quiz?.active) setTab('explore', true); renderInfo() }
  updateAISuggest()
}

// ═════════════ TOOLBAR ACTIONS ═════════════
function doExtract() {
  const id = S.selected; if (!id) return
  if (S.extracted && (S.extracted === id || descendants(S.extracted).includes(id))) {
    const back = S.extracted; S.extracted = null; S.extractOffset = null; S.exploded.clear()
    computeOffsets(); applyVisibility(); renderToolbar(); renderBreadcrumb()
    setTimeout(() => focusOn(back), 50)
    return
  }
  S.extracted = id; S.system = null
  const dir = camera.position.clone().sub(controls.target); dir.y = 0; dir.normalize()
  S.extractOffset = dir.multiplyScalar(0.22 + sizeOf(id) * 1.2).add(new THREE.Vector3(0, 0.03, 0))
  S.focusSet = null
  computeOffsets(); applyVisibility(); renderToolbar(); renderBreadcrumb()
  const c = worldCenter(id).add(S.extractOffset).sub(E(id).group.position)
  cam.tgt = c; cam.dist = Math.max(0.22, sizeOf(id) * 3 + 0.1); cam.dir = null
  toast(`<i class="fas fa-up-right-from-square text-cyan-300"></i> <b>${esc(displayName(id))}</b> extracted – drag to rotate it${canExplode(id) ? ', then try <b>Explode</b>' : ''}`)
}
// "isolate" = extracted-subtree only visible (others ghosted)
function extractFocusSet() { return S.extracted ? new Set([...descendants(S.extracted), ...ancestors(S.extracted)]) : null }
const _eff = effOpacity
function effWithExtract(e) {
  const fs = extractFocusSet()
  if (fs && !S.focusSet) {
    if (e.id === 'skin') return 0
    if (S.hidden.has(e.id)) return 0
    if (!fs.has(e.id)) return GHOST * 0.6
    if (S.xray && S.selected) return descendants(S.selected).includes(e.id) ? 1 : 0.15
    return 1
  }
  return _eff(e)
}
function doExplode() {
  const t = explodeTarget(S.selected); if (!t) return
  if (S.exploded.has(t)) S.exploded.delete(t)
  else {
    S.exploded.add(t)
    if (!S.extracted && !S.system) S.system = E(t).system
    if (E(t).children.length) toast(`<i class="fas fa-burst text-cyan-300"></i> Parts separated – click a part to learn about it`)
  }
  computeOffsets(); applyVisibility(); renderToolbar()
  setTimeout(() => {
    const c = worldCenter(t)
    cam.tgt = c; cam.dist = Math.max(0.3, sizeOf(t) * (S.exploded.has(t) ? 4.2 : 2.8) + 0.12); cam.dir = null
  }, 60)
}
function doHide() {
  if (!S.selected) return
  S.hidden.add(S.selected)
  toast(`<i class="fas fa-eye-slash"></i> ${esc(displayName(S.selected))} hidden – use <b>Show All</b> to bring it back`)
  select(null)
}
function doShowAll() {
  S.hidden.clear(); S.exploded.clear(); S.extracted = null; S.extractOffset = null; S.system = null
  computeOffsets(); applyVisibility(); renderToolbar(); renderSystems(); renderTree(); renderBreadcrumb()
  if (S.tab === 'explore') renderInfo()
}
function resetAll() {
  if (S.journey) endJourney(); if (S.quiz?.active) endQuiz(true)
  S.xray = false; S.labels = false
  doShowAll(); select(null); resetCamera()
}
$('#tb-extract').onclick = doExtract
$('#tb-explode').onclick = doExplode
$('#tb-hide').onclick = doHide
$('#tb-showall').onclick = doShowAll
$('#tb-ghost').onclick = () => { S.xray = !S.xray; applyVisibility(); renderToolbar() }
$('#tb-labels').onclick = () => { S.labels = !S.labels; updateLabelsSet(); renderToolbar() }
$('#tb-quiz').onclick = () => setTab('quiz')
$('#reset-view').onclick = resetAll
$('#auto-rotate').onclick = (e) => { controls.autoRotate = !controls.autoRotate; e.currentTarget.classList.toggle('on', controls.autoRotate) }
$$('#view-buttons [data-view]').forEach((b) => (b.onclick = () => {
  const d = { front: [0, 0.05, 1], side: [1, 0.05, 0], back: [0, 0.05, -1] }[b.dataset.view]
  cam.tgt = controls.target.clone(); cam.dist = camera.position.distanceTo(controls.target); cam.dir = new THREE.Vector3(...d).normalize(); cam.follow = false
}))
function renderToolbar() {
  const id = S.selected
  const ex = $('#tb-extract')
  ex.disabled = !id || !!S.quiz?.active
  const isOut = S.extracted && id && (S.extracted === id || descendants(S.extracted).includes(id))
  ex.querySelector('span').textContent = isOut ? 'Return' : 'Extract'
  ex.classList.toggle('on', !!isOut)
  const t = explodeTarget(id), xb = $('#tb-explode')
  xb.disabled = !t || !!S.quiz?.active
  xb.querySelector('span').textContent = t && S.exploded.has(t) ? 'Collapse' : 'Explode'
  xb.classList.toggle('on', !!(t && S.exploded.has(t)))
  $('#tb-hide').disabled = !id || !!S.quiz?.active
  $('#tb-ghost').classList.toggle('on', S.xray)
  $('#tb-labels').classList.toggle('on', S.labels)
}

// ═════════════ LABELS ═════════════
const labelEls = new Map()
let labelIds = []
const KEY_LABELS = ['brain', 'heart', 'lungs', 'liver', 'stomach', 'kidneys', 'small_intestine', 'large_intestine', 'femur', 'skull', 'ribcage', 'spine', 'pelvis', 'bladder', 'diaphragm', 'spleen', 'pancreas', 'trachea']
function updateLabelsSet() {
  if (!S.reg) return
  let ids = []
  if (S.labels && !S.quiz?.active) {
    const ex = [...S.exploded].find((x) => E(x).children.length)
    if (ex) ids = E(ex).children
    else if (S.extracted) ids = E(S.extracted).children.length ? E(S.extracted).children : [S.extracted]
    else if (S.focusSet) ids = [...S.focusSet].filter((id) => !E(id).parent && (E(id).meshes.length || E(id).children.length) && id !== 'skin')
    else if (S.system) ids = S.data.structures.filter((s) => s.system === S.system && !s.parent && s.id !== 'skin').map((s) => s.id)
    else ids = KEY_LABELS
    ids = ids.filter((id) => !S.hidden.has(id))
  }
  labelIds = ids
  const layer = $('#labels-layer')
  for (const [id, el] of labelEls) if (!ids.includes(id)) { el.remove(); labelEls.delete(id) }
  for (const id of ids) if (!labelEls.has(id)) {
    const el = document.createElement('div'); el.className = 'label3d'; el.textContent = displayName(id).replace(/\s*\(.*\)/, '')
    el.onclick = () => select(id, { focus: true }); layer.appendChild(el); labelEls.set(id, el)
  }
}
const _v = new THREE.Vector3()
function tickLabels() {
  if (!labelIds.length) return
  const r = renderer.domElement
  for (const id of labelIds) {
    const el = labelEls.get(id); if (!el) continue
    const e = E(id)
    _v.copy(worldCenter(id)); _v.y += e.size.y * 0.35
    _v.project(camera)
    const vis = _v.z < 1 && Math.abs(_v.x) < 1.1 && Math.abs(_v.y) < 1.1
    el.style.display = vis ? '' : 'none'
    el.style.left = ((_v.x + 1) / 2) * r.clientWidth + 'px'
    el.style.top = ((1 - _v.y) / 2) * r.clientHeight + 'px'
    el.classList.toggle('sel', S.selected === id)
  }
}

// ═════════════ LIVING BODY: heartbeat + breathing ═════════════
function tickLife(t) {
  const beatRate = S.journey?.def.id === 'blood' ? 1.6 : 1.15
  const ph = (t * beatRate) % 1
  const beat = Math.exp(-Math.pow((ph - 0.1) / 0.05, 2)) * 0.06 + Math.exp(-Math.pow((ph - 0.3) / 0.06, 2)) * 0.035
  for (const id of ['left_ventricle', 'right_ventricle']) for (const m of E(id).meshes) m.scale.copy(m.userData.baseScale).multiplyScalar(1 - beat * 0.8)
  for (const id of ['left_atrium', 'right_atrium']) for (const m of E(id).meshes) m.scale.copy(m.userData.baseScale).multiplyScalar(1 + beat * 0.5)
  const deep = S.journey?.def.id === 'breath'
  const br = (Math.sin(t * (deep ? 1.6 : 1.0)) + 1) / 2
  const amp = deep ? 0.07 : 0.025
  for (const id of ['right_lung', 'left_lung']) for (const m of E(id).meshes) { m.scale.copy(m.userData.baseScale); m.scale.x *= 1 + amp * br; m.scale.z *= 1 + amp * br; m.scale.y *= 1 + amp * 0.6 * br }
  for (const m of E('diaphragm').meshes) { m.position.y = m.userData.basePos.y - (deep ? 0.018 : 0.007) * br }
}

// ═════════════ JOURNEYS ═════════════
const particle = new THREE.Group()
{
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.009, 20, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }))
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c) })()
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, blending: THREE.AdditiveBlending, depthTest: false, transparent: true }))
  glow.scale.setScalar(0.07)
  const light = new THREE.PointLight(0xffffff, 0.6, 0.35)
  particle.add(core, glow, light)
  particle.userData = { core, glow, light, glowTex }
  particle.visible = false; particle.renderOrder = 20
  core.renderOrder = 20
}
scene.add(particle)
const trail = []
for (let i = 0; i < 26; i++) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: particle.userData.glowTex, blending: THREE.AdditiveBlending, depthTest: false, transparent: true, opacity: 0.55 * (1 - i / 26) }))
  s.scale.setScalar(0.04 * (1 - i / 30)); s.visible = false; scene.add(s); trail.push(s)
}
const trailHist = []
const JOURNEY_EXTRA = { food: ['gallbladder', 'liver', 'pancreas'], blood: ['heart', 'lungs', 'carotid', 'superior_vena_cava', 'aorta', 'femoral_artery'], breath: ['lungs', 'larynx'], nerve: ['brain', 'spinal_cord', 'humerus', 'radius_ulna'] }

function startJourney(jid) {
  const def = S.data.journeys.find((j) => j.id === jid)
  if (S.quiz?.active) endQuiz(true)
  S.extracted = null; S.extractOffset = null; S.exploded.clear(); S.hidden.clear(); S.system = null; S.xray = false
  computeOffsets()
  const ids = new Set()
  for (const st of def.steps) descendants(st.to).forEach((x) => ids.add(x))
  for (const x of JOURNEY_EXTRA[jid] || []) descendants(x).forEach((y) => ids.add(y))
  ;[...ids].forEach((x) => ancestors(x).forEach((a) => ids.add(a)))
  S.focusSet = ids
  S.journey = { def, step: -1, playing: true, voice: S.journey?.voice ?? true, path: null, t: 0, dur: 1, waitUntil: 0 }
  const col = new THREE.Color(def.color)
  particle.userData.core.material.color.copy(col).lerp(new THREE.Color(1, 1, 1), 0.4)
  particle.userData.glow.material.color.copy(col); particle.userData.light.color.copy(col)
  trail.forEach((s) => s.material.color.copy(col))
  trailHist.length = 0
  // start position
  const first = def.steps[0], fe = E(first.to)
  const startPos = first.follow && fe.curve ? fe.curve.getPointAt(first.reverse ? 1 : 0) : worldCenter(first.to)
  particle.position.copy(startPos); particle.visible = true
  $('#journey-card').hidden = false
  $('#jc-icon').innerHTML = `<i class="fas ${def.icon}"></i>`; $('#jc-icon').style.background = def.color + '33'; $('#jc-icon').style.color = def.color
  $('#jc-title').textContent = def.name
  $('#jc-voice').classList.toggle('off', !S.journey.voice)
  select(null); applyVisibility(); renderToolbar(); renderBreadcrumb(); renderTree()
  cam.tgt = startPos.clone(); cam.dist = 0.9; cam.dir = null; cam.follow = true
  goStep(0)
}
function goStep(i) {
  const J = S.journey; if (!J) return
  const steps = J.def.steps
  if (i < 0) i = 0
  if (i >= steps.length) { finishJourney(); return }
  J.step = i
  const st = steps[i], e = E(st.to)
  const from = particle.position.clone()
  let pts
  if (st.hold) pts = null
  else if (st.follow && e.curve) {
    const cpts = e.curve.getSpacedPoints(Math.min(400, Math.max(30, Math.round(e.curve.getLength() * 600))))
    if (st.reverse) cpts.reverse()
    pts = from.distanceTo(cpts[0]) > 0.004 ? [from, ...cpts] : cpts
  } else {
    const to = worldCenter(st.at || st.to)
    const mid = from.clone().lerp(to, 0.5); mid.z += 0.02
    pts = from.distanceTo(to) > 0.002 ? [from, mid, to] : null
  }
  if (pts) {
    J.path = new THREE.CatmullRomCurve3(pts, false, 'centripetal')
    const len = J.path.getLength()
    J.dur = Math.min(6, Math.max(1.2, len * 4.5))
  } else J.path = null
  J.t = 0
  J.waitUntil = 0
  S.selected = st.to; markViewed(st.to)
  applyVisibility(); renderToolbar(); renderTree()
  cam.dist = Math.min(1.1, Math.max(0.38, sizeOf(st.at || st.to) * 3 + 0.15)); cam.follow = true; cam.tgt = particle.position.clone()
  $('#jc-step').textContent = `Step ${i + 1} of ${steps.length}`
  $('#jc-stage').textContent = st.title
  $('#jc-text').textContent = st.text
  $('#jc-bar').style.width = ((i + 1) / steps.length) * 100 + '%'
  $('#jc-play').innerHTML = `<i class="fas ${J.playing ? 'fa-pause' : 'fa-play'}"></i>`
  if (J.voice) speak(`${st.title}. ${st.text}`)
  renderInfoFor(st.to, true)
}
function tickJourney(dt, now) {
  const J = S.journey; if (!J) return
  if (J.path && J.t < 1) {
    J.t = Math.min(1, J.t + dt / J.dur)
    const e = J.t < 0.5 ? 2 * J.t * J.t : 1 - Math.pow(-2 * J.t + 2, 2) / 2
    particle.position.copy(J.path.getPointAt(e))
  }
  if (cam.follow) cam.tgt = particle.position.clone()
  // trail
  trailHist.unshift(particle.position.clone()); if (trailHist.length > trail.length * 2) trailHist.pop()
  trail.forEach((s, i) => { const p = trailHist[i * 2]; s.visible = !!p && particle.visible; if (p) s.position.copy(p) })
  const sc = 0.06 + 0.015 * Math.sin(now * 8); particle.userData.glow.scale.setScalar(sc)
  // auto advance
  const arrived = !J.path || J.t >= 1
  if (arrived && J.playing) {
    const st = J.def.steps[J.step]
    if (!J.waitUntil) J.waitUntil = now + Math.max(4.5, st.text.split(' ').length * 0.36) + (st.breathe ? 2 : 0)
    if (now > J.waitUntil) goStep(J.step + 1)
  }
}
function finishJourney() {
  const J = S.journey
  if (!P.journeys.includes(J.def.id)) { P.journeys.push(J.def.id); saveP(); checkAchievements() }
  J.playing = false
  $('#jc-stage').innerHTML = '<i class="fas fa-flag-checkered text-emerald-400"></i> Journey complete!'
  $('#jc-text').innerHTML = `You followed the whole <b>${esc(J.def.name)}</b>. Try another journey, or take a quiz to test what you learned.`
  $('#jc-play').innerHTML = '<i class="fas fa-rotate-right"></i>'
  J.done = true
  if (J.voice) speak('Journey complete! Great job.')
  if (S.tab === 'journeys') renderJourneysPanel()
}
function endJourney() {
  if (!S.journey) return
  speechSynthesis?.cancel()
  S.journey = null; S.focusSet = null; cam.follow = false; cam.tgt = null
  particle.visible = false; trail.forEach((s) => (s.visible = false))
  $('#journey-card').hidden = true
  applyVisibility(); renderToolbar(); renderBreadcrumb()
}
$('#jc-close').onclick = () => { endJourney(); select(null); resetCamera(); if (S.tab === 'journeys') renderJourneysPanel() }
$('#jc-next').onclick = () => S.journey && goStep(S.journey.step + 1)
$('#jc-prev').onclick = () => {
  const J = S.journey; if (!J) return
  const i = Math.max(0, J.step - 1), st = J.def.steps[i], e = E(st.to)
  particle.position.copy(st.follow && e.curve ? e.curve.getPointAt(st.reverse ? 1 : 0) : worldCenter(st.at || st.to)); trailHist.length = 0
  goStep(i)
}
$('#jc-play').onclick = () => {
  const J = S.journey; if (!J) return
  if (J.done) { startJourney(J.def.id); return }
  J.playing = !J.playing; J.waitUntil = 0
  $('#jc-play').innerHTML = `<i class="fas ${J.playing ? 'fa-pause' : 'fa-play'}"></i>`
}
$('#jc-voice').onclick = () => { const J = S.journey; if (!J) return; J.voice = !J.voice; $('#jc-voice').classList.toggle('off', !J.voice); if (!J.voice) speechSynthesis.cancel() }

// ═════════════ QUIZ ═════════════
async function startQuiz(system, n) {
  if (S.journey) endJourney()
  S.extracted = null; S.extractOffset = null; S.exploded.clear(); S.hidden.clear(); S.system = null; S.xray = false
  computeOffsets()
  const qs = await fetch(`/api/quiz?system=${system}&n=${n}`).then((r) => r.json())
  S.quiz = { active: true, system, qs, i: 0, score: 0, answers: [] }
  S.labels = false; updateLabelsSet()
  showQuestion()
}
function showQuestion() {
  const Q = S.quiz, q = Q.qs[Q.i]
  S.selected = null
  if (q.type === 'identify') {
    const ids = new Set([...descendants(q.target), ...ancestors(q.target)])
    S.focusSet = ids; S.selected = q.target
    focusOn(q.target, 3.2)
  } else { S.focusSet = null; resetCamera() }
  applyVisibility(); renderToolbar()
  const card = $('#quiz-card'); card.hidden = false
  card.innerHTML = `
    <div class="qz-bar"><div style="width:${(Q.i / Q.qs.length) * 100}%"></div></div>
    <div class="qz-top"><span><i class="fas fa-graduation-cap"></i> Question ${Q.i + 1} of ${Q.qs.length}</span><span>Score: <b class="text-white">${Q.score}</b></span></div>
    <div class="qz-prompt">${q.type === 'identify' ? '<i class="fas fa-crosshairs text-cyan-300"></i> ' : ''}${esc(q.prompt)}</div>
    <div class="qz-opts">${q.options.map((o) => `<button class="qz-opt" data-id="${o.id}">${esc(o.name)}</button>`).join('')}</div>
    <div class="qz-explain" hidden></div>
    <div class="qz-foot"><button class="btn" id="qz-quit">Quit</button><button class="btn primary" id="qz-next" hidden>Next <i class="fas fa-arrow-right"></i></button></div>`
  card.querySelectorAll('.qz-opt').forEach((b) => (b.onclick = () => answer(b.dataset.id)))
  $('#qz-quit').onclick = () => endQuiz(true)
  $('#qz-next').onclick = () => { Q.i++; Q.i < Q.qs.length ? showQuestion() : finishQuiz() }
}
function answer(id) {
  const Q = S.quiz, q = Q.qs[Q.i], ok = id === q.target
  if (ok) Q.score++
  Q.answers.push({ target: q.target, chosen: id, ok })
  $$('#quiz-card .qz-opt').forEach((b) => { b.disabled = true; if (b.dataset.id === q.target) b.classList.add('right'); else if (b.dataset.id === id) b.classList.add('wrong') })
  const ex = $('#quiz-card .qz-explain'); ex.hidden = false
  ex.innerHTML = `${ok ? '<b class="text-emerald-400"><i class="fas fa-circle-check"></i> Correct!</b>' : '<b class="text-rose-400"><i class="fas fa-circle-xmark"></i> Not quite.</b>'} ${esc(q.explain)}`
  $('#qz-next').hidden = false
  $('#qz-next').innerHTML = Q.i + 1 < Q.qs.length ? 'Next <i class="fas fa-arrow-right"></i>' : 'See results <i class="fas fa-flag-checkered"></i>'
  // reveal answer on model
  const ids = new Set([...descendants(q.target), ...ancestors(q.target)])
  S.focusSet = ids; S.selected = q.target; applyVisibility(); focusOn(q.target, 3.2)
  markViewed(q.target)
}
function finishQuiz() {
  const Q = S.quiz
  P.quizzes.push({ date: Date.now(), system: Q.system, score: Q.score, total: Q.qs.length }); saveP(); checkAchievements()
  const pct = Math.round((Q.score / Q.qs.length) * 100)
  const msg = pct === 100 ? 'Perfect score! 🏆' : pct >= 75 ? 'Great work! 🎉' : pct >= 50 ? 'Good effort – keep exploring! 💪' : 'Keep practising – you\'ll get there! 📚'
  const missed = Q.answers.filter((a) => !a.ok)
  $('#quiz-card').innerHTML = `
    <div class="text-center py-2">
      <div class="text-5xl font-extrabold text-white">${pct}%</div>
      <div class="mt-1 text-slate-300">${Q.score} / ${Q.qs.length} correct · ${msg}</div>
    </div>
    ${missed.length ? `<div class="mt-3 text-xs uppercase tracking-wider text-slate-400 font-bold">Review these</div><div class="chip-list mt-2">${missed.map((a) => `<span class="chip" data-id="${a.target}">${esc(displayName(a.target))}</span>`).join('')}</div>` : ''}
    <div class="qz-foot"><button class="btn" id="qz-done">Close</button><button class="btn primary" id="qz-again"><i class="fas fa-rotate-right"></i> Try again</button></div>`
  $$('#quiz-card .chip').forEach((c) => (c.onclick = () => { const id = c.dataset.id; endQuiz(true); select(id, { reveal: true }) }))
  $('#qz-done').onclick = () => endQuiz(true)
  $('#qz-again').onclick = () => startQuiz(Q.system, Q.qs.length)
  S.focusSet = null; S.selected = null; applyVisibility()
  if (S.tab === 'quiz') renderQuizPanel()
}
function endQuiz(silent) {
  S.quiz = null; S.focusSet = null; S.selected = null
  $('#quiz-card').hidden = true
  applyVisibility(); renderToolbar(); resetCamera()
  if (S.tab === 'quiz') renderQuizPanel()
}

// ═════════════ UI: SYSTEMS / LAYERS / TREE ═════════════
function renderSystems() {
  $('#systems-list').innerHTML = S.data.systems.map((s) => {
    const all = S.data.structures.filter((x) => x.system === s.id), seen = all.filter((x) => P.viewed.includes(x.id)).length
    return `<li class="sys-item ${S.system === s.id ? 'active' : ''}" data-sys="${s.id}">
      <span class="dot" style="background:${s.color}22;color:${s.color}"><i class="fas ${s.icon}"></i></span>${esc(s.name)}
      <span class="prog">${seen}/${all.length}</span></li>`
  }).join('')
  $$('#systems-list .sys-item').forEach((li) => (li.onclick = () => setSystem(li.dataset.sys)))
}
function setSystem(sys) {
  if (S.journey) endJourney()
  if (S.quiz?.active) endQuiz(true)
  S.system = S.system === sys ? null : sys
  S.extracted = null; S.extractOffset = null; S.exploded.clear()
  if (S.system && !S.layers[S.data.structures.find((x) => x.system === sys)?.layer]?.on) Object.values(S.layers).forEach((l) => (l.on = true))
  computeOffsets()
  S.selected = null
  applyVisibility(); renderSystems(); renderTree(); renderToolbar(); renderBreadcrumb()
  setTab('explore', true); renderInfo()
  if (S.system) focusBox(S.data.structures.filter((x) => x.system === sys && !x.parent).map((x) => x.id)); else resetCamera()
}
const LAYER_NAMES = { skin: 'Skin', muscle: 'Muscles', bone: 'Bones', organ: 'Organs', vessel: 'Vessels & Nerves' }
function renderLayers() {
  $('#layers-list').innerHTML = Object.entries(S.layers).map(([k, L]) => `
    <div class="layer-row"><button class="eye ${L.on ? '' : 'off'}" data-layer="${k}" title="Show/hide"><i class="fas ${L.on ? 'fa-eye' : 'fa-eye-slash'}"></i></button>
    <label>${LAYER_NAMES[k]}</label><input type="range" min="0" max="1" step="0.05" value="${L.op}" data-layer="${k}" title="${k === 'skin' ? 'Solid skin opacity' : 'Opacity'}" /></div>`).join('')
  $$('#layers-list .eye').forEach((b) => (b.onclick = () => { const L = S.layers[b.dataset.layer]; L.on = !L.on; renderLayers(); applyVisibility() }))
  $$('#layers-list input').forEach((r) => (r.oninput = () => { S.layers[r.dataset.layer].op = parseFloat(r.value); S.layers[r.dataset.layer].on = true; applyVisibility(); const b = r.parentElement.querySelector('.eye'); b.classList.remove('off'); b.innerHTML = '<i class="fas fa-eye"></i>' }))
}
function renderTree() {
  const list = S.data.structures.filter((s) => (!S.system || s.system === S.system))
  const tops = list.filter((s) => !s.parent)
  $('#struct-count').textContent = list.length
  const row = (s, child) => `<li class="${child ? 'child' : ''} ${S.selected === s.id ? 'sel' : ''}" data-id="${s.id}"><span class="sw" style="background:${sysColor(s.system)}"></span>${esc(s.name)}${P.viewed.includes(s.id) ? '<i class="fas fa-check done"></i>' : ''}</li>`
  $('#structure-tree').innerHTML = tops.map((s) => row(s) + list.filter((c) => c.parent === s.id).map((c) => row(c, true)).join('')).join('')
  $$('#structure-tree li').forEach((li) => (li.onclick = () => { if (S.journey) endJourney(); if (S.quiz?.active) endQuiz(true); select(li.dataset.id, { reveal: true }) }))
  const sel = $('#structure-tree li.sel'); sel?.scrollIntoView({ block: 'nearest' })
}
function renderBreadcrumb() {
  const b = $('#breadcrumb')
  if (S.journey) { b.innerHTML = `<i class="fas fa-route"></i> ${esc(S.journey.def.name)}`; return }
  if (S.quiz?.active) { b.innerHTML = `<i class="fas fa-graduation-cap"></i> Quiz mode`; return }
  const parts = [`<a data-bc="root"><i class="fas fa-person"></i> Full Body</a>`]
  if (S.system) parts.push(`<a data-bc="sys">${esc(S.sysById[S.system].name)}</a>`)
  if (S.selected) {
    ;[...ancestors(S.selected)].reverse().forEach((a) => parts.push(`<a data-bc="${a}">${esc(displayName(a))}</a>`))
    parts.push(`<b class="text-white">${esc(displayName(S.selected))}</b>`)
  }
  if (S.extracted) parts.push('<span class="text-cyan-300 text-xs ml-1">(extracted)</span>')
  b.innerHTML = parts.join(' <i class="fas fa-chevron-right text-[9px] opacity-40 mx-1"></i> ')
  b.querySelectorAll('a').forEach((a) => (a.onclick = () => {
    const k = a.dataset.bc
    if (k === 'root') resetAll()
    else if (k === 'sys') select(null)
    else select(k)
  }))
}

// ═════════════ UI: INFO PANEL ═════════════
function renderInfo() {
  if (S.tab !== 'explore') return
  if (S.selected) return renderInfoFor(S.selected)
  const el = $('#info-content')
  if (S.system) {
    const sy = S.sysById[S.system], list = S.data.structures.filter((s) => s.system === S.system && !s.parent)
    el.innerHTML = `<div class="info-hero"><span class="sys-chip" style="color:${sy.color}"><i class="fas ${sy.icon}"></i> Body system</span><h2>${esc(sy.name)} System</h2><p class="text-sm text-slate-300 leading-relaxed">${esc(sy.blurb)}</p></div>
      <div class="info-body"><div class="qa"><h4><i class="fas fa-hand-pointer"></i> Explore its parts</h4><div class="chip-list">${list.map((s) => `<span class="chip" data-id="${s.id}">${esc(s.name)}</span>`).join('')}</div></div>
      <div class="hint"><i class="fas fa-lightbulb"></i><span>Click a structure on the model or in the list. Other systems are shown as ghosts so you can still see where things are.</span></div></div>`
  } else {
    el.innerHTML = `<div class="welcome">
      <h2>Welcome to AnatoSphere 3D 👋</h2>
      <p>Explore the human body in 3D – no medical background needed. Pick a body system on the left or click anything on the model.</p>
      <div class="hint"><i class="fas fa-computer-mouse"></i><span><b>Drag</b> to rotate · <b>Scroll</b> to zoom · <b>Right-drag</b> to pan · <b>Double-click</b> to focus</span></div>
      <div class="hint"><i class="fas fa-up-right-from-square"></i><span>Select an organ, then <b>Extract</b> to pull it out of the body and <b>Explode</b> to separate its parts.</span></div>
      <div class="hint"><i class="fas fa-sliders"></i><span>Use <b>Layers</b> to peel back skin → muscles → bones → organs.</span></div>
      <div class="hint"><i class="fas fa-route"></i><span>Try an <b>Anatomy Journey</b> – follow food, blood, air or a nerve signal through the body.</span></div>
      <div class="hint"><i class="fas fa-robot"></i><span>Stuck? <b>Ask AI</b> – e.g. “Explain the pancreas like I'm 12”.</span></div>
      <div class="mt-5 text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Quick start</div>
      <div class="chip-list">${['heart', 'brain', 'lungs', 'kidneys', 'femur', 'stomach', 'cerebellum', 'liver'].map((id) => `<span class="chip" data-id="${id}">${esc(displayName(id))}</span>`).join('')}</div>
      <button class="btn primary w-full mt-5" id="w-journey"><i class="fas fa-burger"></i> Start the Food Journey</button>
    </div>`
    $('#w-journey').onclick = () => { setTab('journeys'); startJourney('food') }
  }
  el.querySelectorAll('.chip[data-id]').forEach((c) => (c.onclick = () => select(c.dataset.id, { reveal: true })))
}
function renderInfoFor(id, inJourney) {
  const e = E(id), d = e.data, sy = S.sysById[d.system], L = S.level === 'advanced' ? d.a : d.b
  const kids = e.children
  const tgt = explodeTarget(id)
  $('#info-content').innerHTML = `
    <div class="info-hero">
      <span class="sys-chip" style="color:${sy.color}"><i class="fas ${sy.icon}"></i> ${esc(sy.name)}${d.parent ? ` · part of ${esc(displayName(d.parent))}` : ''}</span>
      <h2>${esc(d.name)}</h2>
      <div class="pron"><button id="say-btn" title="Hear pronunciation"><i class="fas fa-volume-high"></i></button><span>/${esc(d.say || d.name)}/</span></div>
      ${inJourney ? '' : `<div class="info-actions">
        <button id="ia-focus"><i class="fas fa-crosshairs"></i> Focus</button>
        <button id="ia-extract"><i class="fas fa-up-right-from-square"></i> ${S.extracted && (S.extracted === id || descendants(S.extracted).includes(id)) ? 'Return' : 'Extract'}</button>
        ${tgt ? `<button id="ia-explode"><i class="fas fa-burst"></i> ${S.exploded.has(tgt) ? 'Collapse' : 'Explode'}</button>` : ''}
        <button id="ia-ai" class="primary"><i class="fas fa-robot"></i> Ask AI</button>
      </div>`}
    </div>
    <div class="info-body">
      <div class="qa"><h4><i class="fas fa-circle-question"></i> What is it?</h4><p>${esc(L.what)}</p></div>
      <div class="qa"><h4><i class="fas fa-location-dot"></i> Where is it?</h4><p>${esc(L.where)}</p></div>
      <div class="qa"><h4><i class="fas fa-gears"></i> What does it do?</h4><p>${esc(L.does)}</p></div>
      ${kids.length ? `<div class="qa"><h4><i class="fas fa-puzzle-piece"></i> Important parts</h4><div class="chip-list">${kids.map((k) => `<span class="chip" data-id="${k}">${esc(displayName(k))}</span>`).join('')}</div>${!inJourney && !S.exploded.has(id) ? '<p class="text-xs text-slate-400 mt-2">Tip: press <b>Explode</b> to separate these parts on the model.</p>' : ''}</div>` : ''}
      ${d.facts?.length ? `<div class="qa"><h4><i class="fas fa-star"></i> Interesting facts</h4>${d.facts.map((f) => `<div class="fact"><i class="fas fa-lightbulb"></i><span>${esc(f)}</span></div>`).join('')}</div>` : ''}
      ${d.rel?.length ? `<div class="qa"><h4><i class="fas fa-link"></i> Related structures</h4><div class="chip-list">${d.rel.filter((r) => E(r)).map((r) => `<span class="chip" data-id="${r}"><span style="color:${sysColor(E(r).system)}">●</span> ${esc(displayName(r))}</span>`).join('')}</div></div>` : ''}
      <p class="text-[11px] text-slate-500 mt-4"><i class="fas fa-circle-info"></i> Educational simplified model – not to scale and not for medical diagnosis.</p>
    </div>`
  $('#say-btn').onclick = () => speak(d.name.replace(/\(.*?\)/g, ''), 0.75)
  if (!inJourney) {
    $('#ia-focus').onclick = () => focusOn(id)
    $('#ia-extract').onclick = () => { doExtract(); renderInfoFor(id) }
    $('#ia-explode') && ($('#ia-explode').onclick = () => { doExplode(); renderInfoFor(id) })
    $('#ia-ai').onclick = () => openAI(`Explain the ${d.name.replace(/\(.*?\)/g, '').trim()} in simple terms`)
    $$('#info-content .chip[data-id]').forEach((c) => (c.onclick = () => {
      const t = c.dataset.id
      if (E(t).parent === id && !S.exploded.has(id) && !S.extracted) { /* keep context */ }
      select(t, { reveal: true })
    }))
  } else {
    $$('#info-content .chip[data-id]').forEach((c) => (c.style.pointerEvents = 'none'))
  }
}

// ═════════════ UI: TABS ═════════════
function setTab(tab, silent) {
  S.tab = tab
  $$('#mode-tabs .tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab))
  if (silent && tab === 'explore') return
  if (tab === 'explore') renderInfo()
  if (tab === 'journeys') renderJourneysPanel()
  if (tab === 'quiz') renderQuizPanel()
  if (tab === 'progress') renderProgressPanel()
}
$$('#mode-tabs .tab').forEach((b) => (b.onclick = () => setTab(b.dataset.tab)))

function renderJourneysPanel() {
  $('#info-content').innerHTML = `<div class="welcome"><h2><i class="fas fa-route text-cyan-300"></i> Anatomy Journeys</h2>
    <p>Watch a glowing particle travel through the body while each organ is explained step by step, with optional narration.</p><div class="mt-4">
    ${S.data.journeys.map((j) => `<div class="journey-tile" data-j="${j.id}"><div class="ic" style="background:${j.color}22;color:${j.color}"><i class="fas ${j.icon}"></i></div>
      <div><h3>${esc(j.name)}</h3><p>${esc(j.intro)}</p><p class="mt-1" style="color:${j.color}">${j.steps.length} steps</p></div>${P.journeys.includes(j.id) ? '<i class="fas fa-circle-check badge"></i>' : ''}</div>`).join('')}
    </div></div>`
  $$('.journey-tile').forEach((t) => (t.onclick = () => startJourney(t.dataset.j)))
}
function renderQuizPanel() {
  const hist = P.quizzes.slice(-6).reverse()
  $('#info-content').innerHTML = `<div class="welcome"><h2><i class="fas fa-graduation-cap text-cyan-300"></i> Quiz Mode</h2>
    <p>Test yourself: identify highlighted structures on the 3D model, match functions, and solve clues.</p>
    <label class="text-xs uppercase tracking-wider text-slate-400 font-bold block mt-4 mb-1">Topic</label>
    <select id="qz-sys" class="sel"><option value="all">All body systems</option>${S.data.systems.map((s) => `<option value="${s.id}" ${S.system === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>
    <label class="text-xs uppercase tracking-wider text-slate-400 font-bold block mt-3 mb-1">Questions</label>
    <select id="qz-n" class="sel"><option>5</option><option selected>8</option><option>12</option></select>
    <button class="btn primary w-full mt-4" id="qz-start"><i class="fas fa-play"></i> Start quiz</button>
    ${hist.length ? `<div class="text-xs uppercase tracking-wider text-slate-400 font-bold mt-6 mb-2">Recent scores</div>${hist.map((q) => `<div class="prow"><div class="top"><span>${esc(q.system === 'all' ? 'All systems' : S.sysById[q.system]?.name)}</span><span>${q.score}/${q.total}</span></div><div class="pbar"><div style="width:${(q.score / q.total) * 100}%;background:${q.score / q.total >= 0.75 ? '#34d399' : q.score / q.total >= 0.5 ? '#facc15' : '#f87171'}"></div></div></div>`).join('')}` : ''}
  </div>`
  $('#qz-start').onclick = () => startQuiz($('#qz-sys').value, parseInt($('#qz-n').value))
}
const ACH = [
  { id: 'first', icon: 'fa-eye', name: 'First Look', test: () => P.viewed.length >= 1 },
  { id: 'explorer', icon: 'fa-compass', name: 'Explorer', desc: '15 structures', test: () => P.viewed.length >= 15 },
  { id: 'anatomist', icon: 'fa-user-doctor', name: 'Anatomist', desc: 'All structures', test: () => S.data && P.viewed.length >= S.data.structures.length },
  { id: 'heart', icon: 'fa-heart', name: 'Heart Expert', test: () => S.reg && descendants('heart').every((x) => P.viewed.includes(x)) },
  { id: 'brain', icon: 'fa-brain', name: 'Brainiac', test: () => S.reg && descendants('brain').every((x) => P.viewed.includes(x)) },
  { id: 'journey', icon: 'fa-route', name: 'Traveller', test: () => P.journeys.length >= 1 },
  { id: 'globe', icon: 'fa-globe', name: 'Globetrotter', desc: 'All journeys', test: () => P.journeys.length >= 4 },
  { id: 'ace', icon: 'fa-trophy', name: 'Quiz Ace', desc: '100% quiz', test: () => P.quizzes.some((q) => q.score === q.total && q.total >= 5) },
  { id: 'curious', icon: 'fa-robot', name: 'Curious Mind', desc: 'Ask AI 3×', test: () => P.asked >= 3 },
]
let achSeen = new Set(JSON.parse(localStorage.getItem('as-ach') || '[]'))
function checkAchievements() {
  if (!S.data) return
  for (const a of ACH) if (!achSeen.has(a.id) && a.test()) { achSeen.add(a.id); toast(`<i class="fas fa-trophy text-yellow-400"></i> Achievement unlocked: <b>${a.name}</b>`, 3200) }
  localStorage.setItem('as-ach', JSON.stringify([...achSeen]))
}
function renderProgressPanel() {
  const total = S.data.structures.length, seen = P.viewed.filter((id) => E(id)).length
  const best = P.quizzes.length ? Math.max(...P.quizzes.map((q) => Math.round((q.score / q.total) * 100))) : 0
  const avg = P.quizzes.length ? Math.round(P.quizzes.reduce((a, q) => a + q.score / q.total, 0) / P.quizzes.length * 100) : 0
  $('#info-content').innerHTML = `<div class="welcome"><h2><i class="fas fa-chart-line text-cyan-300"></i> Your Progress</h2>
    <div class="stat-grid">
      <div class="stat"><b>${Math.round((seen / total) * 100)}%</b><span>Explored (${seen}/${total})</span></div>
      <div class="stat"><b>${P.journeys.length}/4</b><span>Journeys</span></div>
      <div class="stat"><b>${P.quizzes.length}</b><span>Quizzes taken</span></div>
      <div class="stat"><b>${best}%</b><span>Best score · avg ${avg}%</span></div>
    </div>
    <div class="text-xs uppercase tracking-wider text-slate-400 font-bold mt-4 mb-2">Systems</div>
    ${S.data.systems.map((s) => { const all = S.data.structures.filter((x) => x.system === s.id), n = all.filter((x) => P.viewed.includes(x.id)).length; return `<div class="prow"><div class="top"><span><i class="fas ${s.icon}" style="color:${s.color}"></i> ${esc(s.name)}</span><span class="text-slate-400">${n}/${all.length}</span></div><div class="pbar"><div style="width:${(n / all.length) * 100}%;background:${s.color}"></div></div></div>` }).join('')}
    <div class="text-xs uppercase tracking-wider text-slate-400 font-bold mt-5 mb-2">Achievements</div>
    <div class="badge-grid">${ACH.map((a) => `<div class="ach ${a.test() ? 'got' : ''}" title="${esc(a.desc || a.name)}"><i class="fas ${a.icon}"></i>${esc(a.name)}</div>`).join('')}</div>
    <button class="btn w-full mt-5 text-xs" id="reset-prog"><i class="fas fa-trash"></i> Reset progress</button>
  </div>`
  $('#reset-prog').onclick = () => { if (confirm('Reset all progress?')) { P.viewed = []; P.journeys = []; P.quizzes = []; P.asked = 0; saveP(); achSeen = new Set(); localStorage.removeItem('as-ach'); renderProgressPanel(); renderSystems(); renderTree() } }
}

// ═════════════ SEARCH ═════════════
let searchSel = 0, searchRes = []
const sInput = $('#search-input'), sList = $('#search-results')
let sTimer
sInput.addEventListener('input', () => {
  clearTimeout(sTimer)
  sTimer = setTimeout(async () => {
    const q = sInput.value.trim()
    if (!q) { sList.hidden = true; return }
    searchRes = (await fetch('/api/search?q=' + encodeURIComponent(q)).then((r) => r.json())).slice(0, 8)
    searchSel = 0; renderSearch()
  }, 120)
})
function renderSearch() {
  if (!searchRes.length) { sList.innerHTML = '<li><span class="text-slate-400">No matches</span></li>'; sList.hidden = false; return }
  sList.innerHTML = searchRes.map((r, i) => `<li class="${i === searchSel ? 'sel' : ''}" data-id="${r.id}"><span><span style="color:${sysColor(r.system)}">●</span> ${esc(r.name)}</span><small>${esc(S.sysById[r.system].name)}</small></li>`).join('')
  sList.hidden = false
  sList.querySelectorAll('li[data-id]').forEach((li) => (li.onmousedown = (e) => { e.preventDefault(); goSearch(li.dataset.id) }))
}
function goSearch(id) {
  sList.hidden = true; sInput.value = ''; sInput.blur()
  if (S.journey) endJourney(); if (S.quiz?.active) endQuiz(true)
  select(id, { reveal: true })
}
sInput.addEventListener('keydown', (e) => {
  if (sList.hidden || !searchRes.length) return
  if (e.key === 'ArrowDown') { searchSel = (searchSel + 1) % searchRes.length; renderSearch(); e.preventDefault() }
  if (e.key === 'ArrowUp') { searchSel = (searchSel - 1 + searchRes.length) % searchRes.length; renderSearch(); e.preventDefault() }
  if (e.key === 'Enter') goSearch(searchRes[searchSel].id)
  if (e.key === 'Escape') sList.hidden = true
})
sInput.addEventListener('blur', () => setTimeout(() => (sList.hidden = true), 150))
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return
  if (e.key === '/') { e.preventDefault(); sInput.focus() }
  if (e.key === 'Escape') { if (S.selected) select(null); }
  if (e.key.toLowerCase() === 'e' && S.selected) doExtract()
  if (e.key.toLowerCase() === 'x' && S.selected) doExplode()
  if (e.key.toLowerCase() === 'h' && S.selected) doHide()
  if (e.key.toLowerCase() === 'l') $('#tb-labels').click()
})

// ═════════════ LEVEL TOGGLE ═════════════
function renderLevel() { $$('#level-toggle button').forEach((b) => b.classList.toggle('active', b.dataset.level === S.level)) }
$$('#level-toggle button').forEach((b) => (b.onclick = () => {
  S.level = b.dataset.level; localStorage.setItem('as-level', S.level); renderLevel()
  if (S.journey && S.selected) renderInfoFor(S.selected, true); else if (S.tab === 'explore') renderInfo()
}))

// ═════════════ AI ASSISTANT ═════════════
function md(text) {
  const lines = esc(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>').split('\n')
  let html = '', inList = false
  for (let l of lines) {
    const li = l.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)/)
    if (li) { if (!inList) { html += '<ul>'; inList = true } html += `<li>${li[1]}</li>`; continue }
    if (inList) { html += '</ul>'; inList = false }
    l = l.replace(/^#{1,4}\s*(.*)/, '<strong>$1</strong>')
    if (l.trim()) html += `<p>${l}</p>`
  }
  return html + (inList ? '</ul>' : '')
}
function addMsg(role, html) { const d = document.createElement('div'); d.className = 'msg ' + role; d.innerHTML = html; $('#ai-messages').appendChild(d); $('#ai-messages').scrollTop = 1e6; return d }
function updateAISuggest() {
  const n = S.selected ? displayName(S.selected).replace(/\s*\(.*\)/, '') : null
  const sug = n ? [`Explain the ${n} like I'm 12`, `What happens if the ${n} stops working?`, `Give me a memory trick for the ${n}`] : ['Explain the pancreas like I\'m 12', 'How does blood flow through the heart?', 'What is the difference between arteries and veins?']
  $('#ai-suggest').innerHTML = sug.map((s) => `<button>${esc(s)}</button>`).join('')
  $$('#ai-suggest button').forEach((b) => (b.onclick = () => askAI(b.textContent)))
  $('#ai-context').textContent = n ? `Context: ${n}` : ''
}
function openAI(prefill) {
  $('#ai-drawer').classList.add('open')
  if (!$('#ai-messages').children.length) addMsg('bot', md("Hi! I'm **Ana**, your anatomy tutor. Ask me anything about the human body – I'll keep it simple. 😊"))
  updateAISuggest()
  if (prefill) askAI(prefill); else $('#ai-input').focus()
}
async function askAI(q) {
  if (!q.trim()) return
  addMsg('user', esc(q))
  const typing = addMsg('bot typing', '<span></span><span></span><span></span>')
  try {
    const r = await fetch('/api/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q, context: S.selected, level: S.level, history: S.ai.history }) }).then((r) => r.json())
    typing.remove()
    const m = addMsg('bot', md(r.answer || r.error || 'No answer'))
    if (r.offline) m.insertAdjacentHTML('beforeend', '<p class="text-[10px] opacity-50 mt-1">offline knowledge-base answer</p>')
    if (r.refs?.length) {
      const chips = r.refs.filter((id) => E(id)).slice(0, 3).map((id) => `<span class="chip" data-id="${id}"><i class="fas fa-cube"></i> Show ${esc(displayName(id))}</span>`).join('')
      m.insertAdjacentHTML('beforeend', `<div class="chip-list mt-2">${chips}</div>`)
      m.querySelectorAll('.chip').forEach((c) => (c.onclick = () => { if (S.journey) endJourney(); if (S.quiz?.active) endQuiz(true); select(c.dataset.id, { reveal: true }) }))
    }
    S.ai.history.push({ role: 'user', content: q }, { role: 'assistant', content: r.answer || '' })
    S.ai.history = S.ai.history.slice(-8)
    P.asked++; saveP(); checkAchievements()
  } catch (e) { typing.remove(); addMsg('bot', 'Sorry – something went wrong. Please try again.') }
}
$('#ai-toggle').onclick = () => ($('#ai-drawer').classList.contains('open') ? $('#ai-drawer').classList.remove('open') : openAI())
$('#ai-close').onclick = () => $('#ai-drawer').classList.remove('open')
$('#ai-form').onsubmit = (e) => { e.preventDefault(); const v = $('#ai-input').value; $('#ai-input').value = ''; askAI(v) }

// ═════════════ RESIZE / LOOP ═════════════
function resize() {
  const w = viewerEl.clientWidth, h = viewerEl.clientHeight
  renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix()
}
new ResizeObserver(resize).observe(viewerEl)

let bodyRoot
const clock = new THREE.Clock()
function loop() {
  requestAnimationFrame(loop)
  const dt = Math.min(0.05, clock.getDelta()), t = clock.elapsedTime
  updateCamera(); controls.update()
  if (S.reg) { tickOffsets(); tickMaterials(t); tickLife(t); tickJourney(dt, t); tickLabels() }
  renderer.render(scene, camera)
}

// ═════════════ BOOT ═════════════
;(async function boot() {
  resize()
  S.data = await fetch('/api/anatomy').then((r) => r.json())
  S.sysById = Object.fromEntries(S.data.systems.map((s) => [s.id, s]))
  const { root, reg } = buildBody(S.data)
  bodyRoot = root; S.reg = reg
  scene.add(root)
  for (const e of reg.values()) for (const m of e.meshes) {
    m.userData.basePos = m.position.clone()
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox()
    m.userData.center = m.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(m.matrix)
    if (m.material.opacity !== undefined && !m.userData.holo) m.material.opacity = 0
  }
  renderSystems(); renderLayers(); renderTree(); renderLevel(); renderToolbar(); renderBreadcrumb(); renderInfo(); updateAISuggest()
  computeOffsets(); applyVisibility()
  resetCamera()
  loop()
  setTimeout(() => { $('#loading').style.opacity = 0; setTimeout(() => $('#loading').remove(), 500) }, 200)
  // deep link: #heart
  const h = location.hash.slice(1); if (h && E(h)) setTimeout(() => select(h, { reveal: true }), 600)
})()
