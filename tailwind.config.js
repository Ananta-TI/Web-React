export default {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        lyrae: ['AlphaLyrae'], // fallback jika gagal load
      },
       keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
       animation: {
        scroll: 'scroll 40s linear infinite',
      },

    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
