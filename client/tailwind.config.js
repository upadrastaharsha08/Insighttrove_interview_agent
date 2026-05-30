/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        void: '#060608',
        surface: '#0e0e14',
        panel: '#14141c',
        border: '#1e1e2e',
        accent: '#7c6af7',
        'accent-glow': '#9d8fff',
        signal: '#00f5a0',
        warn: '#f59e0b',
        danger: '#ef4444',
        muted: '#5a5a78',
        text: '#e8e8f0',
        subtle: '#9090a8',
      },
      boxShadow: {
        glow: '0 0 30px rgba(124,106,247,0.25)',
        'glow-sm': '0 0 12px rgba(124,106,247,0.2)',
        'signal-glow': '0 0 20px rgba(0,245,160,0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-up': 'fadeUp 0.5s ease forwards',
        'spin-slow': 'spin 8s linear infinite',
        scanning: 'scanning 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        scanning: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
