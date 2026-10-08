import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Fog,
  LinearSRGBColorSpace,
  Mesh,
  MeshBasicMaterial,
  NormalBlending,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  SRGBColorSpace,
  Scene,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from 'three'
import type { CloudSettings } from './settings'

/*
 * The cloud of cards, carried over from prototypes/ritual-cloud. Its motion
 * is choreography the author tuned by feel, so the numbers here are the
 * prototype's and should not be tidied.
 */

const CARD_COUNT = 22
const DRAWN = 3
const CARD_W = 0.8
const CARD_H = CARD_W * (1354 / 720)
const CAM_Z = 9

export interface CloudTheme {
  /** The page colour, which the scene clears to and fades into. */
  background: string
  dark: boolean
}

export interface CloudOptions {
  canvas: HTMLCanvasElement
  /** The part of the screen left clear for the cloud; the cards gather around its middle. */
  stage: HTMLElement
  cardBack: string
  settings: CloudSettings
  theme: CloudTheme
  /** Called once, when the card back has loaded and the first frame is drawn. */
  onReady: () => void
  /** Called if the device stops being able to draw the scene. */
  onLost: () => void
}

export interface Cloud {
  /** A beat at a point on the screen: everything near it is thrown outward and set spinning. */
  pulse(clientX: number, clientY: number): void
  /** A stir: whatever is near the point is carried along by a movement of (dx, dy) pixels. */
  stir(clientX: number, clientY: number, dx: number, dy: number): void
  /** A stir made by an arrow key, in the middle of the cloud; each direction is -1, 0 or 1. */
  nudge(x: number, y: number): void
  /** Where a beat made by key lands. */
  centre(): { x: number; y: number }
  /** A mouse standing in for tilt on a computer, each from -1 to 1. */
  hover(x: number, y: number): void
  /** The phone's tilt, each from -1 to 1, or null when it is not being followed. */
  setTilt(tilt: { x: number; y: number } | null): void
  /** Three cards come forward and settle in the three positions; the rest fall back. */
  draw(): void
  setTheme(theme: CloudTheme): void
  dispose(): void
}

/** A repeatable source of fractions (mulberry32), so the cloud starts the same for everyone. */
function seeded(seedA: number, seedB: number) {
  let a = seedA ^ Math.imul(seedB, 0x9e3779b1)
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A soft round dot for the particles. */
function dotTexture() {
  const dot = document.createElement('canvas')
  dot.width = dot.height = 64
  const g = dot.getContext('2d')!
  const glow = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  glow.addColorStop(0, 'rgba(255,255,255,1)')
  glow.addColorStop(0.35, 'rgba(255,255,255,0.35)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = glow
  g.fillRect(0, 0, 64, 64)
  return new CanvasTexture(dot)
}

/** Starts the cloud on a canvas. Throws if the device cannot draw it. */
export function createCloud({ canvas, stage, cardBack, settings, theme, onReady, onLost }: CloudOptions): Cloud {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = SRGBColorSpace

  const scene = new Scene()
  const fog = new Fog(0x000000, 6, 21)
  scene.fog = fog
  const camera = new PerspectiveCamera(50, 1, 0.1, 100)
  camera.position.set(0, 0, CAM_Z)

  // Visible size at z = 0, and where the middle of the stage falls within it.
  const view = { w: 1, h: 1, centreY: 0, stageH: 1 }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth
    const h = canvas.clientHeight || window.innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    view.h = 2 * Math.tan((camera.fov * Math.PI) / 360) * CAM_Z
    view.w = view.h * camera.aspect
    const frame = canvas.getBoundingClientRect()
    const clear = stage.getBoundingClientRect()
    const middle = (clear.top + clear.height / 2 - frame.top) / h
    view.centreY = (0.5 - middle) * view.h
    view.stageH = (clear.height / h) * view.h
  }

  // ---------------------------------------------------------------- cards
  let textureReady = false
  const backTexture = new TextureLoader().load(cardBack, () => {
    textureReady = true
  })
  backTexture.colorSpace = SRGBColorSpace
  backTexture.anisotropy = renderer.capabilities.getMaxAnisotropy()

  const cardGeometry = new PlaneGeometry(CARD_W, CARD_H)
  const cardMaterial = new MeshBasicMaterial({
    map: backTexture,
    side: DoubleSide,
    alphaTest: 0.5, // the art has rounded, transparent corners
  })

  const layout = seeded(22, 78)
  const spread = (r: () => number) => r() * 2 - 1

  const cards = Array.from({ length: CARD_COUNT }, (_, i) => {
    const mesh = new Mesh(cardGeometry, cardMaterial)
    scene.add(mesh)
    return {
      mesh,
      // Home, in a unit volume: an even sunflower spiral across the screen, random in depth.
      unit: new Vector3(
        Math.sqrt((i + 0.5) / CARD_COUNT) * Math.cos(i * 2.39996),
        Math.sqrt((i + 0.5) / CARD_COUNT) * Math.sin(i * 2.39996),
        spread(layout),
      ),
      p: new Vector3(),
      v: new Vector3(),
      phase: [layout() * 6.28, layout() * 6.28, layout() * 6.28] as const,
      rate: [0.11 + layout() * 0.12, 0.09 + layout() * 0.12, 0.07 + layout() * 0.1] as const,
      lean: new Vector3(spread(layout) * 0.45, spread(layout) * 0.6, spread(layout) * 0.3),
      spin: new Vector3(), // extra rotation from kicks, which unwinds
      w: new Vector3(),
      scale: 1,
    }
  })
  type CloudCard = (typeof cards)[number]

  const home = new Vector3()
  function homeOf(card: CloudCard, time: number) {
    const drift = settings.drift
    home.set(
      card.unit.x * view.w * 0.4 + Math.sin(time * card.rate[0] + card.phase[0]) * 0.55 * drift,
      // The prototype's cloud filled about two fifths of the clear part of its screen, each way.
      card.unit.y * Math.max(view.stageH * 0.4, view.h * 0.16) +
        view.centreY +
        Math.cos(time * card.rate[1] + card.phase[1]) * 0.55 * drift,
      (card.unit.z * 4 - 2) * settings.depth + Math.sin(time * card.rate[2] + card.phase[2]) * 0.9 * drift,
    )
    return home
  }

  // ---------------------------------------------------------------- particles
  const count = settings.particles
  const pPos = new Float32Array(count * 3)
  const pVel = new Float32Array(count * 3)
  const pSeed = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pPos[i * 3] = spread(layout) * 9
    pPos[i * 3 + 1] = spread(layout) * 9
    pPos[i * 3 + 2] = spread(layout) * 7 - 2
    pSeed[i] = layout() * 6.28
  }
  const particleGeometry = new BufferGeometry()
  const particlePositions = new BufferAttribute(pPos, 3)
  particleGeometry.setAttribute('position', particlePositions)
  const dot = dotTexture()
  const particleMaterial = new PointsMaterial({
    map: dot,
    size: 0.24,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  })
  scene.add(new Points(particleGeometry, particleMaterial))

  function setTheme(next: CloudTheme) {
    const background = new Color(next.background)
    renderer.setClearColor(background, 1)
    fog.color.copy(background)
    if (next.dark) {
      // Light added to the dark. The prototype's lavender, given as it was there, before colour management.
      particleMaterial.blending = AdditiveBlending
      particleMaterial.color.setHex(0xbfa6ff, LinearSRGBColorSpace)
      particleMaterial.opacity = 0.9
    } else {
      // Added light vanishes on a pale page, so the motes are ink there.
      particleMaterial.blending = NormalBlending
      particleMaterial.color.setHex(0x45209b, SRGBColorSpace)
      particleMaterial.opacity = 0.55
    }
    particleMaterial.needsUpdate = true
  }

  // ---------------------------------------------------------------- input
  const ray = { origin: new Vector3(), dir: new Vector3() }
  const tmp = new Vector3()
  const near = new Vector3()
  const push = new Vector3()

  function aim(clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect()
    tmp.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1, 0.5)
    tmp.unproject(camera)
    ray.origin.copy(camera.position)
    ray.dir.copy(tmp).sub(camera.position).normalize()
  }

  // The point on the pointer's ray closest to `p`, left in `near`.
  function nearestOnRay(p: Vector3) {
    const t = tmp.copy(p).sub(ray.origin).dot(ray.dir)
    return near.copy(ray.dir).multiplyScalar(t).add(ray.origin)
  }

  let drawn = false

  function pulse(clientX: number, clientY: number) {
    if (drawn) return
    aim(clientX, clientY)
    const s = settings.pulse
    for (const card of cards) {
      nearestOnRay(card.p)
      push.copy(card.p).sub(near)
      const d = push.length()
      const fall = Math.exp(-(d * d) / 9)
      if (d < 0.001) push.set(layout() - 0.5, layout() - 0.5, layout() - 0.5)
      push.normalize().multiplyScalar(5.5 * s * fall)
      push.z += (layout() - 0.5) * 5 * s * fall
      card.v.add(push)
      card.w.x += (layout() - 0.5) * 9 * s * fall
      card.w.y += (layout() - 0.5) * 12 * s * fall
      card.w.z += (layout() - 0.5) * 5 * s * fall
    }
    for (let i = 0; i < count; i++) {
      const j = i * 3
      const px = pPos[j]!
      const py = pPos[j + 1]!
      const pz = pPos[j + 2]!
      nearestOnRay(tmp.set(px, py, pz))
      const dx = px - near.x
      const dy = py - near.y
      const dz = pz - near.z
      const d = Math.hypot(dx, dy, dz) || 1
      const kick = (7 * s * Math.exp(-(d * d) / 14)) / d
      pVel[j] = pVel[j]! + dx * kick
      pVel[j + 1] = pVel[j + 1]! + dy * kick
      pVel[j + 2] = pVel[j + 2]! + dz * kick
    }
  }

  function stir(clientX: number, clientY: number, movedX: number, movedY: number) {
    if (drawn) return
    aim(clientX, clientY)
    // Pixels to scene units, and screen-down to scene-up.
    const unit = (view.h / (canvas.clientHeight || 1)) * 0.05
    carry(movedX * unit, -movedY * unit)
  }

  function carry(dx: number, dy: number) {
    const s = settings.stir
    for (const card of cards) {
      nearestOnRay(card.p)
      push.copy(card.p).sub(near)
      const d = push.length()
      const fall = Math.exp(-(d * d) / 5)
      card.v.x += dx * 26 * s * fall
      card.v.y += dy * 26 * s * fall
      // Winding: a sideways shove at right angles to the offset from the pointer.
      card.v.x += -push.y * (dx * dx + dy * dy) * 60 * s * fall
      card.v.y += push.x * (dx * dx + dy * dy) * 60 * s * fall
      card.w.y += dx * 22 * s * fall
      card.w.x += -dy * 22 * s * fall
    }
    for (let i = 0; i < count; i++) {
      const j = i * 3
      const px = pPos[j]!
      const py = pPos[j + 1]!
      nearestOnRay(tmp.set(px, py, pPos[j + 2]!))
      const d2 = (px - near.x) ** 2 + (py - near.y) ** 2
      const fall = Math.exp(-d2 / 8)
      pVel[j] = pVel[j]! + dx * 30 * s * fall
      pVel[j + 1] = pVel[j + 1]! + dy * 30 * s * fall
    }
  }

  function centre() {
    const rect = stage.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.45 }
  }

  // ---------------------------------------------------------------- tilt
  const tilt = { x: 0, y: 0, phone: null as { x: number; y: number } | null, hoverX: 0, hoverY: 0 }

  // ---------------------------------------------------------------- draw
  const slot = new Vector3()

  // Where the i-th drawn card comes to rest, and how large, for this screen.
  function slotFor(i: number) {
    const z = 3
    const h = 2 * Math.tan((camera.fov * Math.PI) / 360) * (CAM_Z - z)
    const w = h * camera.aspect
    const size = Math.min((w * 0.27) / CARD_W, (h * 0.5) / CARD_H)
    slot.set((i - 1) * Math.min(w * 0.31, CARD_W * size * 1.35), (view.centreY / view.h) * h, z)
    return size
  }

  // ---------------------------------------------------------------- frame
  let last = performance.now()
  let time = 0
  let frame = 0
  let announced = false
  const look = new Vector3(0, 0, -2)

  function step(now: number) {
    frame = requestAnimationFrame(step)
    const dt = Math.min((now - last) / 1000, 1 / 30)
    last = now
    time += dt

    // Tilt, or the mouse standing in for it on a computer, shifts the viewpoint.
    const targetX = tilt.phone ? tilt.phone.x : tilt.hoverX * 0.35
    const targetY = tilt.phone ? tilt.phone.y : tilt.hoverY * 0.35
    tilt.x += (targetX - tilt.x) * Math.min(1, dt * 5)
    tilt.y += (targetY - tilt.y) * Math.min(1, dt * 5)
    camera.position.set(tilt.x * 1.6 * settings.tilt, -tilt.y * 1.2 * settings.tilt, CAM_Z)
    camera.lookAt(look)

    const spring = 1.3 * settings.calm
    const damping = Math.exp(-1.7 * settings.calm * dt)
    const unwind = Math.exp(-0.9 * settings.calm * dt)

    cards.forEach((card, i) => {
      let targetScale = 1
      if (drawn && i < DRAWN) {
        // A drawn card comes forward, squares up and stops.
        targetScale = slotFor(i)
        card.v.add(tmp.copy(slot).sub(card.p).multiplyScalar(14 * dt))
        card.v.multiplyScalar(Math.exp(-7 * dt))
        card.spin.multiplyScalar(Math.exp(-5 * dt))
        card.w.multiplyScalar(Math.exp(-6 * dt))
        card.mesh.rotation.x += (0 - card.mesh.rotation.x) * Math.min(1, dt * 5)
        card.mesh.rotation.y += (0 - card.mesh.rotation.y) * Math.min(1, dt * 5)
        card.mesh.rotation.z += (0 - card.mesh.rotation.z) * Math.min(1, dt * 5)
      } else {
        homeOf(card, time)
        if (drawn) home.z -= 7 // the rest fall back into the dark
        // Tilt leans on the cloud a little, nearer cards more than far ones.
        home.x += tilt.x * 0.5 * settings.tilt * (card.unit.z + 1.5)
        home.y -= tilt.y * 0.4 * settings.tilt * (card.unit.z + 1.5)
        card.v.add(tmp.copy(home).sub(card.p).multiplyScalar(spring * dt))
        card.v.multiplyScalar(damping)
        card.spin.addScaledVector(card.w, dt)
        card.w.multiplyScalar(damping)
        card.spin.multiplyScalar(unwind)
        const wobble = settings.drift * 0.22
        card.mesh.rotation.set(
          card.lean.x + Math.sin(time * card.rate[1] * 2 + card.phase[0]) * wobble + card.spin.x,
          card.lean.y + Math.sin(time * card.rate[0] * 2 + card.phase[1]) * wobble * 1.4 + card.spin.y,
          card.lean.z + Math.sin(time * card.rate[2] * 2 + card.phase[2]) * wobble * 0.6 + card.spin.z,
        )
      }
      card.p.addScaledVector(card.v, dt)
      card.scale += (targetScale - card.scale) * Math.min(1, dt * 6)
      card.mesh.position.copy(card.p)
      card.mesh.scale.setScalar(card.scale)
    })

    // Particles drift on a slow current and are pushed around by beats and stirs.
    const fade = Math.exp(-1.4 * dt)
    const current = settings.drift * dt * 10
    for (let i = 0; i < count; i++) {
      const j = i * 3
      const s = pSeed[i]!
      let x = pPos[j]!
      let y = pPos[j + 1]!
      let z = pPos[j + 2]!
      const vx = pVel[j]! * fade + Math.sin(time * 0.21 + s + y * 0.4) * 0.06 * current
      const vy = pVel[j + 1]! * fade + (0.05 + Math.cos(time * 0.17 + s * 2) * 0.04) * current
      const vz = pVel[j + 2]! * fade + Math.sin(time * 0.13 + s * 3) * 0.04 * current
      x += vx * dt
      y += vy * dt
      z += vz * dt
      // Wrap, so the field never empties.
      if (x > 9) x -= 18
      else if (x < -9) x += 18
      if (y > 9) y -= 18
      else if (y < -9) y += 18
      if (z > 5) z -= 14
      else if (z < -9) z += 14
      pVel[j] = vx
      pVel[j + 1] = vy
      pVel[j + 2] = vz
      pPos[j] = x
      pPos[j + 1] = y
      pPos[j + 2] = z
    }
    particlePositions.needsUpdate = true

    renderer.render(scene, camera)

    if (!announced && textureReady) {
      announced = true
      onReady()
    }
  }

  // Nothing is drawn, and no battery spent, while the app is out of view.
  function onVisibility() {
    cancelAnimationFrame(frame)
    if (document.hidden) return
    last = performance.now()
    frame = requestAnimationFrame(step)
  }

  function onContextLost(event: Event) {
    event.preventDefault()
    cancelAnimationFrame(frame)
    onLost()
  }

  // ---------------------------------------------------------------- start
  setTheme(theme)
  resize()
  for (const card of cards) {
    card.p.copy(homeOf(card, 0))
    card.mesh.position.copy(card.p)
    card.mesh.rotation.set(card.lean.x, card.lean.y, card.lean.z)
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  observer.observe(stage)
  document.addEventListener('visibilitychange', onVisibility)
  canvas.addEventListener('webglcontextlost', onContextLost)
  onVisibility()

  return {
    pulse,
    stir,
    nudge(x, y) {
      if (drawn) return
      const at = centre()
      aim(at.x, at.y)
      carry(x * 0.12, y * 0.12)
    },
    centre,
    hover(x, y) {
      tilt.hoverX = x
      tilt.hoverY = y
    },
    setTilt(next) {
      tilt.phone = next
    },
    draw() {
      drawn = true
    },
    setTheme,
    dispose() {
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      cardGeometry.dispose()
      cardMaterial.dispose()
      backTexture.dispose()
      particleGeometry.dispose()
      particleMaterial.dispose()
      dot.dispose()
      renderer.dispose()
    },
  }
}
