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



import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import glsl from 'vite-plugin-glsl'

// DEV MODES:
// - VITE_API_TARGET=vercel  -> proxy /api to http://localhost:3000 (vercel dev)
// - VITE_API_TARGET=express -> proxy /api to http://localhost:5000 (your local Express)
// - unset (production build) -> proxy setting is ignored anyway

const target =
  process.env.VITE_API_TARGET === 'vercel'
    ? 'http://localhost:3000'
    : process.env.VITE_API_TARGET === 'express'
    ? 'http://localhost:5000'
    : undefined

export default defineConfig({
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
})
