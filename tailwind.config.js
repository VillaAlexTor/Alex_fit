/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
        colors: {
            primary: "#16a34a", // verde fitness
            secondary: "#2563eb", // azul acento
            dark: "#1e1e1e",
            light: "#f9fafb",
        },
        fontFamily: {
            sans: ['Inter', 'sans-serif'],
        },
        boxShadow: {
            card: '0 4px 10px rgba(0,0,0,0.1)',
        },
        },
    },
    plugins: [],
}
