
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const buildVersion = Date.now().toString();

// Write version to public folder so it's accessible at /version.json
try {
  const publicDir = path.resolve(__dirname, 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
  fs.writeFileSync(
    path.join(publicDir, 'version.json'),
    JSON.stringify({ version: buildVersion })
  );
} catch (e) {
  console.error('Failed to write version.json', e);
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  define: {
    __BUILD_VERSION__: JSON.stringify(buildVersion),
  },

  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    allowedHosts: ['shop.localhost']
  }
})
