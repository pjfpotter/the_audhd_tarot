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
  Raycaster,
  SRGBColorSpace,
  Scene,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { keepInRoom, limitSpeed } from './motion'
import type { CloudSettings } from './settings'

/*
 * The cloud of cards, carried over from prototypes/ritual-cloud. Its drift is
 * choreography the author tuned by feel. What a touch does to it is new: it
 * disturbs only the cards near the finger, never moves a card out of the
 * space it is given, and in the second part of the shuffle a touch takes hold
 * of the one card under it.
 */

const CARD_W = 0.8
const CARD_H = CARD_W * (1354 / 720)
const CAM_Z = 9
/** How far forward a card sits when it is in the hand. */
const HAND_Z = 3
/** How far forward a card is held while it is being carried. */
const HELD_Z = 3.4
/** The fastest a card in the cloud may travel, in scene units a second. */
const MAX_SPEED = 4
/** How far above the fingertip a carried card is held, so that the finger does not cover it. */
const LIFT_PX = 44
/** How much larger than its place in the hand a carried card is. */
const HELD_SIZE = 1.12

export interface CloudTheme {
  /** The page colour, which the scene clears to and fades into. */
  background: string
  dark: boolean
}

/** A place in the hand, in screen pixels. */
export interface Slot {
  left: number
  top: number
  width: number
  height: number
}

export interface CloudOptions {
  canvas: HTMLCanvasElement
  /** The part of the screen left clear for the cloud; the cards gather around its middle. */
  stage: HTMLElement
  cardBack: string
  settings: CloudSettings
  theme: CloudTheme
  /**
   * The card numbers. Each card in the cloud is one of these for good, and the
   * order says where in the cloud it starts, so a shuffled list makes a cloud
   * that starts differently every time.
   */
  order: readonly number[]
  /** A fraction from 0 up to, but not including, 1. */
  random: () => number
  /** Where the places of the hand are on the screen now. Asked again whenever the layout may have changed. */
  slots: () => readonly Slot[]
  /** Called once, when the card back has loaded and the first frame is drawn. */
  onReady: () => void
  /** Called if the device stops being able to draw the scene. */
  onLost: () => void
}

export interface Cloud {
  /** A tap at a point on the screen: the cards nearest to it are nudged aside. */
  ripple(clientX: number, clientY: number): void
  /** A stir: the cards near the point are carried along by a movement of (dx, dy) pixels. */
  stir(clientX: number, clientY: number, dx: number, dy: number): void
  /** A stir made by an arrow key, in the middle of the cloud; each direction is -1, 0 or 1. */
  nudge(x: number, y: number): void
  /** Where a key press lands. */
  centre(): { x: number; y: number }
  /** Takes hold of the card under the point, and returns its number, or null if there is none. */
  grab(clientX: number, clientY: number): number | null
  /** Carries the held card to the point. */
  drag(clientX: number, clientY: number): void
  /** Lets go of the held card, which drifts back into the cloud unless it has been put in the hand. */
  drop(): void
  /** The number of the card nearest the middle that is not in the hand, or null if there is none. */
  nearestToMiddle(): number | null
  /** Puts these cards in the places of the hand, in order, and returns the rest to the cloud. */
  setHand(hand: readonly (number | null)[]): void
  setTheme(theme: CloudTheme): void
  dispose(): void
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
export function createCloud({
  canvas,
  stage,
  cardBack,
  settings,
  theme,
  order,
  random,
  slots,
  onReady,
  onLost,
}: CloudOptions): Cloud {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = SRGBColorSpace

  const scene = new Scene()
  const fog = new Fog(0x000000, 6, 21)
  scene.fog = fog
  const camera = new PerspectiveCamera(50, 1, 0.1, 100)
  camera.position.set(0, 0, CAM_Z)
  const look = new Vector3(0, 0, -2)
  camera.lookAt(look)
  camera.updateMatrixWorld(true)

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
    layoutSlots()
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

  const spread = () => random() * 2 - 1
  // The whole spiral is turned a random amount, so that no two clouds start alike.
  const turn = random() * Math.PI * 2

  const cards = order.map((number, i) => {
    const mesh = new Mesh(cardGeometry, cardMaterial)
    scene.add(mesh)
    const reach = Math.sqrt((i + 0.5) / order.length) * (1 + spread() * 0.1)
    return {
      /** Which card this is, for as long as the cloud lasts. */
      number,
      mesh,
      // Home, in a unit volume: a sunflower spiral across the screen, random in depth.
      unit: new Vector3(Math.cos(i * 2.39996 + turn) * reach, Math.sin(i * 2.39996 + turn) * reach, spread()),
      p: new Vector3(),
      v: new Vector3(),
      phase: [random() * 6.28, random() * 6.28, random() * 6.28] as const,
      rate: [0.11 + random() * 0.12, 0.09 + random() * 0.12, 0.07 + random() * 0.1] as const,
      lean: new Vector3(spread() * 0.45, spread() * 0.6, spread() * 0.3),
      spin: new Vector3(), // extra rotation from kicks, which unwinds
      w: new Vector3(),
      scale: 1,
      /** Which place of the hand the card is in, if it is in one. */
      slot: null as number | null,
      /** Whether a finger is carrying it. */
      held: false,
      /** How much of the squared-up pose of a card in the hand it still has, fading once it is back in the cloud. */
      squared: 0,
    }
  })
  type CloudCard = (typeof cards)[number]

  const home = new Vector3()
  function homeOf(card: CloudCard, time: number) {
    const drift = settings.drift
    home.set(
      card.unit.x * view.w * 0.4 + Math.sin(time * card.rate[0] + card.phase[0]) * 0.55 * drift,
      // The prototype's cloud filled about two fifths of the clear part of its screen, each way.
      card.unit.y * homeReach() + view.centreY + Math.cos(time * card.rate[1] + card.phase[1]) * 0.55 * drift,
      (card.unit.z * 4 - 2) * settings.depth + Math.sin(time * card.rate[2] + card.phase[2]) * 0.9 * drift,
    )
    return home
  }
  const homeReach = () => Math.max(view.stageH * 0.4, view.h * 0.16)

  /** The space the cloud's cards may move in, at the depth a card is at: the clear part of the screen. */
  function roomAt(z: number) {
    const f = (CAM_Z - z) / CAM_Z
    // A whole card, and a little over, stays on the screen at each side.
    const across = Math.min(view.w * 0.46, view.w / 2 - CARD_W * 0.7) * f
    const up = Math.max(view.stageH / 2 - CARD_H * 0.1, homeReach() * 1.15)
    return { halfWidth: across, top: (view.centreY + up) * f, bottom: (view.centreY - up) * f }
  }

  // ---------------------------------------------------------------- particles
  const count = settings.particles
  const pPos = new Float32Array(count * 3)
  const pVel = new Float32Array(count * 3)
  const pSeed = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pPos[i * 3] = spread() * 9
    pPos[i * 3 + 1] = spread() * 9
    pPos[i * 3 + 2] = spread() * 7 - 2
    pSeed[i] = random() * 6.28
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

  // ---------------------------------------------------------------- pointing
  const ray = { origin: new Vector3(), dir: new Vector3() }
  const tmp = new Vector3()
  const near = new Vector3()
  const push = new Vector3()
  const caster = new Raycaster()
  const ndc = new Vector2()

  function aim(clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect()
    tmp.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1, 0.5)
    tmp.unproject(camera)
    ray.origin.copy(camera.position)
    ray.dir.copy(tmp).sub(camera.position).normalize()
  }

  /** Where the line through a point on the screen crosses the plane at depth z. */
  function pointOnPlane(clientX: number, clientY: number, z: number, out: Vector3) {
    aim(clientX, clientY)
    return out.copy(ray.dir).multiplyScalar((z - ray.origin.z) / ray.dir.z).add(ray.origin)
  }

  /** How many screen pixels one scene unit is, at a depth. */
  function pixelsPerUnit(z: number) {
    return (canvas.clientHeight || window.innerHeight) / (2 * Math.tan((camera.fov * Math.PI) / 360) * (CAM_Z - z))
  }

  // The point on the pointer's ray closest to `p`, left in `near`.
  function nearestOnRay(p: Vector3) {
    const t = tmp.copy(p).sub(ray.origin).dot(ray.dir)
    return near.copy(ray.dir).multiplyScalar(t).add(ray.origin)
  }

  /** Cards in the cloud, which a finger may take hold of. */
  const free = (card: CloudCard) => card.slot === null && !card.held

  // ---------------------------------------------------------------- the hand
  const places: { pos: Vector3; scale: number }[] = []

  function layoutSlots() {
    const rects = slots()
    places.length = 0
    for (const rect of rects) {
      const pos = pointOnPlane(rect.left + rect.width / 2, rect.top + rect.height / 2, HAND_Z, new Vector3())
      const px = pixelsPerUnit(HAND_Z)
      const scale = Math.min((rect.height * 0.94) / px / CARD_H, (rect.width * 0.94) / px / CARD_W)
      places.push({ pos, scale: scale > 0 && Number.isFinite(scale) ? scale : 1 })
    }
  }

  const held = { x: 0, y: 0 }
  const heldPos = new Vector3()
  const heldTarget = { pos: heldPos, scale: 0.7 }

  /** Where a card is being drawn to, when it is not drifting: a finger, or its place in the hand. */
  function targetOf(card: CloudCard) {
    if (card.held) {
      pointOnPlane(held.x, held.y - LIFT_PX, HELD_Z, heldPos)
      heldTarget.scale = (places[0]?.scale ?? 0.7) * HELD_SIZE
      return heldTarget
    }
    if (card.slot !== null) return places[card.slot] ?? null
    return null
  }

  // ---------------------------------------------------------------- touch
  /** The farthest from a touch, in scene units, that a card feels it. */
  const FEEL = 1.1

  function ripple(clientX: number, clientY: number) {
    aim(clientX, clientY)
    const s = settings.ripple
    for (const card of cards) {
      if (!free(card)) continue
      nearestOnRay(card.p)
      push.copy(card.p).sub(near)
      const d = push.length()
      const fall = Math.exp(-(d * d) / FEEL)
      if (d < 0.001) push.set(random() - 0.5, random() - 0.5, random() - 0.5)
      push.normalize().multiplyScalar(2.6 * s * fall)
      push.z += (random() - 0.5) * 1.5 * s * fall
      card.v.add(push)
      card.w.x += (random() - 0.5) * 4 * s * fall
      card.w.y += (random() - 0.5) * 5 * s * fall
      card.w.z += (random() - 0.5) * 2 * s * fall
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
      const kick = (7 * s * Math.exp(-(d * d) / 6)) / d
      pVel[j] = pVel[j]! + dx * kick
      pVel[j + 1] = pVel[j + 1]! + dy * kick
      pVel[j + 2] = pVel[j + 2]! + dz * kick
    }
  }

  function stir(clientX: number, clientY: number, movedX: number, movedY: number) {
    aim(clientX, clientY)
    // Pixels to scene units, and screen-down to scene-up. One quick flick counts for no more than a short one.
    const unit = (view.h / (canvas.clientHeight || 1)) * 0.05
    const cap = (pixels: number) => Math.max(-60, Math.min(60, pixels))
    carry(cap(movedX) * unit, -cap(movedY) * unit)
  }

  function carry(dx: number, dy: number) {
    const s = settings.stir
    for (const card of cards) {
      if (!free(card)) continue
      nearestOnRay(card.p)
      push.copy(card.p).sub(near)
      const d = push.length()
      const fall = Math.exp(-(d * d) / FEEL)
      card.v.x += dx * 22 * s * fall
      card.v.y += dy * 22 * s * fall
      // Winding: a sideways shove at right angles to the offset from the pointer.
      card.v.x += -push.y * (dx * dx + dy * dy) * 40 * s * fall
      card.v.y += push.x * (dx * dx + dy * dy) * 40 * s * fall
      card.w.y += dx * 16 * s * fall
      card.w.x += -dy * 16 * s * fall
    }
    for (let i = 0; i < count; i++) {
      const j = i * 3
      const px = pPos[j]!
      const py = pPos[j + 1]!
      nearestOnRay(tmp.set(px, py, pPos[j + 2]!))
      const d2 = (px - near.x) ** 2 + (py - near.y) ** 2
      const fall = Math.exp(-d2 / 5)
      pVel[j] = pVel[j]! + dx * 30 * s * fall
      pVel[j + 1] = pVel[j + 1]! + dy * 30 * s * fall
    }
  }

  function centre() {
    const rect = stage.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.45 }
  }

  function grab(clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect()
    ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1)
    caster.setFromCamera(ndc, camera)
    const candidates = cards.filter(free)
    const [hit] = caster.intersectObjects(
      candidates.map((card) => card.mesh),
      false,
    )
    const card = candidates.find((candidate) => candidate.mesh === hit?.object)
    if (!card) return null
    for (const other of cards) other.held = false
    card.held = true
    card.w.set(0, 0, 0)
    held.x = clientX
    held.y = clientY
    return card.number
  }

  function nearestToMiddle() {
    const rect = canvas.getBoundingClientRect()
    const at = centre()
    let best: CloudCard | null = null
    let bestDistance = Infinity
    for (const card of cards) {
      if (!free(card)) continue
      tmp.copy(card.p).project(camera)
      const dx = rect.left + ((tmp.x + 1) / 2) * rect.width - at.x
      const dy = rect.top + ((1 - tmp.y) / 2) * rect.height - at.y
      // Of cards about as near the middle, the one in front.
      const distance = Math.hypot(dx, dy) - card.p.z * 6
      if (distance < bestDistance) {
        best = card
        bestDistance = distance
      }
    }
    return best?.number ?? null
  }

  // ---------------------------------------------------------------- frame
  let last = performance.now()
  let time = 0
  let frame = 0
  let announced = false

  function step(now: number) {
    frame = requestAnimationFrame(step)
    const dt = Math.min((now - last) / 1000, 1 / 30)
    last = now
    time += dt

    const spring = 1.3 * settings.calm
    const damping = Math.exp(-1.7 * settings.calm * dt)
    const unwind = Math.exp(-0.9 * settings.calm * dt)

    for (const card of cards) {
      let targetScale = 1
      const target = targetOf(card)
      if (target) {
        // Held by a finger, or in the hand: drawn to its target, squared up, and still there.
        targetScale = target.scale
        const grip = card.held ? 30 : 14
        card.v.add(tmp.copy(target.pos).sub(card.p).multiplyScalar(grip * dt))
        card.v.multiplyScalar(Math.exp(-(card.held ? 9 : 7) * dt))
        card.spin.multiplyScalar(Math.exp(-5 * dt))
        card.w.multiplyScalar(Math.exp(-6 * dt))
        card.mesh.rotation.x += (0 - card.mesh.rotation.x) * Math.min(1, dt * 7)
        card.mesh.rotation.y += (0 - card.mesh.rotation.y) * Math.min(1, dt * 7)
        card.mesh.rotation.z += (0 - card.mesh.rotation.z) * Math.min(1, dt * 7)
        card.squared = 1
      } else {
        homeOf(card, time)
        card.v.add(tmp.copy(home).sub(card.p).multiplyScalar(spring * dt))
        card.v.multiplyScalar(damping)
        limitSpeed(card.v, MAX_SPEED)
        card.spin.addScaledVector(card.w, dt)
        card.w.multiplyScalar(damping)
        card.spin.multiplyScalar(unwind)
        const wobble = settings.drift * 0.22
        // A card back from the hand turns to its drifting pose over a moment, not at once.
        card.squared *= Math.exp(-5 * dt)
        const keep = card.squared
        const rotation = card.mesh.rotation
        rotation.set(
          (card.lean.x + Math.sin(time * card.rate[1] * 2 + card.phase[0]) * wobble + card.spin.x) * (1 - keep) +
            rotation.x * keep,
          (card.lean.y + Math.sin(time * card.rate[0] * 2 + card.phase[1]) * wobble * 1.4 + card.spin.y) * (1 - keep) +
            rotation.y * keep,
          (card.lean.z + Math.sin(time * card.rate[2] * 2 + card.phase[2]) * wobble * 0.6 + card.spin.z) * (1 - keep) +
            rotation.z * keep,
        )
      }
      card.p.addScaledVector(card.v, dt)
      // Wherever a shove sends it, a card in the cloud stays in the space given to the cloud.
      if (!target) keepInRoom(card.p, card.v, roomAt(card.p.z))
      card.scale += (targetScale - card.scale) * Math.min(1, dt * 6)
      card.mesh.position.copy(card.p)
      card.mesh.scale.setScalar(card.scale)
    }

    // Particles drift on a slow current and are pushed around by taps and stirs.
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
    // Each card starts a little off its home, so that the cloud settles in rather than appearing.
    card.p.copy(homeOf(card, 0)).add(tmp.set(spread() * 0.5, spread() * 0.5, spread() * 0.4))
    card.mesh.position.copy(card.p)
    card.mesh.rotation.set(card.lean.x, card.lean.y, card.lean.z)
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  observer.observe(stage)
  window.addEventListener('scroll', layoutSlots, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  canvas.addEventListener('webglcontextlost', onContextLost)
  onVisibility()

  return {
    ripple,
    stir,
    nudge(x, y) {
      const at = centre()
      aim(at.x, at.y)
      carry(x * 0.12, y * 0.12)
    },
    centre,
    grab,
    drag(clientX, clientY) {
      held.x = clientX
      held.y = clientY
    },
    drop() {
      for (const card of cards) card.held = false
    },
    nearestToMiddle,
    setHand(hand) {
      for (const card of cards) {
        const place = hand.indexOf(card.number)
        card.slot = place >= 0 ? place : null
        if (card.slot !== null) card.held = false
      }
      layoutSlots()
    },
    setTheme,
    dispose() {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', layoutSlots)
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
