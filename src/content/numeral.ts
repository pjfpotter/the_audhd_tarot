const ROMAN: [number, string][] = [
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
]

/** A card's number as shown to readers: 0 for The Fool, Roman numerals for the rest. */
export function numeral(number: number): string {
  if (number === 0) return '0'
  let rest = number
  let out = ''
  for (const [value, letters] of ROMAN) {
    while (rest >= value) {
      out += letters
      rest -= value
    }
  }
  return out
}
