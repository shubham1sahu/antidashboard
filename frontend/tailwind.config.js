/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  // Safelist kitchen KDS color classes that appear in dynamic/prop-driven strings
  safelist: [
    // Border left (card accent)
    'border-l-blue-500', 'border-l-amber-500', 'border-l-green-500', 'border-l-teal-500',
    // Column header border
    'border-blue-500', 'border-amber-500', 'border-green-500', 'border-teal-500',
    // Column header text
    'text-blue-300', 'text-amber-300', 'text-green-300', 'text-teal-300',
    // Badge backgrounds
    'bg-blue-500', 'bg-amber-500', 'bg-green-500', 'bg-teal-500',
  ],
  plugins: [],
};
