import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

const copyManifest = () => {
  return {
    name: 'copy-manifest',
    writeBundle: () => {
      mkdirSync('dist', { recursive: true })
      mkdirSync('dist/assets/icons', { recursive: true })

      const manifestFile = process.env.BROWSER === 'firefox' ? 'manifest.firefox.json' : 'manifest.chrome.json'

      copyFileSync(manifestFile, 'dist/manifest.json')

      const iconSizes = ['16', '48', '128']
      iconSizes.forEach(size => {
        copyFileSync(
          `assets/icons/qwacky-${size}.png`, 
          `dist/assets/icons/qwacky-${size}.png`
        )
      })

      copyFileSync('assets/icons/qwacky.png', 'dist/assets/icons/qwacky.png')

      const polyfillPath = 'node_modules/webextension-polyfill/dist/browser-polyfill.js';
      if (existsSync(polyfillPath)) {
        copyFileSync(polyfillPath, 'dist/browser-polyfill.js');
      }

      copyFileSync('CHANGELOG.md', 'dist/CHANGELOG.md')

    }
  }
}

export default defineConfig(({ mode }) => {
  process.env.BROWSER = mode === 'firefox' ? 'firefox' : 'chrome'
  
  return {
    plugins: [react(), copyManifest()],
    define: {
      'process.env.BROWSER': JSON.stringify(process.env.BROWSER)
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
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