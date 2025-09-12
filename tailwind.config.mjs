/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bavarian: {
          blue: '#1e40af',
          gold: '#f59e0b',
          lightBlue: '#3b82f6',
          darkBlue: '#1e3a8a'
        }
      }
    },
  },
  plugins: [],
}