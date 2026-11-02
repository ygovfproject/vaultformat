'use client';

import { useEffect, useMemo, useState } from 'react';
import NextLink from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SearchIcon from '@mui/icons-material/Search';
import { keyframes } from '@emotion/react';
import { canHover, dmf, easeOut, fonts, size } from '@/theme';
import type { Deck } from '@/lib/content';

type Sort = 'newest' | 'az';

// Cut corners (top-right + bottom-left), echoing the notched buttons.
const CUT = 18;
const CLIP = `polygon(0 0, calc(100% - ${CUT}px) 0, 100% ${CUT}px, 100% 100%, ${CUT}px 100%, 0 calc(100% - ${CUT}px))`;

/** Tiles rise in one after another when the grid appears (and when a search brings one back). */
const tileIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: none; }
`;
const TILE_STAGGER_MS = 40;
/** The 13th tile on comes in with the 12th, so a long list doesn't keep the last ones waiting. */
const TILE_STAGGER_MAX = 12;

/** Shown when a deck has no cover image. */
function CoverFallback() {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        background: `repeating-linear-gradient(45deg, rgba(56,200,255,0.06) 0 8px, transparent 8px 16px), ${dmf.surface}`,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Box sx={{ width: '26%', aspectRatio: '1', border: `3px solid ${dmf.ice}`, transform: 'rotate(45deg)', display: 'grid', placeItems: 'center' }}>
        <Box sx={{ width: '45%', aspectRatio: '1', bgcolor: dmf.orange }} />
      </Box>
    </Box>
  );
}

function DeckTile({ deck, now, position }: { deck: Deck; now: number | null; position: number }) {
  // Built pages show the tag as of build time; in the browser it's re-checked against today's date,
  // so it disappears after 30 days even without a rebuild.
  const isNew = now === null ? deck.isNew : deck.newUntil !== null && now < deck.newUntil;
  return (
    <Box
      component={NextLink}
      href={`/deck/?d=${encodeURIComponent(deck.id)}`}
      sx={{
        display: 'block',
        textDecoration: 'none',
        // "backwards": the entrance only holds the tile before it starts, so afterwards the hover
        // and press transforms work as usual
        animation: `${tileIn} 400ms ${easeOut} ${Math.min(position, TILE_STAGGER_MAX) * TILE_STAGGER_MS}ms backwards`,
        '&:focus-visible': { outline: `2px solid ${dmf.orange}`, outlineOffset: 3 },
        // Outer layer = the border (clip-path can't use real borders)
        position: 'relative',
        p: '2px',
        clipPath: CLIP,
        bgcolor: 'rgba(56,200,255,0.35)',
        transform: 'translateY(0)',
        transition: `transform 200ms ${easeOut}, background-color 200ms ${easeOut}`,
        willChange: 'transform',
        // Hover: the tile lifts, its frame turns orange, the art leans in a little
        [canHover]: {
          '&:hover': { transform: 'translateY(-6px)', bgcolor: dmf.orange },
          '&:hover .deck-art': { transform: 'scale(1.04)' },
          '&:hover .deck-title': { color: dmf.orange },
          '&:active': { transform: 'translateY(-6px) scale(0.98)' },
        },
        // Pressed (touch screens; the hover version keeps the lift)
        '&:active': { transform: 'scale(0.98)' },
      }}
    >
      <Box sx={{ position: 'relative', aspectRatio: '4 / 5', overflow: 'hidden', clipPath: CLIP, bgcolor: dmf.bgDeep }}>
        {/* Art */}
        {deck.imgSrc ? (
          <Box
            className="deck-art"
            component="img"
            src={deck.imgSrc}
            alt={`${deck.title} cover art`}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 30%',
              transform: 'scale(1)',
              transition: `transform 400ms ${easeOut}`,
              // Keep the image on its own GPU layer all the time, so it doesn't snap
              // by a sub-pixel when the zoom-out animation ends.
              willChange: 'transform',
              backfaceVisibility: 'hidden',
            }}
          />
        ) : (
          <CoverFallback />
        )}

        {/* Bottom shade so the title stays readable */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, rgba(6,14,28,0) 40%, rgba(6,14,28,0.7) 70%, ${dmf.bgDeep} 100%)`,
          }}
        />

        {/* New tag */}
        {isNew && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              px: 1,
              py: 0.25,
              bgcolor: dmf.orange,
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: size.small,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: dmf.ink,
            }}
          >
            New
          </Box>
        )}

        {/* Title block */}
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, p: { xs: 1.5, md: 2 }, pl: { xs: 2.5, md: 3 } }}>
          <Typography
            className="deck-title"
            component="h3"
            sx={{
              fontFamily: fonts.display,
              fontWeight: 700,
              textTransform: 'uppercase',
              fontSize: { xs: '1.05rem', md: size.sub },
              lineHeight: 1.05,
              color: dmf.text,
              transition: 'color 150ms',
            }}
          >
            {deck.title}
          </Typography>
          <Box sx={{ mt: 1, height: 3, width: 36, bgcolor: dmf.orange }} />
        </Box>
      </Box>
    </Box>
  );
}

export default function DeckGrid({ decks }: { decks: Deck[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('newest');
  // Today's date, read after the page loads (null during the first render, which matches the built HTML)
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? decks.filter((d) => d.title.toLowerCase().includes(q) || d.id.toLowerCase().includes(q)) : [...decks];
    return sort === 'az' ? list.sort((a, b) => a.title.localeCompare(b.title)) : list; // decks arrive newest-first
  }, [decks, query, sort]);

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 0.75,
            flex: '1 1 260px',
            maxWidth: 420,
            border: '1px solid rgba(56,200,255,0.3)',
            bgcolor: 'rgba(6,14,28,0.6)',
            '&:focus-within': { borderColor: dmf.orange },
          }}
        >
          <SearchIcon sx={{ color: dmf.textMuted }} />
          <InputBase
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search decks"
            inputProps={{ 'aria-label': 'Search decks' }}
            sx={{ flex: 1, color: dmf.text }}
          />
        </Box>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={sort}
          onChange={(_, v: Sort | null) => v && setSort(v)}
          sx={{
            '& .MuiToggleButton-root': {
              px: 2,
              fontFamily: fonts.display,
              fontSize: size.ui,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: dmf.textMuted,
              borderColor: 'rgba(56,200,255,0.3)',
            },
            '& .Mui-selected': { color: `${dmf.ink} !important`, bgcolor: `${dmf.ice} !important` },
          }}
        >
          <ToggleButton value="newest">Newest</ToggleButton>
          <ToggleButton value="az">A–Z</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {visible.length === 0 ? (
        <Typography sx={{ color: dmf.textMuted, py: 6 }}>No decks match “{query}”.</Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' },
            columnGap: { xs: 2.5, md: 4 },
            rowGap: { xs: 2.5, md: 4 },
          }}
        >
          {visible.map((deck, i) => (
            <DeckTile key={deck.id} deck={deck} now={now} position={i} />
          ))}
        </Box>
      )}
    </Box>
  );
}
