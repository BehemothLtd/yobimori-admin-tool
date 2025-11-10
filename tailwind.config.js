/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ef654d",
        "primary-light": "#ff8a65",
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(135deg, #ef654d 0%, #ff8a65 100%)",
      },
    },
  },
  plugins: [],
};
