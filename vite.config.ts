import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: [{ find: 'vue-swr', replacement: path.resolve(__dirname, 'src') }],
  },
  plugins: [
    vue(),
    {
      name: 'vite:mock',
      configureServer: (server) => {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api') {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            setTimeout(() => res.end(JSON.stringify({ data: 'success' })), 1000)
          } else {
            next()
          }
        })
      },
    },
  ],
  server: {
    host: '0.0.0.0',
  },
})
