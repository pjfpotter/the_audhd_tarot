/**
 * The feel of the cloud, tuned by the author on a phone on 2026-10-07 with
 * the prototype's sliders. A value of 1 was the prototype's first guess for
 * each. Depth at 0.3 is a deliberate choice, not a legibility workaround.
 */
export const CLOUD_SETTINGS = {
  /** How far the cards and particles wander at rest. */
  drift: 0.3,
  /** How hard a beat throws the cards. */
  pulse: 1.75,
  /** How strongly a drag carries them. */
  stir: 1,
  /** How far the cards are spread towards and away from the viewer. */
  depth: 0.3,
  /** How quickly the cloud settles after being disturbed. */
  calm: 1.25,
  particles: 360,
  /** How far tilting the phone shifts the view. */
  tilt: 1.8,
} as const

export type CloudSettings = typeof CLOUD_SETTINGS

/** How long the drawn cards take to come forward before the table takes over. */
export const DRAW_SETTLE_MS = 900
