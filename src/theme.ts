'use client';

import { createTheme } from '@mui/material/styles';

/**
 * Palette: deep navy surfaces, warm orange + ice-blue accents. Each accent has one job:
 * - orange = interactive (links, buttons, the current page in the menu, keyboard focus)
 * - ice blue = information (rule numbers, card attribute and level, dates)
 * Bold text is the text colour, just heavier, so it never looks like a link.
 */
export const dmf = {
  bg: '#0a1628',
  bgDeep: '#060e1c',
  surface: '#0e2140',
  header: '#080b12',
  orange: '#ff8a3d',
  ice: '#38c8ff',
  text: '#e8eef7',
  textMuted: '#a7b8cf',
  ink: '#0a1628',
};

/** Two typefaces: Chakra Petch for headings, buttons, navigation and labels; Work Sans for text. */
export const fonts = {
  display: 'var(--font-display), "Arial Narrow", sans-serif',
  body: 'var(--font-body), "Segoe UI", Roboto, Arial, sans-serif',
};

/**
 * Type scale below the headings (which are set by the theme's h1-h6 and each page's title). Use
 * these instead of one-off sizes. Small sizes never go below 13px, even with the phone scaling.
 */
export const size = {
  /** Tags, captions, the footer's fine print */
  small: 'max(13px, 0.8125rem)',
  /** Navigation, buttons, labels */
  ui: 'max(13px, 0.875rem)',
  /** Running text in narrow places: card texts, update notes */
  text: '1rem',
  /** Small headings: card box titles, deck names, update titles */
  sub: '1.375rem',
};

/** Easing for everything that moves: starts fast, settles gently. */
export const easeOut = 'cubic-bezier(0.23, 1, 0.32, 1)';

/** Hover styles go inside this, so a tap on a phone doesn't leave them stuck on. */
export const canHover = '@media (hover: hover) and (pointer: fine)';

/** Hidden on screen, still read by screen readers (labels, extra context). */
export const visuallyHidden = {
  // Strings, not numbers: in MUI's sx, width: 1 means 100%
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

/** Headings are set in mixed case; capitals are kept for short labels (logo, menu, buttons). */
const display = { fontFamily: fonts.display, fontWeight: 700 };

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    primary: { main: dmf.orange, contrastText: dmf.ink },
    secondary: { main: dmf.ice, contrastText: dmf.ink },
    background: { default: dmf.bg, paper: dmf.surface },
    text: { primary: dmf.text, secondary: dmf.textMuted },
    divider: 'rgba(232, 238, 247, 0.12)',
  },
  shape: { borderRadius: 0 },
  typography: {
    fontFamily: fonts.body,
    // Large headings are set slightly tight; small ones keep the face's own spacing
    h1: { ...display, fontSize: '4rem', lineHeight: 1.1, letterSpacing: '-0.01em' },
    h2: { ...display, fontSize: '3rem', lineHeight: 1.15, letterSpacing: '-0.01em' },
    h3: { ...display, fontSize: '1.75rem', lineHeight: 1.2 },
    h4: { ...display, fontSize: size.sub, lineHeight: 1.25 },
    h5: { ...display, fontSize: '1.125rem', lineHeight: 1.3 },
    h6: { ...display, fontSize: '1rem', lineHeight: 1.3 },
    body1: { fontSize: '1.125rem', lineHeight: 1.7 },
    body2: { fontSize: size.ui },
    caption: { fontSize: size.small },
    button: { fontFamily: fonts.display, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Phones (under 600px): every font size is 15% smaller. All sizes are in rem, so scaling the
        // root size scales them all; spacing is in px and stays the same. Small text is set as
        // max(13px, ...), so it never ends up below 13px.
        '@media (max-width: 599.95px)': {
          html: { fontSize: '85%' },
          // ...but text fields stay at least 16px, or iOS zooms in when you tap them
          'input, textarea': { fontSize: 'max(16px, 1em) !important' },
        },
        // No text selection on the site's controls (cards, tiles, buttons)...
        body: { backgroundColor: dmf.bg, userSelect: 'none', WebkitUserSelect: 'none' },
        // ...but text to read can be selected and copied (rules, card texts, descriptions), and
        // text fields (e.g. deck search) can be edited.
        'p, li, h1, h2, h3, h4, blockquote, td, th, input, textarea': { userSelect: 'text', WebkitUserSelect: 'text' },
        // Reduced motion: animations jump straight to their end (no entrances, no loops).
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '1ms !important',
            animationDelay: '0ms !important',
            animationIterationCount: '1 !important',
          },
        },
        '::selection': { background: dmf.orange, color: dmf.ink },
        // One keyboard focus ring for everything you can tab to (the browser's thin default is
        // hard to see on navy)
        ':where(a, button, input, select, textarea, summary, [tabindex]):focus-visible': {
          outline: `2px solid ${dmf.orange}`,
          outlineOffset: 3,
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  },
});

export default theme;
