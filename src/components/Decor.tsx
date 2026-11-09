'use client';

import NextLink from 'next/link';
import Box from '@mui/material/Box';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import { canHover, dmf, easeOut, fonts, size } from '@/theme';

/** Page background: flat navy (the Main page hero is the only textured surface). */
export const pageBg = { backgroundColor: dmf.bg };

/** Page and section heading: display type in solid text colour. */
export function Title({ sx, component = 'h2', ...props }: TypographyProps & { component?: React.ElementType }) {
  return <Typography component={component} {...props} sx={[{ color: dmf.text }, ...(Array.isArray(sx) ? sx : [sx])]} />;
}

/** The plain line under a page title that says what the page is. */
export function Subtitle({ children }: { children: React.ReactNode }) {
  return <Typography sx={{ color: dmf.text, maxWidth: '65ch', mb: 2 }}>{children}</Typography>;
}

/**
 * The site's two buttons: primary (filled orange) for the main action, secondary (orange
 * outline) for the one next to it. Both have the small notched corners. Every page uses only these.
 */
export function NotchButton({
  href,
  children,
  variant = 'solid',
  download,
  onClick,
}: {
  /** Link target; leave out and pass onClick for a plain <button>. */
  href?: string;
  children: React.ReactNode;
  /** 'solid' = primary, 'ghost' = secondary */
  variant?: 'solid' | 'ghost';
  /** File download: renders a plain <a download> (href must already include the base path). */
  download?: string;
  onClick?: () => void;
}) {
  const solid = variant === 'solid';
  const as = !href ? 'button' : download ? 'a' : NextLink;
  return (
    <Box
      component={as}
      {...(href ? { href } : { type: 'button' })}
      {...(download ? { download } : {})}
      onClick={onClick}
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        px: { xs: 3, md: 4 },
        py: 1.5,
        border: `2px solid ${dmf.orange}`,
        bgcolor: solid ? dmf.orange : 'transparent',
        color: solid ? dmf.ink : dmf.orange,
        cursor: 'pointer',
        fontFamily: fonts.display,
        fontWeight: 700,
        fontSize: size.ui,
        lineHeight: 1.4,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        textAlign: 'center',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        transition: `background-color 150ms, border-color 150ms, transform 150ms ${easeOut}`,
        [canHover]: {
          '&:hover': solid
            ? { bgcolor: '#ffa565', borderColor: '#ffa565', transform: 'translateY(-2px)' }
            : { bgcolor: 'rgba(255,138,61,0.12)', transform: 'translateY(-2px)' },
        },
        // Pressed: a small push in (after the hover lift, so it wins while hovering too)
        '&:active': { transform: 'scale(0.97)' },
        // Notched corners: small squares sitting on the top-left and bottom-right corners
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          width: 7,
          height: 7,
          bgcolor: dmf.orange,
        },
        '&::before': { top: -5, left: -5 },
        '&::after': { bottom: -5, right: -5 },
      }}
    >
      {children}
    </Box>
  );
}

/**
 * A scatter of pixel squares that "dissolves" an edge between two bands. `seed` picks the pattern,
 * so two edges on one page don't look stamped from the same mould.
 */
export function PixelEdge({ color = dmf.bg, flip = false, seed: start = 7 }: { color?: string; flip?: boolean; seed?: number }) {
  // Deterministic pseudo-random layout so server and client markup match.
  const squares: { x: number; y: number; s: number }[] = [];
  let seed = start;
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(rand() * 100);
    const y = Math.floor(rand() * rand() * 36);
    const s = [2, 3, 4][Math.floor(rand() * 3)];
    squares.push({ x, y, s });
  }
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        [flip ? 'top' : 'bottom']: 0,
        height: 60,
        pointerEvents: 'none',
        transform: flip ? 'scaleY(-1)' : undefined,
      }}
    >
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" width="100%" height="100%">
        <rect x="0" y="36" width="100" height="4" fill={color} />
        {squares.map((q, i) => (
          <rect key={i} x={q.x} y={36 - q.y - q.s * 0.6} width={q.s * 0.35} height={q.s * 0.9} fill={color} />
        ))}
      </svg>
    </Box>
  );
}
