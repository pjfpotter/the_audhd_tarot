/**
 * The feel of the cloud. Drift, depth, calm and particles were tuned by the
 * author on a phone on 2026-10-07 with the prototype's sliders. Ripple and
 * stir were turned right down on 2026-11-03 because the first values threw
 * every card out of view, then back up a little the same day because the
 * result was too weak to shuffle with. They have been tried on a phone only
 * once, by the author.
 */
export const CLOUD_SETTINGS = {
  /** How far the cards and particles wander at rest. */
  drift: 0.3,
  /** How hard a tap disturbs the cards nearest to it. */
  ripple: 1,
  /** How strongly a drag carries the cards nearest to it. */
  stir: 1.3,
  /** How far the cards are spread towards and away from the viewer. */
  depth: 0.3,
  /** How quickly the cloud settles after being disturbed. */
  calm: 1.25,
  particles: 360,
} as const

export type CloudSettings = typeof CLOUD_SETTINGS
