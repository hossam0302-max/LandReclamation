import { build } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  rmSync,
  existsSync,
} from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const tempDir = join(root, '.local-build-temp')
const outDir = join(root, 'local')

if (existsSync(tempDir)) {
  rmSync(tempDir, { recursive: true, force: true })
}
mkdirSync(tempDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

await build({
  configFile: false,
  root,
  base: './',
  plugins: [react(), tailwindcss()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: tempDir,
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    minify: true,
    rollupOptions: {
      input: join(root, 'src', 'main.tsx'),
      output: {
        format: 'iife',
        name: 'ReclamationApp',
        entryFileNames: 'app.js',
        assetFileNames: 'app[extname]',
        inlineDynamicImports: true,
      },
    },
  },
})

const files = readdirSync(tempDir)
const jsFile = files.find((f) => f.endsWith('.js'))
const cssFile = files.find((f) => f.endsWith('.css'))

if (!jsFile) {
  throw new Error('تعذر العثور على ملف JavaScript بعد البناء')
}

const js = readFileSync(join(tempDir, jsFile), 'utf8').replace(
  /<\/script/gi,
  '<\\/script',
)
const css = (cssFile ? readFileSync(join(tempDir, cssFile), 'utf8') : '').replace(
  /<\/style/gi,
  '<\\/style',
)

const html = `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>نظام الاستصلاح الزراعي | وزارة البيئة والمياه والزراعة</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <style>
${css}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>
${js}
    </script>
  </body>
</html>
`

// الملف الرئيسي للنظام: يعمل بالنقر المزدوج بدون سيرفر
writeFileSync(join(root, 'index.html'), html, 'utf8')
writeFileSync(join(outDir, 'index.html'), html, 'utf8')

rmSync(tempDir, { recursive: true, force: true })

console.log('✓ تم إنشاء النسخة المحلية بنجاح:')
console.log('  - index.html  (الملف الرئيسي — افتحه بالنقر المزدوج)')
console.log('  - local/index.html')
