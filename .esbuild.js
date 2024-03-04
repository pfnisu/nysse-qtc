require('esbuild').build({
    entryPoints: ['app/index.js','res/index.css'],
    outdir: 'build/',
    bundle: true,
    minify: true,
    mangleProps: /^_/,
    target: 'es2017',
}).catch(() => process.exit(1))
