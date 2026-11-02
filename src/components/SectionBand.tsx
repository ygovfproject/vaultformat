'use client';

import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { dmf, easeOut } from '@/theme';
import { Title, PixelEdge, pageBg } from './Decor';
import Markdown from './Markdown';

export type BandVariant = 'pattern' | 'surface' | 'ice';

export const bandColor: Record<BandVariant, string> = {
  pattern: dmf.bg,
  surface: dmf.surface,
  ice: dmf.ice,
};

/** Flat fields of colour; the bands are told apart by their colour alone. */
const backgrounds: Record<BandVariant, object> = {
  pattern: pageBg,
  surface: { backgroundColor: dmf.surface },
  ice: { backgroundColor: dmf.ice },
};

/** Hidden below its place until `shown`, then it rises in. Reduced motion: fades in without moving. */
const rise = (shown: boolean) => ({
  opacity: shown ? 1 : 0,
  transform: shown ? 'none' : 'translateY(20px)',
  transition: `opacity 500ms ${easeOut}, transform 500ms ${easeOut}`,
  '@media (prefers-reduced-motion: reduce)': { transform: 'none' },
});

/** Entrance delays (ms) of the text's first blocks after the heading; later blocks come with the last. */
const STAGGER = [70, 140, 210, 280];

/** Fade/slide in once the band scrolls into view. */
function useReveal<T extends Element>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, shown };
}

export default function SectionBand({
  id,
  title,
  body,
  variant,
  prevColor,
  nextColor,
}: {
  id: string;
  title: string;
  body: string;
  variant: BandVariant;
  prevColor?: string;
  nextColor?: string;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const ice = variant === 'ice';
  const tone = ice ? 'ice' : 'dark';

  return (
    <Box
      component="section"
      id={id}
      sx={{
        position: 'relative',
        overflow: 'clip',
        scrollMarginTop: 72,
        // Same space in every band, so the rhythm down the page is even
        py: { xs: 10, md: 14 },
        ...backgrounds[variant],
      }}
    >
      {ice && prevColor && <PixelEdge color={prevColor} flip />}

      <Container maxWidth="lg">
        <Grid ref={ref} container spacing={{ xs: 2, md: 8 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ position: { md: 'sticky' }, top: { md: 110 } }}>
              <Title
                variant="h2"
                component="h2"
                sx={{ color: ice ? dmf.ink : dmf.text, fontSize: { xs: '2.5rem', md: '3.25rem' }, mb: { xs: 2, md: 0 }, ...rise(shown) }}
              >
                {title}
              </Title>
            </Box>
          </Grid>
          {/* The text's blocks (paragraphs, lists, quotes) follow the heading one by one */}
          <Grid
            size={{ xs: 12, md: 7 }}
            sx={{
              pt: { md: 1 },
              '& > *': rise(shown),
              ...Object.fromEntries(STAGGER.map((delay, i) => [`& > :nth-of-type(${i + 1})`, { transitionDelay: `${delay}ms` }])),
              [`& > :nth-of-type(n+${STAGGER.length + 1})`]: { transitionDelay: `${STAGGER[STAGGER.length - 1]}ms` },
            }}
          >
            <Markdown tone={tone}>{body}</Markdown>
          </Grid>
        </Grid>
      </Container>

      {ice && nextColor && <PixelEdge color={nextColor} />}
    </Box>
  );
}
