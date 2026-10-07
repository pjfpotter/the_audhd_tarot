import { useEffect, useId, useRef } from 'react'
import styles from './OptionsPanel.module.css'
import { type MotionChoice, TEXT_SCALES, type TextScale, type ThemeChoice } from './preferences'
import { preferences, usePreferences } from './usePreferences'

const themes: [ThemeChoice, string][] = [
  ['system', 'Match my device'],
  ['light', 'Light'],
  ['dark', 'Dark'],
]

const motions: [MotionChoice, string][] = [
  ['system', 'Match my device'],
  ['reduced', 'Reduced'],
]

const textSizeNames = ['Default', 'Large', 'Larger', 'Largest']
const textSizes: [TextScale, string][] = TEXT_SCALES.map((scale, i) => [scale, textSizeNames[i]!])

interface ChoiceGroupProps<T> {
  legend: string
  hint?: string
  options: [T, string][]
  value: T
  onChange: (value: T) => void
}

function ChoiceGroup<T extends string | number>({ legend, hint, options, value, onChange }: ChoiceGroupProps<T>) {
  const name = useId()
  const hintId = useId()
  return (
    <fieldset className={styles.group} aria-describedby={hint ? hintId : undefined}>
      <legend className={styles.legend}>{legend}</legend>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {options.map(([option, label]) => (
        <label key={option} className={styles.choice}>
          <input
            type="radio"
            name={name}
            checked={option === value}
            onChange={() => onChange(option)}
          />
          {label}
        </label>
      ))}
    </fieldset>
  )
}

/**
 * Theme, motion and text size. A native modal dialog, so the browser keeps
 * focus inside it, closes it on Escape and returns focus to the control that
 * opened it. Every choice applies at once and is kept on the device.
 */
export function OptionsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const { theme, motion, textScale } = usePreferences()

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog ref={dialog} className={styles.panel} aria-labelledby="options-title" onClose={onClose}>
      <h2 id="options-title" className={styles.title}>
        Options
      </h2>
      <ChoiceGroup
        legend="Theme"
        options={themes}
        value={theme}
        onChange={(value) => preferences.set({ theme: value })}
      />
      <ChoiceGroup
        legend="Motion"
        hint="Reduced means nothing moves or zooms. Changes are instant or a short fade."
        options={motions}
        value={motion}
        onChange={(value) => preferences.set({ motion: value })}
      />
      <ChoiceGroup
        legend="Text size"
        options={textSizes}
        value={textScale}
        onChange={(value) => preferences.set({ textScale: value })}
      />
      <p className={styles.note}>Your choices are saved on this device only.</p>
      <button type="button" className={styles.close} onClick={() => dialog.current?.close()}>
        Close options
      </button>
    </dialog>
  )
}
