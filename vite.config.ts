import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

const copyManifest = () => {
  return {
    name: 'copy-manifest',
    writeBundle: () => {
      const browser = process.env.BROWSER === 'firefox' ? 'firefox' : 'chrome'
      const outDir = browser === 'firefox' ? 'dist_firefox' : 'dist_chrome'

      mkdirSync(`${outDir}/assets/icons`, { recursive: true })

      const manifestFile = browser === 'firefox' ? 'manifest.firefox.json' : 'manifest.chrome.json'
      copyFileSync(manifestFile, `${outDir}/manifest.json`)

      const iconSizes = ['16', '48', '128']
      iconSizes.forEach(size => {
        copyFileSync(`assets/icons/qwacky-${size}.png`, `${outDir}/assets/icons/qwacky-${size}.png`)
      })

      copyFileSync('assets/icons/qwacky.png', `${outDir}/assets/icons/qwacky.png`)

      const polyfillPath = 'node_modules/webextension-polyfill/dist/browser-polyfill.js'
      if (existsSync(polyfillPath)) {
        copyFileSync(polyfillPath, `${outDir}/browser-polyfill.js`)
      }

      copyFileSync('CHANGELOG.md', `${outDir}/CHANGELOG.md`)
    }
  }
}

export default defineConfig(({ mode }) => {
  process.env.BROWSER = mode === 'firefox' ? 'firefox' : 'chrome'
  const outDir = process.env.BROWSER === 'firefox' ? 'dist_firefox' : 'dist_chrome'

  return {
    plugins: [react(), copyManifest()],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      'process.env.BROWSER': JSON.stringify(process.env.BROWSER)
    },
    build: {
      outDir,
      sourcemap: false,
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'index.html'),
          background: resolve(__dirname, 'src/background.ts'),
          contentScript: resolve(__dirname, 'src/contentScript.ts'),
          bypassExtensionRequirement: resolve(__dirname, 'src/bypassExtensionRequirement.ts'),
          ddgEmailAuth: resolve(__dirname, 'src/ddgEmailAuth.ts')
        },
        output: {
          format: 'esm',
          entryFileNames: chunk => {
            if (chunk.name === 'background' || chunk.name === 'contentScript' || chunk.name === 'bypassExtensionRequirement' || chunk.name === 'ddgEmailAuth') {
              return '[name].js'
            }
            return 'assets/[name].[hash].js'
          },
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]'
        }
      }
    },
    server: {
      port: 5173,
      strictPort: true,
      hmr: {
        port: 5173
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    }
  }
})