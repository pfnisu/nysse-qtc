require('esbuild').build({
    entryPoints: ['app/index.js','res/index.css'],
    outdir: 'build/',
    bundle: true,
    minify: false,
    mangleProps: /^_/,
    target: 'es2017',
    define: { test: 'true' },
}).catch(() => process.exit(1))
