/** @type {import('tailwindcss').Config} */
const themed = (name) => `rgb(var(--${name}) / <alpha-value>)`;

const PAGE_ZOOM = 0.8;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: `${Math.round(1280 * PAGE_ZOOM)}px`, // 1024px
      '2xl': `${Math.round(1536 * PAGE_ZOOM)}px`, // 1229px
    },
    // Design system: square or 2px corners. Only dots, avatars and thin tracks stay round (`full`).
    borderRadius: {
      none: '0px',
      sm: '2px',
      DEFAULT: '2px',
      md: '2px',
      lg: '2px',
      xl: '2px',
      '2xl': '2px',
      '3xl': '2px',
      full: '9999px',
    },
    extend: {
      colors: {
        // Theme-aware surfaces (values live in src/styles/index.css)
        //   ink-950 main background · ink-900 primary surface / inner rows
        //   ink-850 raised surface  · ink-800 panel / card · ink-750 hover & selected
        ink: {
          950: themed('ink-950'),
          900: themed('ink-900'),
          850: themed('ink-850'),
          800: themed('ink-800'),
          750: themed('ink-750'),
        },
        // Page sections alternate between these two backgrounds.
        section: { a: themed('section-a'), b: themed('section-b') },
        line: {
          DEFAULT: themed('line'),
          strong: themed('line-strong'),
        },
        fg: {
          DEFAULT: themed('fg'),
          muted: themed('fg-muted'),
          subtle: themed('fg-subtle'),
        },
        accent: themed('accent-ink'),
        'mint-ink': themed('mint-ink'),
        'iris-ink': themed('iris-ink'),
        'coral-ink': themed('coral-ink'),
        // Brand constants from the Final Design Handover v2.1
        gold: { DEFAULT: '#FFC72C', hover: '#FFD24D', deep: '#F2B100' },
        // Token names kept so existing classes keep working; the values follow the new palette.
        iris: { DEFAULT: '#8FA3D6', soft: '#A9B8E2' }, // USA blue (no purple in the new design)
        mint: { DEFAULT: '#7FD3A8', deep: '#2C6B52' }, // success green: text, outline, dots only
        coral: { DEFAULT: '#E5534B' }, // error / LIVE red
        // Text colour used on yellow surfaces (was "navy" in the old design).
        navy: { DEFAULT: '#262624' },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        // Only used by the example creatives (Instagram / listing previews), which stay as supplied.
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      maxWidth: {
        page: '1600px',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(180deg, #FFD24D 0%, #F2B100 100%)',
        'gold-bar': 'linear-gradient(90deg, #F2B100 0%, #FFD24D 100%)',
      },
      boxShadow: {
        // No heavy shadows: only a hairline lift and a faint yellow glow for the selected state.
        card: '0 1px 0 0 rgb(0 0 0 / 0.25)',
        glow: '0 0 0 3px rgb(255 199 44 / 0.14)',
      },
      letterSpacing: {
        caps: '0.14em',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        progress: { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.35', transform: 'scale(0.8)' },
        },
        travel: { from: { 'stroke-dashoffset': '24' }, to: { 'stroke-dashoffset': '0' } },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-5px)' },
          '40%, 80%': { transform: 'translateX(5px)' },
        },
        'draw-line': { from: { 'stroke-dashoffset': '1' }, to: { 'stroke-dashoffset': '0' } },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out both',
        'rise-in': 'rise-in 320ms ease-out both',
        'scale-in': 'scale-in 220ms ease-out both',
        progress: 'progress linear both',
        'pulse-dot': 'pulse-dot 1.4s ease-in-out infinite',
        travel: 'travel 1.2s linear infinite',
        'toast-in': 'toast-in 240ms ease-out both',
        shake: 'shake 380ms ease-in-out both',
        'draw-line': 'draw-line 900ms ease-out both',
      },
    },
  },
  plugins: [],
};
