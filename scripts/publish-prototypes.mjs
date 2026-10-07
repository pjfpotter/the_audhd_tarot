// Copies the standalone prototypes into the built site, so they can be opened
// on a phone over HTTPS. Runs at the end of `npm run build`.
//
// A prototype is written as page content only (the form the claude.ai Artifact
// tool publishes), so it is wrapped in a document here.
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'

const from = new URL('../prototypes/ritual-cloud/', import.meta.url)
const to = new URL('../dist/prototypes/ritual-cloud/', import.meta.url)

const content = await readFile(new URL('ritual-cloud.html', from), 'utf8')
const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex">
<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
${content}
</body>
</html>
`

await mkdir(to, { recursive: true })
await writeFile(new URL('index.html', to), page)
await copyFile(new URL('card-back.webp', from), new URL('card-back.webp', to))
console.log('Published prototype: /prototypes/ritual-cloud/')
