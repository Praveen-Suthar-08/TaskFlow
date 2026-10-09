import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
  // GitHub Pages project site: https://Praveen-Suthar-08.github.io/TaskFlow/
  base: '/TaskFlow/',
=======
<<<<<<< HEAD
  // This repository is published at https://Praveen-Suthar-08.github.io/TaskFlow/
  base: '/TaskFlow/',
=======
  // Relative asset paths also work when hosted under a GitHub Pages repository path.
  base: './',
>>>>>>> 01f94f495e53b94267d77c95826f83881ba7e1ba
>>>>>>> 55539cc720a40dfeb29c4aa822faa4170c2522ab
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
});
