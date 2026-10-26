/** @type {import('tailwindcss').Config} */
export default {
  // Aqui dizemos para o Tailwind olhar para todos os arquivos dentro da pasta src
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}