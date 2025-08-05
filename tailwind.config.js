/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './App.{js,ts,tsx}',
        './app/**/*.{js,ts,tsx}',
        './config/**/*.{js,ts,tsx}',
        './components/**/*.{js,ts,tsx}',
        './app/navigation/**/*.{js,ts,tsx}',
        './app/screens/**/*.{js,ts,tsx}',
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                dark: {
                    50: '#e6e4e3',
                    100: '#bfbab8',
                    200: '#99908d',
                    300: '#736663',
                    400: '#4d3d39',
                    500: '#27140f',
                    600: '#1f100c',
                    700: '#170c09',
                    800: '#100904',
                    900: '#0a0502',
                },
                light: {
                    50: '#FDFBFA',
                    100: '#FBF7F3',
                    200: '#F9F5F0',
                    225: `#F7EFE6`,
                    250: `#F4EAD9`,
                    300: '#F2E5D4',
                    400: '#EBD4B9',
                    500: '#E4C8A0', // Warm midpoint
                    600: '#C7A87F',
                    700: '#9D7F5F',
                    800: '#755D42',
                    900: '#5C3D20', // Warm rich brown
                },
                champ: {
                    DEFAULT: '#EFDFC8',
                },
                brown: {
                    DEFAULT: '#87755A',
                    600: '#6f614a',
                    700: '#574d3b',
                },
                accent: {
                    DEFAULT: '#D28D2D',
                    600: '#b24D50',
                    700: '#8f5b1f',
                },
            },
            fontFamily: {
                dosis: ['Dosis-Regular'],
                'dosis-bold': ['Dosis-Bold'],
                catamaran: ['Catamaran-Regular'],
                'catamaran-bold': ['Catamaran-Bold'],
                nexa: ['Nexa-ExtraLight'],
                'nexa-bold': ['Nexa-Heavy'],
                'nexa-bold-italic': ['Nexa-BoldItalic'],
                'nexa-book': ['Nexa-Book'],
                'nexa-book-italic': ['Nexa-BookItalic'],
                'nexa-regular': ['Nexa-Regular'],
                montserrat: ['Montserrat-Regular'],
                'montserrat-semibold': ['Montserrat-SemiBold'],
            },
        },
    },
    plugins: [],
};
