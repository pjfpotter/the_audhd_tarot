// One-off: pulls the card array out of the v1 prototype's bundled script and
// writes it, untouched, to content/v1-snapshot.json.
//
//   node scripts/extract-v1.mjs [prototype-url]
import { writeFile } from 'node:fs/promises'
import vm from 'node:vm'

const base = process.argv[2] ?? 'https://drop-a964c8a2-030.pjpotter.workers.dev/'
const out = new URL('../content/v1-snapshot.json', import.meta.url)

const html = await (await fetch(base)).text()
const src = html.match(/<script[^>]+src="([^"]+\.js)"/)?.[1]
if (!src) throw new Error('No script tag found in the prototype page')
const js = await (await fetch(new URL(src, base))).text()

const start = js.indexOf('[{n:0,name:')
if (start === -1) throw new Error('Card array not found in the prototype script')

// Walk to the matching closing bracket, skipping string contents.
let depth = 0
let quote = null
let end = -1
for (let i = start; i < js.length; i++) {
  const c = js[i]
  if (quote) {
    if (c === '\\') i++
    else if (c === quote) quote = null
  } else if (c === '"' || c === "'" || c === '`') quote = c
  else if (c === '[') depth++
  else if (c === ']' && --depth === 0) {
    end = i
    break
  }
}
if (end === -1) throw new Error('Card array is not terminated')

const cards = vm.runInNewContext(`(${js.slice(start, end + 1)})`, Object.create(null), { timeout: 1000 })
const unities = cards.reduce((n, c) => n + c.unities.length, 0)

await writeFile(out, JSON.stringify({ source: base, cards }, null, 2) + '\n')
console.log(`${cards.length} cards, ${unities} unities, The Fool has ${cards[0].unities.length}`)
