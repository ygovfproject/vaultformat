'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import NextLink from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ButtonBase from '@mui/material/ButtonBase';
import { keyframes } from '@emotion/react';
import { canHover, dmf, easeOut, fonts, size } from '@/theme';
import type { Deck } from '@/lib/content';
import { getDeckProfile, DECK_TAGS, TAG_HINTS, type DeckProfile, type DeckTag } from '@/lib/deckProfile';
import { closest } from '@/lib/fuzzy';
import SearchBox from '../SearchBox';

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

/** Skeleton shimmer while the deck tags load (their card texts come in after the page). */
const shimmer = keyframes`
  from { background-position: 100% 0; }
  to { background-position: -100% 0; }
`;
const skeleton = {
  display: 'inline-block',
  verticalAlign: 'middle',
  background: 'linear-gradient(90deg, rgba(232,238,247,0.08) 25%, rgba(232,238,247,0.2) 50%, rgba(232,238,247,0.08) 75%)',
  backgroundSize: '200% 100%',
  animation: `${shimmer} 1.4s linear infinite`,
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
} as const;

/** Placeholder for a tile's tag line: two short bars. */
function TagLineSkeleton() {
  return (
    <Box component="span" aria-hidden sx={{ display: 'inline-flex', gap: 1, verticalAlign: 'middle' }}>
      <Box component="span" sx={{ ...skeleton, width: 64, height: '0.8em' }} />
      <Box component="span" sx={{ ...skeleton, width: 44, height: '0.8em' }} />
    </Box>
  );
}

/** Placeholder for the tag filter row: a few button-sized blocks. */
function TagFilterSkeleton() {
  return (
    <Box aria-hidden sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {[132, 92, 92, 104, 72, 72].map((w, i) => (
        <Box key={i} sx={{ ...skeleton, width: w, height: 32 }} />
      ))}
    </Box>
  );
}

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

/** Tags per deck id; filled in as they load (they need every deck's card texts). */
function useDeckProfiles(decks: Deck[]) {
  const [profiles, setProfiles] = useState<Record<string, DeckProfile>>({});
  const key = decks.map((d) => d.id).join(',');
  useEffect(() => {
    let alive = true;
    for (const deck of decks) {
      getDeckProfile(deck).then(
        (p) => alive && setProfiles((all) => ({ ...all, [deck.id]: p })),
        // Couldn't work them out: no tags, rather than a skeleton that never goes away
        () => alive && setProfiles((all) => ({ ...all, [deck.id]: { tags: [] } })),
      );
    }
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return profiles;
}

function DeckTile({ deck, profile, now, position }: { deck: Deck; profile?: DeckProfile; now: number | null; position: number }) {
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
        bgcolor: 'rgba(232,238,247,0.18)',
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
            background: `linear-gradient(180deg, rgba(6,14,28,0) 30%, rgba(6,14,28,0.78) 62%, ${dmf.bgDeep} 100%)`,
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
              boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
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

        {/* Title block: name, and how the deck plays */}
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, p: { xs: 1.5, md: 2 }, pl: { xs: 2, md: 2.5 } }}>
          <Typography
            className="deck-title"
            component="h3"
            sx={{
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: { xs: '1.05rem', md: size.sub },
              lineHeight: 1.1,
              color: dmf.text,
              transition: 'color 150ms',
            }}
          >
            {deck.title}
          </Typography>
          {/* Fixed height, so tiles don't shift as the tags load in */}
          <Typography
            sx={{ mt: 0.5, minHeight: '1.4em', fontFamily: fonts.display, fontWeight: 600, fontSize: size.small, lineHeight: 1.4, color: dmf.ice }}
          >
            {/* Each tag stays whole: a narrow tile wraps between tags, never inside one or after a dot */}
            {!profile && <TagLineSkeleton />}
            {profile?.tags.map((t, i) => (
              <Fragment key={t}>
                {i > 0 && ' '}
                <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                  {i > 0 && '· '}
                  {t}
                </Box>
              </Fragment>
            ))}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/** Tag filter: a row of toggles, shown once every deck's tags are in. */
function TagFilter({ counts, selected, onToggle }: { counts: Record<DeckTag, number>; selected: DeckTag[]; onToggle: (t: DeckTag) => void }) {
  const tags = DECK_TAGS.filter((t) => counts[t] > 0);
  if (tags.length === 0) return null;
  return (
    <Box role="group" aria-label="Filter by card type" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {tags.map((t) => {
        const on = selected.includes(t);
        return (
          <ButtonBase
            key={t}
            aria-pressed={on}
            title={TAG_HINTS[t]}
            onClick={() => onToggle(t)}
            sx={{
              px: 1.5,
              py: 0.75,
              gap: 0.75,
              border: `1px solid ${on ? dmf.orange : 'rgba(232,238,247,0.25)'}`,
              bgcolor: on ? dmf.orange : 'transparent',
              color: on ? dmf.ink : dmf.text,
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: size.ui,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              transition: 'background-color 150ms, border-color 150ms, color 150ms',
              [canHover]: { '&:hover': on ? { bgcolor: '#ffa565' } : { borderColor: dmf.orange, color: dmf.orange } },
            }}
          >
            {t}
            <Box component="span" sx={{ fontWeight: 600, opacity: 0.75 }}>
              {counts[t]}
            </Box>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

/** A button that looks like a text link (orange, underlined). */
const linkButton = {
  p: 0,
  fontFamily: fonts.body,
  fontSize: 'inherit',
  fontWeight: 600,
  color: dmf.orange,
  textDecoration: 'underline',
  textDecorationThickness: 2,
  textUnderlineOffset: 4,
  verticalAlign: 'baseline',
} as const;

export default function DeckGrid({ decks }: { decks: Deck[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('newest');
  const [tags, setTags] = useState<DeckTag[]>([]);
  const profiles = useDeckProfiles(decks);
  const profilesReady = decks.every((d) => profiles[d.id]);
  // Today's date, read after the page loads (null during the first render, which matches the built HTML)
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);

  const counts = useMemo(() => {
    const c = Object.fromEntries(DECK_TAGS.map((t) => [t, 0])) as Record<DeckTag, number>;
    for (const d of decks) for (const t of profiles[d.id]?.tags ?? []) c[t]++;
    return c;
  }, [decks, profiles]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = q
      ? decks.filter(
          (d) => d.title.toLowerCase().includes(q) || d.id.toLowerCase().includes(q),
        )
      : [...decks];
    // A deck shows if it has any of the chosen tags
    if (tags.length) list = list.filter((d) => profiles[d.id]?.tags.some((t) => tags.includes(t)));
    return sort === 'az' ? list.sort((a, b) => a.title.localeCompare(b.title)) : list; // decks arrive newest-first
  }, [decks, query, sort, tags, profiles]);

  const suggestion = useMemo(
    () => (visible.length === 0 && query.trim() ? closest(query, decks, (d) => [d.title]) : null),
    [visible.length, query, decks],
  );
  const toggleTag = (t: DeckTag) => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  const clearAll = () => {
    setQuery('');
    setTags([]);
  };
  const q = query.trim();

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <SearchBox value={query} onChange={setQuery} label="Search decks" placeholder="Search decks" />
        <ToggleButtonGroup
          exclusive
          size="small"
          value={sort}
          onChange={(_, v: Sort | null) => v && setSort(v)}
          aria-label="Sort decks"
          sx={{
            '& .MuiToggleButton-root': {
              px: 2,
              fontFamily: fonts.display,
              fontSize: size.ui,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: dmf.textMuted,
              borderColor: 'rgba(232,238,247,0.25)',
            },
            // Selected: orange, like every other control
            '& .Mui-selected': { color: `${dmf.ink} !important`, bgcolor: `${dmf.orange} !important` },
          }}
        >
          <ToggleButton value="newest">Newest</ToggleButton>
          <ToggleButton value="az">A–Z</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {/* Its space is kept while the tags load, so the grid doesn't jump down */}
      <Box sx={{ minHeight: 40, mb: 5 }}>{profilesReady ? <TagFilter counts={counts} selected={tags} onToggle={toggleTag} /> : <TagFilterSkeleton />}</Box>

      {visible.length === 0 ? (
        <Box role="status" sx={{ py: 6 }}>
          <Typography sx={{ color: dmf.text, mb: 1 }}>
            {q ? `No decks match “${q}”${tags.length ? ` with ${tags.join(' or ')}` : ''}.` : `No decks use ${tags.join(' or ')}.`}
          </Typography>
          {suggestion && (
            <Typography sx={{ color: dmf.text, mb: 1 }}>
              Did you mean{' '}
              <ButtonBase
                onClick={() => {
                  setQuery(suggestion.title);
                  setTags([]);
                }}
                sx={linkButton}
              >
                {suggestion.title}
              </ButtonBase>
              ?
            </Typography>
          )}
          <ButtonBase onClick={clearAll} sx={{ ...linkButton, mt: 1 }}>
            {tags.length && q ? 'Clear search and filters' : tags.length ? 'Clear filters' : 'Clear search'}
          </ButtonBase>
        </Box>
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
            <DeckTile key={deck.id} deck={deck} profile={profiles[deck.id]} now={now} position={i} />
          ))}
        </Box>
      )}
    </Box>
  );
}
