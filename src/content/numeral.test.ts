import { expect, test } from 'vitest'
import { numeral } from './numeral'

test('numbers cards as readers see them', () => {
  expect([0, 1, 4, 8, 9, 13, 14, 19, 21].map(numeral)).toEqual([
    '0', 'I', 'IV', 'VIII', 'IX', 'XIII', 'XIV', 'XIX', 'XXI',
  ])
})
