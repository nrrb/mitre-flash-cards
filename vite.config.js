import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// strips data-testid attributes from compiled templates (release mode only)
const stripTestIds = (node) => {
  if (node.type === 1) {
    node.props = node.props.filter((p) => !(p.type === 6 ? p.name === 'data-testid' : p.arg?.content === 'data-testid'))
  }
}

export default defineConfig(({ mode }) => ({
  base: './', // relative so it works under github.io/<repo>/
  build: {
    rollupOptions: { output: { manualChunks: (id) => (id.endsWith('deck.json') ? 'deck' : undefined) } }
  },
  plugins: [
    vue({
      template: {
        compilerOptions: { nodeTransforms: mode === 'release' ? [stripTestIds] : [] }
      }
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      workbox: { globPatterns: ['**/*.{js,css,html,woff2,svg,png}'] },
      manifest: {
        name: 'attck-cards',
        short_name: 'attck-cards',
        description: 'Learn MITRE ATT&CK by recognizing techniques in Windows telemetry',
        theme_color: '#14111f',
        background_color: '#14111f',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
}))
