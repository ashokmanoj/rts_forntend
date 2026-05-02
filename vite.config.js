import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Load LAN cert if it exists — enables HTTPS on LAN (required for Web Push)
function loadCerts() {
  const certDir = path.resolve(__dirname, 'certs');
  const cert = path.join(certDir, '192.168.1.128+2.pem');
  const key  = path.join(certDir, '192.168.1.128+2-key.pem');
  if (fs.existsSync(cert) && fs.existsSync(key)) {
    return { cert: fs.readFileSync(cert), key: fs.readFileSync(key) };
  }
  return undefined; // fall back to plain HTTP if certs not present
}

export default defineConfig({
  plugins: [react()],
  server: {
    host:  true, // listen on 0.0.0.0 so LAN devices can reach it
    https: loadCerts(),
    proxy: {
      '/api':     { target: 'http://localhost:5001', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5001', changeOrigin: true },
    },
  },
})
