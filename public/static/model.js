// AnatoSphere 3D – procedural anatomical model.
// Every structure is a named THREE.Group (id = structure id) containing meshes.
// Child structures (e.g. heart chambers) are nested inside their parent group.
// To use real Blender GLB models later, load the GLB and map node names → ids
// with the same registry shape: { id, group, meshes, center, size, curve }.
import * as THREE from 'three'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'

const V = (x, y, z) => new THREE.Vector3(x, y, z)
const curve = (pts, closed = false) => new THREE.CatmullRomCurve3(pts.map((p) => V(...p)), closed, 'centripetal')

// ── geometry helpers ──
function sphereGeo(seg = 32, fn) {
  let g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75))
  if (fn) {
    g.deleteAttribute('normal'); g.deleteAttribute('uv')
    g = mergeVertices(g)
    const p = g.attributes.position, v = new THREE.Vector3()
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z)
    }
    g.computeVertexNormals()
  }
  return g
}
// organic bumpiness along the normal (unit-sphere space)
const bumps = (amp, f, extra) => (v) => {
  extra && extra(v)
  const n = v.clone().normalize()
  const d = amp * (Math.sin(v.x * f + 1.3) * Math.sin(v.y * f * 1.1 + 0.7) * Math.sin(v.z * f * 0.9 + 2.1))
  v.addScaledVector(n, d)
}
const gyri = (amp, f) => (v) => {
  const n = v.clone().normalize()
  const s = Math.sin(v.x * f + Math.sin(v.y * f * 0.7) * 2) * Math.cos(v.y * f * 1.2 + Math.sin(v.z * f) * 2) * Math.sin(v.z * f * 0.8 + 1)
  v.addScaledVector(n, -amp * Math.abs(s))
}

// tube with variable radius along a curve
function varTube(c, rFn, seg = 64, rad = 14) {
  const frames = c.computeFrenetFrames(seg, false)
  const pos = [], nor = [], idx = []
  const P = new THREE.Vector3(), n = new THREE.Vector3()
  for (let i = 0; i <= seg; i++) {
    const t = i / seg
    c.getPointAt(t, P)
    const N = frames.normals[i], B = frames.binormals[i], r = rFn(t)
    for (let j = 0; j <= rad; j++) {
      const a = (j / rad) * Math.PI * 2
      n.set(0, 0, 0).addScaledVector(N, -Math.cos(a)).addScaledVector(B, Math.sin(a)).normalize()
      pos.push(P.x + r * n.x, P.y + r * n.y, P.z + r * n.z); nor.push(n.x, n.y, n.z)
    }
  }
  for (let i = 0; i < seg; i++) for (let j = 0; j < rad; j++) {
    const a = i * (rad + 1) + j, b = (i + 1) * (rad + 1) + j
    idx.push(a, b, a + 1, b, b + 1, a + 1)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
  g.setIndex(idx)
  return g
}
const capped = (r0, r1 = r0, cap = 0.06) => (t) => {
  const base = r0 + (r1 - r0) * t
  const e = Math.min(t, 1 - t) / cap
  return e >= 1 ? base : base * Math.sqrt(Math.max(0.05, e * (2 - e)))
}

function between(geoFn, a, b) {
  const A = V(...a), B = V(...b), d = B.clone().sub(A), len = d.length()
  const m = new THREE.Mesh(geoFn(len))
  m.position.copy(A).add(B).multiplyScalar(0.5)
  m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize())
  return m
}

// ── skin hologram shader ──
function skinMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { color: { value: new THREE.Color('#7fd8ff') }, opacity: { value: 0.5 } },
    vertexShader: `varying vec3 vN; varying vec3 vV;
      void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 color; uniform float opacity; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.4); gl_FragColor = vec4(color*(f*1.3+0.05), (f*0.85+0.035)*opacity); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  })
}

export function buildBody(data) {
  const root = new THREE.Group()
  const reg = new Map()
  const byId = Object.fromEntries(data.structures.map((s) => [s.id, s]))

  function entry(id) {
    if (reg.has(id)) return reg.get(id)
    const d = byId[id]
    const g = new THREE.Group(); g.name = id
    const e = { id, data: d, group: g, meshes: [], parent: d?.parent || null, children: [], layer: d?.layer || 'organ', system: d?.system, defaultOp: 1, curve: null }
    if (e.parent) { const p = entry(e.parent); p.group.add(g); p.children.push(id) } else root.add(g)
    reg.set(id, e)
    return e
  }

  function add(id, mesh, color, o = {}) {
    const e = entry(id)
    if (!mesh.material || Array.isArray(mesh.material) || mesh.material.type === 'MeshBasicMaterial') {
      mesh.material = new THREE.MeshPhysicalMaterial({
        color, roughness: o.rough ?? (e.layer === 'bone' ? 0.7 : 0.45), metalness: 0,
        clearcoat: e.layer === 'organ' ? 0.55 : e.layer === 'vessel' ? 0.6 : 0.1, clearcoatRoughness: 0.35,
        side: o.side ?? THREE.FrontSide, transparent: false, opacity: 1,
        emissive: new THREE.Color(0x000000),
      })
    }
    mesh.userData.sid = id
    mesh.userData.baseColor = new THREE.Color(color)
    mesh.castShadow = false
    e.group.add(mesh); e.meshes.push(mesh)
    return mesh
  }
  const ell = (id, color, pos, scl, o = {}) => {
    const m = new THREE.Mesh(sphereGeo(o.seg || 32, o.fn))
    m.position.set(...pos); m.scale.set(...scl)
    if (o.rot) m.rotation.set(...o.rot)
    return add(id, m, color, o)
  }
  const tube = (id, color, pts, r, o = {}) => {
    const c = curve(pts)
    const m = new THREE.Mesh(varTube(c, typeof r === 'function' ? r : capped(r, o.r1 ?? r, o.cap ?? 0.04), o.seg || 64, o.rad || 12))
    add(id, m, color, { side: THREE.DoubleSide, ...o })
    const e = entry(id); if (!e.curve) e.curve = c
    return m
  }
  const cap = (id, color, a, b, r, o = {}) => add(id, between((l) => new THREE.CapsuleGeometry(r, l, 8, 18), a, b), color, o)
  const both = (fn) => { fn(1); fn(-1) } // +1 = body-left (+x), -1 = body-right (-x)

  // ═══════════ SKIN (special hologram + solid) ═══════════
  {
    const e = entry('skin')
    const holo = skinMaterial()
    const solid = new THREE.MeshStandardMaterial({ color: '#e2b08e', roughness: 0.65, transparent: true, opacity: 0 })
    const geos = []
    const push = (m) => geos.push(m)
    const h = new THREE.Mesh(sphereGeo(40)); h.position.set(0, 1.645, 0.005); h.scale.set(0.088, 0.112, 0.102); push(h)
    push(between((l) => new THREE.CapsuleGeometry(0.048, l, 8, 20), [0, 1.42, -0.005], [0, 1.53, -0.01]))
    const prof = [[0.001, 0.79], [0.13, 0.8], [0.165, 0.86], [0.16, 0.95], [0.138, 1.02], [0.133, 1.08], [0.148, 1.18], [0.163, 1.28], [0.172, 1.36], [0.15, 1.42], [0.07, 1.455], [0.001, 1.46]]
    const torso = new THREE.Mesh(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 48)); torso.scale.set(1, 1, 0.64); push(torso)
    both((s) => {
      push(between((l) => new THREE.CapsuleGeometry(0.045, l, 8, 18), [s * 0.185, 1.39, -0.005], [s * 0.245, 1.1, -0.005]))
      push(between((l) => new THREE.CapsuleGeometry(0.036, l, 8, 18), [s * 0.245, 1.1, -0.005], [s * 0.29, 0.845, 0.005]))
      const hd = new THREE.Mesh(sphereGeo(20)); hd.position.set(s * 0.302, 0.765, 0.008); hd.scale.set(0.022, 0.07, 0.04); hd.rotation.z = s * 0.1; push(hd)
      push(between((l) => new THREE.CapsuleGeometry(0.072, l, 8, 20), [s * 0.088, 0.85, 0], [s * 0.1, 0.5, 0.005]))
      push(between((l) => new THREE.CapsuleGeometry(0.052, l, 8, 20), [s * 0.1, 0.48, 0], [s * 0.1, 0.09, -0.01]))
      const ft = new THREE.Mesh(sphereGeo(20)); ft.position.set(s * 0.1, 0.03, 0.035); ft.scale.set(0.042, 0.03, 0.11); push(ft)
    })
    for (const m of geos) {
      const hm = m.clone(); hm.material = holo; hm.userData.sid = 'skin'; hm.userData.holo = true; hm.renderOrder = 10; e.group.add(hm); e.meshes.push(hm)
      const sm = m.clone(); sm.material = solid; sm.userData.sid = 'skin'; sm.userData.solid = true; sm.userData.baseColor = new THREE.Color('#e2b08e'); e.group.add(sm); e.meshes.push(sm)
    }
    e.holo = holo; e.solid = solid
  }

  // ═══════════ SKELETAL ═══════════
  const BONE = '#ece2c6'
  ell('skull', BONE, [0, 1.65, -0.005], [0.083, 0.1, 0.104], { fn: bumps(0.015, 6) })
  entry('skull').defaultOp = 0.28
  {
    const m = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.009, 10, 32, Math.PI))
    m.rotation.set(Math.PI / 2 + 0.25, 0, 0); m.position.set(0, 1.548, 0.035); m.scale.set(1, 1.25, 1)
    add('mandible', m, BONE)
    both((s) => cap('mandible', BONE, [s * 0.046, 1.548, 0.03], [s * 0.05, 1.6, 0.0], 0.008))
  }
  // spine
  for (let i = 0; i < 26; i++) {
    const t = i / 25, y = 0.89 + t * 0.63
    const z = -0.052 + 0.014 * Math.sin(t * Math.PI * 2.1 + 0.3)
    const r = 0.021 - t * 0.009
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.016, 16)); m.position.set(0, y, z)
    add('spine', m, BONE)
    const sp = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.008, 0.022)); sp.position.set(0, y, z - r - 0.02); sp.rotation.x = 0.4
    add('spine', sp, BONE)
  }
  // rib cage
  {
    const rx = [0.07, 0.095, 0.11, 0.12, 0.126, 0.13, 0.13, 0.127, 0.122, 0.115]
    rx.forEach((R, i) => {
      const y0 = 1.375 - i * 0.026, rz = R * 0.72
      const front = i < 7 ? Math.PI / 2 - 0.28 : Math.PI / 2 - 0.55 - (i - 7) * 0.25
      both((s) => {
        const pts = []
        for (let k = 0; k <= 16; k++) {
          const a = -Math.PI / 2 + 0.38 + (front + Math.PI / 2 - 0.38) * (k / 16)
          pts.push([s * R * Math.cos(a), y0 - 0.045 * (k / 16) ** 1.4, -0.012 + rz * Math.sin(a)])
        }
        tube('ribcage', BONE, pts, 0.0055, { seg: 40, rad: 8 })
        if (i < 7) {
          const last = pts[pts.length - 1]
          tube('ribcage', '#d8e4ea', [last, [s * 0.02, (last[1] + 1.27 - i * 0.012) / 2, 0.082], [s * 0.012, 1.31 - i * 0.022, 0.085]], 0.004, { seg: 10, rad: 6 })
        }
      })
    })
  }
  { const m = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.17, 0.011)); m.position.set(0, 1.26, 0.086); m.rotation.x = -0.15; add('sternum', m, BONE) }
  both((s) => {
    tube('clavicle', BONE, [[s * 0.018, 1.4, 0.075], [s * 0.09, 1.408, 0.07], [s * 0.18, 1.415, 0.005]], 0.0065)
    cap('humerus', BONE, [s * 0.195, 1.37, -0.005], [s * 0.243, 1.108, -0.005], 0.012)
    ell('humerus', BONE, [s * 0.19, 1.378, -0.005], [0.022, 0.022, 0.022])
    ell('humerus', BONE, [s * 0.244, 1.104, -0.005], [0.022, 0.012, 0.014])
    cap('radius_ulna', BONE, [s * 0.252, 1.095, 0.008], [s * 0.298, 0.85, 0.012], 0.0075)
    cap('radius_ulna', BONE, [s * 0.236, 1.095, -0.012], [s * 0.283, 0.85, -0.004], 0.0075)
    // pelvis wings
    ell('pelvis', BONE, [s * 0.088, 0.935, -0.01], [0.058, 0.052, 0.016], { rot: [0.1, s * 0.75, s * -0.25], fn: bumps(0.05, 5) })
    ell('pelvis', BONE, [s * 0.07, 0.855, 0.02], [0.03, 0.03, 0.02], { rot: [0, s * 0.4, 0] })
    // femur
    cap('femur', BONE, [s * 0.1, 0.835, 0], [s * 0.1, 0.515, 0.0], 0.0135)
    ell('femur', BONE, [s * 0.072, 0.862, 0.005], [0.02, 0.02, 0.02])
    cap('femur', BONE, [s * 0.075, 0.86, 0.005], [s * 0.102, 0.835, 0], 0.01)
    ell('femur', BONE, [s * 0.1, 0.505, -0.002], [0.026, 0.017, 0.022])
    ell('patella', BONE, [s * 0.1, 0.49, 0.03], [0.016, 0.019, 0.007])
    cap('tibia_fibula', BONE, [s * 0.097, 0.475, 0.004], [s * 0.095, 0.09, 0.006], 0.014)
    cap('tibia_fibula', BONE, [s * 0.122, 0.462, -0.012], [s * 0.12, 0.1, -0.01], 0.0065)
    ell('tibia_fibula', BONE, [s * 0.1, 0.03, 0.035], [0.03, 0.018, 0.09])
  })
  { const m = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 10, 40)); m.rotation.x = Math.PI / 2 - 0.6; m.position.set(0, 0.85, 0.0); m.scale.set(1.25, 1, 1); add('pelvis', m, BONE) }
  ell('pelvis', BONE, [0, 0.87, -0.05], [0.035, 0.048, 0.015], { rot: [-0.4, 0, 0] })

  // ═══════════ MUSCULAR ═══════════
  const MUS = '#c2463f'
  both((s) => {
    ell('pectoralis', MUS, [s * 0.072, 1.305, 0.07], [0.075, 0.055, 0.022], { rot: [0, s * 0.2, s * 0.25], fn: bumps(0.04, 7) })
    ell('deltoid', MUS, [s * 0.195, 1.36, -0.003], [0.048, 0.068, 0.052], { rot: [0, 0, s * 0.15] })
    cap('biceps', MUS, [s * 0.205, 1.31, 0.028], [s * 0.238, 1.14, 0.026], 0.026)
    cap('quadriceps', MUS, [s * 0.093, 0.8, 0.04], [s * 0.1, 0.53, 0.04], 0.052)
    cap('gastrocnemius', MUS, [s * 0.1, 0.42, -0.035], [s * 0.1, 0.25, -0.032], 0.037)
    for (let r = 0; r < 4; r++) ell('rectus_abdominis', MUS, [s * 0.034, 1.13 - r * 0.062, 0.072 + (r > 2 ? 0.005 : 0)], [0.03, 0.028, 0.011])
  })

  // ═══════════ NERVOUS ═══════════
  ell('frontal_lobe', '#f4a3a3', [0, 1.672, 0.032], [0.066, 0.054, 0.058], { fn: gyri(0.09, 9), seg: 48 })
  ell('parietal_lobe', '#f5cf7f', [0, 1.7, -0.028], [0.064, 0.042, 0.052], { fn: gyri(0.09, 9), seg: 48 })
  ell('occipital_lobe', '#9fb5f2', [0, 1.662, -0.068], [0.052, 0.042, 0.033], { fn: gyri(0.09, 9), seg: 40 })
  both((s) => ell('temporal_lobe', '#93d1a0', [s * 0.056, 1.628, 0.002], [0.024, 0.03, 0.05], { fn: gyri(0.08, 9), seg: 40 }))
  ell('cerebellum', '#d4a1e8', [0, 1.6, -0.058], [0.048, 0.024, 0.03], { fn: (v) => { v.addScaledVector(v.clone().normalize(), -0.06 * Math.abs(Math.sin(v.y * 28))) }, seg: 48 })
  cap('brainstem', '#efbf94', [0, 1.625, -0.02], [0, 1.54, -0.032], 0.011)
  entry('brain')
  const cordPts = []
  for (let i = 0; i <= 14; i++) { const t = 1 - i / 14, y = 0.89 + t * 0.63, r = 0.021 - t * 0.009; cordPts.push([0, Math.min(1.535, y + 0.01), -0.052 + 0.014 * Math.sin(t * Math.PI * 2.1 + 0.3) - r - 0.006]) }
  tube('spinal_cord', '#f3d36b', cordPts, 0.0065, { r1: 0.004 })
  both((s) => {
    tube('sciatic_nerve', '#f3d36b', [[s * 0.03, 0.9, -0.075], [s * 0.07, 0.83, -0.065], [s * 0.1, 0.66, -0.045], [s * 0.1, 0.48, -0.04], [s * 0.1, 0.26, -0.035], [s * 0.1, 0.12, -0.03]], 0.0045)
    tube('ulnar_nerve', '#f3d36b', [[s * 0.015, 1.4, -0.075], [s * 0.1, 1.41, -0.035], [s * 0.19, 1.33, -0.02], [s * 0.236, 1.105, -0.03], [s * 0.272, 0.95, -0.01], [s * 0.296, 0.8, 0.012], [s * 0.308, 0.74, 0.02]], 0.0035)
  })

  // ═══════════ CIRCULATORY ═══════════
  entry('heart')
  ell('right_atrium', '#4f6fd6', [-0.026, 1.248, 0.03], [0.029, 0.034, 0.031], { fn: bumps(0.03, 6) })
  ell('right_ventricle', '#3d5bd0', [-0.004, 1.196, 0.056], [0.041, 0.038, 0.026], { rot: [0, 0, 0.45], fn: bumps(0.03, 6) })
  ell('left_atrium', '#e04a5c', [0.03, 1.257, 0.004], [0.033, 0.027, 0.027], { fn: bumps(0.03, 6) })
  ell('left_ventricle', '#c4253a', [0.043, 1.188, 0.033], [0.034, 0.05, 0.034], { rot: [0.2, 0, 0.65], fn: (v) => { if (v.y < 0) { const k = 1 + v.y * 0.45; v.x *= k; v.z *= k } } })
  tube('aortic_arch', '#e0314b', [[0.004, 1.235, 0.036], [0.0, 1.3, 0.035], [0.012, 1.338, 0.008], [0.028, 1.322, -0.03], [0.026, 1.27, -0.045]], 0.011, { cap: 0.01 })
  tube('pulmonary_trunk', '#5b7be6', [[-0.002, 1.225, 0.064], [0.012, 1.272, 0.052], [0.04, 1.282, 0.02], [0.075, 1.272, -0.002]], 0.009, { cap: 0.02 })
  tube('pulmonary_trunk', '#5b7be6', [[0.012, 1.272, 0.052], [-0.02, 1.287, 0.03], [-0.06, 1.272, 0.002]], 0.0075, { cap: 0.02 })
  tube('superior_vena_cava', '#4361c2', [[-0.03, 1.255, 0.025], [-0.031, 1.3, 0.022], [-0.03, 1.36, 0.015]], 0.009, { cap: 0.02 })
  tube('aorta', '#e0314b', [[0.026, 1.27, -0.045], [0.022, 1.15, -0.042], [0.012, 1.0, -0.032], [0.0, 0.9, -0.022]], 0.0095, { cap: 0.01 })
  tube('vena_cava', '#4361c2', [[-0.02, 0.9, -0.012], [-0.025, 1.0, -0.028], [-0.03, 1.12, -0.012], [-0.028, 1.215, 0.022]], 0.0105, { cap: 0.01 })
  both((s) => {
    tube('carotid', '#e0314b', [[s * 0.008, 1.335, 0.012], [s * 0.022, 1.42, 0.015], [s * 0.03, 1.55, 0.0], [s * 0.032, 1.6, -0.005]], 0.0045)
    tube('femoral_artery', '#e0314b', [[0, 0.9, -0.022], [s * 0.05, 0.865, 0.0], [s * 0.08, 0.79, 0.035], [s * 0.093, 0.62, 0.025], [s * 0.1, 0.5, -0.02], [s * 0.1, 0.3, -0.012], [s * 0.1, 0.1, 0.0]], 0.0055)
  })

  // ═══════════ RESPIRATORY ═══════════
  tube('larynx', '#efb0be', [[0, 1.53, 0.026], [0, 1.495, 0.028]], (t) => 0.017 - 0.004 * t, { seg: 12, cap: 0.25 })
  tube('trachea', '#f4bdc8', [[0, 1.495, 0.024], [0, 1.42, 0.016], [0, 1.335, 0.002]], (t) => 0.0105 + (Math.sin(t * Math.PI * 2 * 14) > 0 ? 0.0016 : 0), { seg: 120, cap: 0.02 })
  entry('lungs')
  const lungFn = (side, notch) => (v) => {
    if (v.x * side < 0) v.x *= 0.5 // flatten medial face
    const ap = 0.55 + 0.45 * Math.min(1, (1 - v.y) / 1.2); v.x *= ap; v.z *= ap
    if (v.y < -0.6) v.y = -0.6 - (v.y + 0.6) * 0.4 // flatter base
    if (notch && v.z > 0.1 && v.y < 0.35 && v.x < 0.3) v.z *= 0.35
    const n = v.clone().normalize(); v.addScaledVector(n, 0.025 * Math.sin(v.x * 7) * Math.sin(v.y * 8) * Math.sin(v.z * 6))
  }
  ell('right_lung', '#f29bb0', [-0.078, 1.258, -0.005], [0.056, 0.115, 0.066], { fn: lungFn(1, false), seg: 48, rough: 0.6 })
  ell('left_lung', '#f4a7ba', [0.085, 1.258, -0.01], [0.05, 0.11, 0.064], { fn: lungFn(-1, true), seg: 48, rough: 0.6 })
  both((s) => {
    tube('bronchi', '#f7c9d4', [[0, 1.337, 0.002], [s * 0.03, 1.31, -0.002], [s * 0.06, 1.285, -0.006]], 0.0065, { cap: 0.02 })
    tube('bronchi', '#f7c9d4', [[s * 0.05, 1.293, -0.005], [s * 0.07, 1.31, 0.005], [s * 0.085, 1.33, 0.01]], 0.0035)
    tube('bronchi', '#f7c9d4', [[s * 0.06, 1.285, -0.006], [s * 0.075, 1.24, 0.0], [s * 0.085, 1.2, 0.005]], 0.0035)
    tube('bronchi', '#f7c9d4', [[s * 0.06, 1.285, -0.006], [s * 0.08, 1.26, -0.03], [s * 0.09, 1.21, -0.04]], 0.0032)
  })
  {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 16, 0, Math.PI * 2, 0, 1.15))
    m.position.set(0, 1.035, -0.012); m.scale.set(0.14, 0.085, 0.095)
    add('diaphragm', m, '#c95a6a', { side: THREE.DoubleSide })
  }

  // ═══════════ DIGESTIVE ═══════════
  tube('esophagus', '#e9a7a0', [[0, 1.5, 0.004], [0, 1.4, -0.012], [0.004, 1.25, -0.03], [0.018, 1.13, -0.012], [0.04, 1.083, 0.022]], 0.0075, { cap: 0.01 })
  tube('stomach', '#e8916a', [[0.04, 1.083, 0.024], [0.075, 1.085, 0.03], [0.095, 1.045, 0.04], [0.078, 0.995, 0.05], [0.035, 0.978, 0.052], [-0.012, 0.995, 0.047]],
    (t) => (0.012 + 0.024 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15)), 0.6)) * (t > 0.85 ? 1 - (t - 0.85) * 3.5 : 1) + 0.004, { seg: 80, rad: 18 })
  ell('liver', '#8e3b2e', [-0.058, 1.07, 0.022], [0.098, 0.045, 0.062], { rot: [0, 0, 0.12], fn: bumps(0.03, 4, (v) => { v.y *= 0.8 - 0.45 * v.x; if (v.y < 0) v.y *= 0.6 }), seg: 48 })
  ell('gallbladder', '#3f9a5a', [-0.05, 1.027, 0.068], [0.011, 0.021, 0.011], { rot: [0.6, 0, 0.2] })
  tube('pancreas', '#f2c26b', [[-0.022, 0.99, 0.008], [0.02, 1.003, -0.008], [0.06, 1.012, -0.02], [0.1, 1.03, -0.028]], (t) => 0.014 - t * 0.007 + 0.0015 * Math.sin(t * 40), { seg: 60, cap: 0.06 })
  {
    // coiled small intestine
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5)
    const pts = [[-0.012, 0.995, 0.047], [-0.03, 0.975, 0.05]]
    const rows = 7
    for (let r = 0; r < rows; r++) {
      const y = 0.955 - r * 0.018, dir = r % 2 ? -1 : 1
      for (let k = 0; k <= 5; k++) {
        const x = dir * (-0.065 + (k / 5) * 0.13)
        pts.push([x + rnd() * 0.012, y + rnd() * 0.012 + (k % 2 ? 0.007 : -0.007), 0.045 + (k % 2 ? 0.018 : -0.004) + rnd() * 0.01])
      }
    }
    pts.push([-0.07, 0.845, 0.048], [-0.082, 0.848, 0.042])
    tube('small_intestine', '#f0b47e', pts, 0.0092, { seg: 600, rad: 10, cap: 0.003 })
  }
  tube('large_intestine', '#d98657', [[-0.088, 0.83, 0.038], [-0.098, 0.9, 0.035], [-0.094, 0.975, 0.045], [-0.07, 0.99, 0.065], [0, 0.968, 0.078], [0.07, 0.985, 0.06], [0.1, 0.985, 0.035], [0.105, 0.9, 0.028], [0.09, 0.82, 0.03], [0.04, 0.8, 0.02], [0.005, 0.785, -0.02], [0, 0.73, -0.035]],
    (t) => (0.0145 + 0.0035 * Math.abs(Math.sin(t * Math.PI * 46))) * (t > 0.85 ? 0.8 : 1), { seg: 300, rad: 14, cap: 0.01 })
  tube('appendix', '#d98657', [[-0.088, 0.822, 0.038], [-0.083, 0.8, 0.05], [-0.072, 0.792, 0.058]], 0.0038)

  // ═══════════ URINARY / ENDOCRINE ═══════════
  both((s) => {
    const y = s > 0 ? 0.978 : 0.962
    ell('kidneys', '#a8423b', [s * 0.058, y, -0.058], [0.021, 0.039, 0.017], { rot: [0, s * 0.4, s * 0.15], fn: (v) => { if (v.x * -s > 0.4) v.x -= -s * 0.35 * (1 - Math.abs(v.y)) } })
    const ad = new THREE.Mesh(new THREE.ConeGeometry(0.013, 0.018, 16)); ad.position.set(s * 0.052, y + 0.045, -0.058); ad.rotation.z = s * 0.25
    add('adrenal_glands', ad, '#c084fc')
    tube('ureters', '#e8d34d', [[s * 0.045, y - 0.012, -0.05], [s * 0.042, 0.88, -0.035], [s * 0.035, 0.8, 0.0], [s * 0.012, 0.77, 0.03]], 0.0028)
    ell('thyroid', '#a78bfa', [s * 0.015, 1.47, 0.03], [0.009, 0.017, 0.008], { rot: [0, 0, s * -0.2] })
  })
  cap('thyroid', '#a78bfa', [-0.012, 1.462, 0.036], [0.012, 1.462, 0.036], 0.005)
  ell('bladder', '#e2c94a', [0, 0.77, 0.035], [0.028, 0.024, 0.025], { fn: (v) => { if (v.y > 0.3) v.y = 0.3 + (v.y - 0.3) * 0.5 } })
  ell('spleen', '#7e3b6e', [0.115, 1.05, -0.04], [0.019, 0.038, 0.028], { rot: [0, 0.3, -0.35], fn: bumps(0.04, 5) })

  // ── finalize: centers, sizes ──
  root.updateMatrixWorld(true)
  const box = new THREE.Box3()
  for (const e of reg.values()) {
    box.setFromObject(e.group)
    e.center = box.getCenter(new THREE.Vector3())
    e.size = box.getSize(new THREE.Vector3())
    for (const m of e.meshes) m.userData.baseScale = m.scale.clone()
  }
  return { root, reg }
}
