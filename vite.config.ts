import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Tech design §1: the facility admin app runs on 5174 (API 3000, Super Admin 5173).
const ADMIN_WEB_PORT = 5174;

export default defineConfig({
	plugins: [react()],
	server: {
		port: ADMIN_WEB_PORT,
		strictPort: true,
		// @carekind/shared is a file: dependency outside this folder; allow Vite to serve it.
		fs: { allow: ['.', '../../packages/carekind-shared'] },
	},
	preview: { port: ADMIN_WEB_PORT, strictPort: true },
});
