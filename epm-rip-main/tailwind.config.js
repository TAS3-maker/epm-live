/** @type {import('tailwindcss').Config} */
const { theme } = require("./src/theme"); // Import theme

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], 
  theme: {
    extend: {
      colors: {  // Make sure to add 'colors' here
        customBlue: '#1E40AF', // Custom blue color
        customPurple: '#6B21A8', // Custom purple color
      },
    },
  },
  plugins: [],
};

