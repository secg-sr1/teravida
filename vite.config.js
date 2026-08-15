// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'
// import glsl from 'vite-plugin-glsl'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), glsl()],
//   server: {
//     proxy: {
//       '/api': 'http://localhost:5000', // or your backend server port
//     },
//   },
// })



import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import glsl from 'vite-plugin-glsl'

// DEV MODES (set VITE_API_TARGET in .env.local or the shell):
// - VITE_API_TARGET=vercel      -> proxy /api to http://localhost:3000 (vercel dev)
// - VITE_API_TARGET=express     -> proxy /api to http://localhost:5000 (your local Express)
// - VITE_API_TARGET=https://... -> proxy /api to that URL (e.g. the deployed Vercel site)
// - unset (production build) -> proxy setting is ignored anyway

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_TARGET
  const target =
    apiTarget === 'vercel'
      ? 'http://localhost:3000'
      : apiTarget === 'express'
      ? 'http://localhost:5000'
      : apiTarget?.startsWith('http')
      ? apiTarget
      : undefined

  return {
    plugins: [react(), glsl()],
    server: {
      proxy: target
        ? {
            '/api': {
              target,
              changeOrigin: true,
            },
          }
        : undefined,
    },
  }
})
