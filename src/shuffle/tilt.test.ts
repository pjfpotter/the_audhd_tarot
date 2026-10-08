import { describe, expect, test, vi } from 'vitest'
import { type OrientationSource, type Tilt, createSway, createTilt } from './tilt'

/** A stand-in for `window`: it records its listeners and lets a test send readings. */
function fakeSource() {
  const listeners = new Set<Parameters<OrientationSource['addEventListener']>[1]>()
  const source: OrientationSource = {
    addEventListener: (_type, listener) => void listeners.add(listener),
    removeEventListener: (_type, listener) => void listeners.delete(listener),
  }
  return {
    source,
    listening: () => listeners.size,
    send: (beta: number | null, gamma: number | null) => listeners.forEach((listener) => listener({ beta, gamma })),
  }
}

async function started(permission = {}) {
  const fake = fakeSource()
  const tilt = createTilt(fake.source, permission, true)
  const readings: Tilt[] = []
  const granted = await tilt.start((reading) => readings.push(reading))
  return { ...fake, tilt, readings, granted }
}

describe('availability', () => {
  test('needs the event, and a device held in the hand', () => {
    const { source } = fakeSource()
    expect(createTilt(source, {}, true).available).toBe(true)
    expect(createTilt(source, {}, false).available).toBe(false)
    expect(createTilt(source, undefined, true).available).toBe(false)
    expect(createTilt(undefined, {}, true).available).toBe(false)
  })

  test('knows when the device will ask the person first', () => {
    const { source } = fakeSource()
    expect(createTilt(source, {}, true).needsPermission).toBe(false)
    expect(createTilt(source, { requestPermission: async () => 'granted' }, true).needsPermission).toBe(true)
  })
})

describe('starting', () => {
  test('nothing is listened to until start', async () => {
    const fake = fakeSource()
    const tilt = createTilt(fake.source, {}, true)
    expect(fake.listening()).toBe(0)
    await tilt.start(() => {})
    expect(fake.listening()).toBe(1)
  })

  test('asks first where the device requires it, and listens once granted', async () => {
    const requestPermission = vi.fn(async () => 'granted')
    const { granted, listening } = await started({ requestPermission })
    expect(requestPermission).toHaveBeenCalledTimes(1)
    expect(granted).toBe(true)
    expect(listening()).toBe(1)
  })

  test('a refusal leaves nothing listening', async () => {
    const { granted, listening } = await started({ requestPermission: async () => 'denied' })
    expect(granted).toBe(false)
    expect(listening()).toBe(0)
  })

  test('a device that will not let the page ask leaves nothing listening and throws nothing', async () => {
    const { granted, listening } = await started({
      requestPermission: async () => {
        throw new Error('NotAllowedError')
      },
    })
    expect(granted).toBe(false)
    expect(listening()).toBe(0)
  })

  test('does nothing where there is no sensor to read', async () => {
    expect(await createTilt(undefined, undefined, true).start(() => {})).toBe(false)
  })
})

describe('readings', () => {
  test('the first reading is level, however the phone is held', async () => {
    const { send, readings } = await started()
    send(72, -14)
    expect(readings).toEqual([{ x: 0, y: 0 }])
  })

  test('later readings are measured from the first', async () => {
    const { send, readings } = await started()
    send(72, -14)
    send(72 + 7, -14 + 17.5)
    expect(readings[1]!.x).toBeCloseTo(0.5)
    expect(readings[1]!.y).toBeCloseTo(0.2)
  })

  test('a large tilt is held at the limit', async () => {
    const { send, readings } = await started()
    send(0, 0)
    send(-120, 90)
    expect(readings[1]).toEqual({ x: 1, y: -1 })
  })

  test('a reading with no angles is ignored', async () => {
    const { send, readings } = await started()
    send(null, null)
    send(10, 10)
    expect(readings).toEqual([{ x: 0, y: 0 }])
  })
})

describe('stopping', () => {
  test('ends the readings', async () => {
    const { tilt, send, readings, listening } = await started()
    send(0, 0)
    tilt.stop()
    send(20, 20)
    expect(listening()).toBe(0)
    expect(readings).toHaveLength(1)
  })

  test('starting again takes a new level', async () => {
    const { tilt, send } = await started()
    send(0, 0)
    const readings: Tilt[] = []
    await tilt.start((reading) => readings.push(reading))
    send(30, 30)
    expect(readings).toEqual([{ x: 0, y: 0 }])
  })
})

describe('sway', () => {
  test('a deliberate movement counts', () => {
    const sway = createSway()
    expect(sway({ x: 0.3, y: 0 }, 1000)).toBe(true)
  })

  test('sensor jitter does not', () => {
    const sway = createSway()
    for (let i = 0; i < 200; i++) {
      expect(sway({ x: Math.sin(i) * 0.02, y: Math.cos(i) * 0.02 }, i * 16)).toBe(false)
    }
  })

  test('a slow drift counts once it has gone far enough', () => {
    const sway = createSway()
    const counted = Array.from({ length: 100 }, (_, i) => sway({ x: i * 0.002, y: 0 }, i * 100))
    expect(counted.filter(Boolean).length).toBeGreaterThan(1)
    expect(counted.slice(0, 30)).not.toContain(true)
  })

  test('counts at most four times a second', () => {
    const sway = createSway()
    let counted = 0
    for (let i = 0; i < 60; i++) {
      if (sway({ x: i % 2 ? 0.5 : -0.5, y: 0 }, i * (1000 / 60))) counted++
    }
    expect(counted).toBeLessThanOrEqual(4)
    expect(counted).toBeGreaterThanOrEqual(3)
  })

  test('holding a tilt still is one sway, not many', () => {
    const sway = createSway()
    const counted = Array.from({ length: 50 }, (_, i) => sway({ x: 0.4, y: 0.1 }, i * 300))
    expect(counted.filter(Boolean)).toHaveLength(1)
  })
})
