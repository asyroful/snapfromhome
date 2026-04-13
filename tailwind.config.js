/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        booth: {
          bg:       '#0a0a0f',
          surface:  '#12121e',
          card:     '#1a1a2e',
          border:   '#2a2a4a',
          pink:     '#FF6B9D',
          'pink-light': '#ff8fb3',
          'pink-dark':  '#e0527f',
          purple:   '#C9A0DC',
          'purple-light': '#dab8ed',
          'purple-dark':  '#a87abf',
          gold:     '#F5C842',
          teal:     '#00D4B8',
          text:     '#f0f0f0',
          muted:    '#9090a8',
          dim:      '#606080',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'flash':          'flash 0.4s ease-out',
        'countdown':      'countdown 0.6s ease-out',
        'slide-up':       'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'fade-in':        'fadeIn 0.3s ease-out',
        'pulse-ring':     'pulseRing 1.5s ease-out infinite',
        'bounce-subtle':  'bounceSubtle 2s ease-in-out infinite',
        'shimmer':        'shimmer 2s linear infinite',
        'spin-slow':      'spin 3s linear infinite',
      },
      keyframes: {
        flash: {
          '0%':   { opacity: '0' },
          '30%':  { opacity: '1' },
          '100%': { opacity: '0' },
        },
        countdown: {
          '0%':   { transform: 'scale(0.3)', opacity: '0' },
          '50%':  { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)',   opacity: '0.8' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        slideInRight: {
          '0%':   { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(1)',    opacity: '0.8' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial':    'radial-gradient(var(--tw-gradient-stops))',
        'gradient-booth':     'linear-gradient(135deg, #FF6B9D 0%, #C9A0DC 50%, #00D4B8 100%)',
        'gradient-dark':      'linear-gradient(180deg, #0a0a0f 0%, #12121e 100%)',
        'gradient-card':      'linear-gradient(145deg, #1a1a2e 0%, #16162a 100%)',
        'shimmer-gradient':   'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
      },
      boxShadow: {
        'glow-pink':   '0 0 30px rgba(255, 107, 157, 0.4)',
        'glow-purple': '0 0 30px rgba(201, 160, 220, 0.3)',
        'glow-teal':   '0 0 30px rgba(0, 212, 184, 0.3)',
        'card':        '0 8px 32px rgba(0,0,0,0.4)',
        'card-hover':  '0 16px 48px rgba(0,0,0,0.6)',
        'inner-glow':  'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
