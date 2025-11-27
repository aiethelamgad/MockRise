/**
 * MockRise Design System Tokens
 * Comprehensive design tokens for consistent UI development
 */

export const designTokens = {
  // Color System
  colors: {
    // Brand Colors
    primary: {
      50: 'hsl(239, 100%, 97%)',
      100: 'hsl(239, 100%, 94%)',
      200: 'hsl(239, 100%, 88%)',
      300: 'hsl(239, 100%, 80%)',
      400: 'hsl(239, 100%, 70%)',
      500: 'hsl(239, 84%, 60%)', // Main brand color
      600: 'hsl(239, 84%, 50%)',
      700: 'hsl(239, 84%, 40%)',
      800: 'hsl(239, 84%, 30%)',
      900: 'hsl(239, 84%, 20%)',
    },
    secondary: {
      50: 'hsl(265, 100%, 97%)',
      100: 'hsl(265, 100%, 94%)',
      200: 'hsl(265, 100%, 88%)',
      300: 'hsl(265, 100%, 80%)',
      400: 'hsl(265, 100%, 70%)',
      500: 'hsl(265, 75%, 65%)', // Main secondary
      600: 'hsl(265, 75%, 55%)',
      700: 'hsl(265, 75%, 45%)',
      800: 'hsl(265, 75%, 35%)',
      900: 'hsl(265, 75%, 25%)',
    },
    accent: {
      50: 'hsl(158, 100%, 97%)',
      100: 'hsl(158, 100%, 94%)',
      200: 'hsl(158, 100%, 88%)',
      300: 'hsl(158, 100%, 80%)',
      400: 'hsl(158, 100%, 70%)',
      500: 'hsl(158, 64%, 52%)', // Main accent
      600: 'hsl(158, 64%, 42%)',
      700: 'hsl(158, 64%, 32%)',
      800: 'hsl(158, 64%, 22%)',
      900: 'hsl(158, 64%, 12%)',
    },
    // Semantic Colors
    success: {
      50: 'hsl(158, 100%, 97%)',
      500: 'hsl(158, 64%, 52%)',
      600: 'hsl(158, 64%, 42%)',
    },
    warning: {
      50: 'hsl(43, 100%, 97%)',
      500: 'hsl(43, 96%, 56%)',
      600: 'hsl(43, 96%, 46%)',
    },
    destructive: {
      50: 'hsl(0, 100%, 97%)',
      500: 'hsl(0, 84%, 60%)',
      600: 'hsl(0, 84%, 50%)',
    },
    // Neutral Colors
    gray: {
      50: 'hsl(220, 13%, 98%)',
      100: 'hsl(220, 13%, 95%)',
      200: 'hsl(220, 13%, 91%)',
      300: 'hsl(220, 13%, 85%)',
      400: 'hsl(220, 9%, 60%)',
      500: 'hsl(220, 9%, 46%)',
      600: 'hsl(220, 15%, 30%)',
      700: 'hsl(220, 15%, 20%)',
      800: 'hsl(220, 15%, 15%)',
      900: 'hsl(220, 15%, 10%)',
    },
  },

  // Typography Scale
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // Spacing Scale
  spacing: {
    0: '0px',
    1: '0.25rem', // 4px
    2: '0.5rem',  // 8px
    3: '0.75rem', // 12px
    4: '1rem',    // 16px
    5: '1.25rem', // 20px
    6: '1.5rem',  // 24px
    8: '2rem',    // 32px
    10: '2.5rem', // 40px
    12: '3rem',   // 48px
    16: '4rem',   // 64px
    20: '5rem',   // 80px
    24: '6rem',   // 96px
    32: '8rem',   // 128px
    40: '10rem',  // 160px
    48: '12rem',  // 192px
    56: '14rem',  // 224px
    64: '16rem',  // 256px
  },

  // Border Radius
  borderRadius: {
    none: '0px',
    sm: '0.25rem',   // 4px
    base: '0.5rem',  // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
    '3xl': '3rem',   // 48px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 hsl(220 15% 15% / 0.05)',
    base: '0 1px 3px 0 hsl(220 15% 15% / 0.1), 0 1px 2px -1px hsl(220 15% 15% / 0.1)',
    md: '0 4px 6px -1px hsl(220 15% 15% / 0.1), 0 2px 4px -2px hsl(220 15% 15% / 0.1)',
    lg: '0 10px 15px -3px hsl(220 15% 15% / 0.1), 0 4px 6px -4px hsl(220 15% 15% / 0.1)',
    xl: '0 20px 25px -5px hsl(220 15% 15% / 0.1), 0 8px 10px -6px hsl(220 15% 15% / 0.1)',
    '2xl': '0 25px 50px -12px hsl(220 15% 15% / 0.25)',
    inner: 'inset 0 2px 4px 0 hsl(220 15% 15% / 0.05)',
    glow: '0 0 30px hsl(239 84% 60% / 0.3)',
    'glow-lg': '0 0 50px hsl(239 84% 60% / 0.4)',
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Animation Durations
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },

  // Animation Easings
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Component Sizes
  sizes: {
    // Button Heights
    button: {
      sm: '2rem',    // 32px
      md: '2.5rem',  // 40px
      lg: '3rem',    // 48px
      xl: '3.5rem',  // 56px
    },
    // Input Heights
    input: {
      sm: '2rem',    // 32px
      md: '2.5rem',  // 40px
      lg: '3rem',    // 48px
    },
    // Avatar Sizes
    avatar: {
      xs: '1.5rem',  // 24px
      sm: '2rem',    // 32px
      md: '2.5rem',  // 40px
      lg: '3rem',    // 48px
      xl: '4rem',    // 64px
      '2xl': '5rem', // 80px
    },
    // Icon Sizes
    icon: {
      xs: '0.75rem', // 12px
      sm: '1rem',    // 16px
      md: '1.25rem', // 20px
      lg: '1.5rem',  // 24px
      xl: '2rem',    // 32px
    },
  },
} as const;

// Theme variants for light/dark mode
export const themeVariants = {
  light: {
    background: designTokens.colors.gray[50],
    foreground: designTokens.colors.gray[900],
    card: designTokens.colors.gray[50],
    'card-foreground': designTokens.colors.gray[900],
    muted: designTokens.colors.gray[100],
    'muted-foreground': designTokens.colors.gray[500],
    border: designTokens.colors.gray[200],
    input: designTokens.colors.gray[200],
  },
  dark: {
    background: designTokens.colors.gray[900],
    foreground: designTokens.colors.gray[50],
    card: designTokens.colors.gray[800],
    'card-foreground': designTokens.colors.gray[50],
    muted: designTokens.colors.gray[700],
    'muted-foreground': designTokens.colors.gray[400],
    border: designTokens.colors.gray[700],
    input: designTokens.colors.gray[700],
  },
} as const;

// RTL/LTR layout tokens
export const layoutTokens = {
  ltr: {
    direction: 'ltr',
    textAlign: 'left',
    marginStart: 'margin-left',
    marginEnd: 'margin-right',
    paddingStart: 'padding-left',
    paddingEnd: 'padding-right',
    borderStart: 'border-left',
    borderEnd: 'border-right',
    transform: 'translateX(0)',
  },
  rtl: {
    direction: 'rtl',
    textAlign: 'right',
    marginStart: 'margin-right',
    marginEnd: 'margin-left',
    paddingStart: 'padding-right',
    paddingEnd: 'padding-left',
    borderStart: 'border-right',
    borderEnd: 'border-left',
    transform: 'translateX(0)',
  },
} as const;
