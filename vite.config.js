import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: "/CPN_admin_panel/",
  plugins: [react()],
  // server: {
  //   allowedHosts: [
  //     'cpnfoods.in',
  //     'www.cpnfoods.in'
  //   ]
  // }
})
