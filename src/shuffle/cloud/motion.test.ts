import { describe, expect, test } from 'vitest'
import { keepInRoom, limitSpeed } from './motion'

describe('limitSpeed', () => {
  test('leaves a slow velocity alone', () => {
    const v = { x: 1, y: -1, z: 0.5 }
    limitSpeed(v, 4)
    expect(v).toEqual({ x: 1, y: -1, z: 0.5 })
  })

  test('caps a fast velocity and keeps its direction', () => {
    const v = { x: 30, y: 40, z: 0 }
    limitSpeed(v, 5)
    expect(Math.hypot(v.x, v.y, v.z)).toBeCloseTo(5)
    expect(v.y / v.x).toBeCloseTo(4 / 3)
  })
})

describe('keepInRoom', () => {
  const room = { halfWidth: 2, top: 3, bottom: -1 }

  test('leaves a card inside the room alone', () => {
    const p = { x: 1, y: 0, z: 0 }
    const v = { x: 1, y: 1, z: 0 }
    keepInRoom(p, v, room)
    expect(p).toEqual({ x: 1, y: 0, z: 0 })
    expect(v).toEqual({ x: 1, y: 1, z: 0 })
  })

  test('stops a card at each edge and takes away its outward speed', () => {
    const p = { x: 9, y: 9, z: 0 }
    const v = { x: 5, y: 5, z: 1 }
    keepInRoom(p, v, room)
    expect(p).toEqual({ x: 2, y: 3, z: 0 })
    expect(v).toEqual({ x: 0, y: 0, z: 1 })

    const q = { x: -9, y: -9, z: 0 }
    const w = { x: -5, y: -5, z: 0 }
    keepInRoom(q, w, room)
    expect(q).toEqual({ x: -2, y: -1, z: 0 })
    expect(w).toEqual({ x: 0, y: 0, z: 0 })
  })

  test('lets a card at an edge move back in', () => {
    const p = { x: 9, y: 0, z: 0 }
    const v = { x: -3, y: 0, z: 0 }
    keepInRoom(p, v, room)
    expect(v.x).toBe(-3)
  })

  test('however hard it is thrown, a card never ends up outside', () => {
    const p = { x: 0, y: 1, z: 0 }
    const v = { x: 0, y: 0, z: 0 }
    for (let frame = 0; frame < 600; frame++) {
      v.x += Math.sin(frame) * 400
      v.y += Math.cos(frame * 1.3) * 400
      p.x += v.x / 60
      p.y += v.y / 60
      keepInRoom(p, v, room)
      expect(Math.abs(p.x)).toBeLessThanOrEqual(room.halfWidth)
      expect(p.y).toBeLessThanOrEqual(room.top)
      expect(p.y).toBeGreaterThanOrEqual(room.bottom)
    }
  })
})
