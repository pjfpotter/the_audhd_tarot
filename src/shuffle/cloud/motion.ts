/** Anything with a position in space, such as a three.js vector. */
export interface Vec {
  x: number
  y: number
  z: number
}

/** The room a card may move in: all the way across, and between a top and a bottom edge. */
export interface Room {
  halfWidth: number
  top: number
  bottom: number
}

/** Slows a velocity down to `max` if it is faster, without changing its direction. */
export function limitSpeed(v: Vec, max: number): void {
  const speed = Math.hypot(v.x, v.y, v.z)
  if (speed > max) {
    const scale = max / speed
    v.x *= scale
    v.y *= scale
    v.z *= scale
  }
}

/**
 * Keeps a position inside the room. A card that reaches an edge stops there
 * and loses the speed it was carrying outward, so a hard shove can never send
 * it out of sight.
 */
export function keepInRoom(p: Vec, v: Vec, room: Room): void {
  if (p.x > room.halfWidth) {
    p.x = room.halfWidth
    if (v.x > 0) v.x = 0
  } else if (p.x < -room.halfWidth) {
    p.x = -room.halfWidth
    if (v.x < 0) v.x = 0
  }
  if (p.y > room.top) {
    p.y = room.top
    if (v.y > 0) v.y = 0
  } else if (p.y < room.bottom) {
    p.y = room.bottom
    if (v.y < 0) v.y = 0
  }
}
