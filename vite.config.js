import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Únicas variables de entorno que llegan al navegador. Vercel agrega solo muchas VITE_VERCEL_*
// (usuario de GitHub, mensaje del commit, URL de preview...) y Vite metía TODAS las VITE_* en la
// página publicada. Ahora ninguna se expone sola: solo estas, una por una.
const PUBLIC_ENV_VARS = ['VITE_API_URL', 'VITE_GOOGLE_CLIENT_ID', 'VITE_PAYPAL_CLIENT_ID', 'VITE_SITE_LOCALE']

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL || 'https://api.royalgames.lat'

  return {
    plugins: [react()],
    // Prefijo que no usa nadie: así Vite no expone automáticamente ninguna variable.
    envPrefix: 'RG_PUBLIC_ONLY_VIA_DEFINE_',
    define: Object.fromEntries(
      PUBLIC_ENV_VARS.map((name) => [`import.meta.env.${name}`, JSON.stringify(env[name] ?? '')]),
    ),
    assetsInclude: ['**/*.PNG', '**/*.JPG', '**/*.JPEG', '**/*.WEBP', '**/*.GIF'],
    server: {
      // Mismo proxy que el rewrite de vercel.json en producción: /auth/* pasa por el propio
      // origen (acá localhost) en vez de pegarle cross-site al backend, así la cookie httpOnly
      // del refresh token queda de "primera parte" también en desarrollo.
      proxy: {
        '/auth': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
