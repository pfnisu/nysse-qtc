const fs = require('fs')
const f = [
    'lang/fi.json',
    'lang/en.json'
]
fs.mkdirSync('build/lang', { recursive: true })
for (const p of f)
    fs.readFile(p, 'utf-8', (e, s) =>
        fs.writeFileSync('build/' + p, JSON.stringify(JSON.parse(s)))
    )
