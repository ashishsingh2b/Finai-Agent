/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    500: '#425563', // PANTONE 7546 C - Medium slate gray
                    600: '#253746', // PANTONE 7546 C - Dark slate blue (PRIMARY)
                    700: '#1A2630', // PANTONE 7546 C - Very dark variant
                    800: '#BDC2C9', // PANTONE 7546 C - Light gray accent
                },
                success: '#10b981',
                warning: '#f59e0b',
                danger: '#ef4444',
            },
        },
    },
    plugins: [],
}
