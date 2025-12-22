/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/index.tsx',
    './src/App.tsx',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0D9488',
        'primary-focus': '#324342ff',
        'primary-content': '#ffffff',
        secondary: '#FACC15',
        'secondary-focus': '#EAB308',
        accent: '#38BDF8',
        neutral: '#4B5563',
        'base-100': '#FFFFFF',
        'base-200': '#F9FAFB',
        'base-300': '#F3F4F6',
        info: '#2563EB',
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
