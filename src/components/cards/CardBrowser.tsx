'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import { canHover, dmf, easeOut, fonts, size } from '@/theme';
import { cardData, isErratum, withoutErratumLine, type CardData } from '@/lib/fileServer';
import ScrollArea from './ScrollArea';

/**
 * Card grid + card info panel, shared by the deck pages and the errata page.
 * Desktop: info panel on the left, as tall as 5 rows of the first card box (the Main Deck); ← and →
 * step through the cards.
 * Phones: tapping a card opens the info panel from the bottom; swipe sideways (or use its arrows)
 * for the card before / after.
 */

export type CardSection = { key: string; label: string; cards: string[] };
type Selected = { section: string; index: number; card: string };

// Real cards are 59 × 86 mm with ~2 mm corners (same as the home page).
const CARD_RATIO = '59 / 86';
const CARD_RADIUS = '3.5% / 2.4%';

/** The info panel is as tall as a 40-card Main Deck box: PANEL_ROWS rows of PANEL_COLUMNS cards. */
const PANEL_ROWS = 5;
const PANEL_COLUMNS = 8;
/** Where the info panel sticks while scrolling: just below the header. */
const PANEL_TOP = 96;
/** Card lists this short get bigger cards (6 per row instead of 8), e.g. the errata page. */
const FEW_CARDS = 24;

/**
 * Height of the info panel: the first card box's height if it held a 40-card Main Deck (its
 * header, PANEL_ROWS rows of PANEL_COLUMNS cards and the gaps between them, and its padding). The
 * same on every page, whatever the deck size or cards per row. Follows the window size.
 */
function usePanelHeight(enabled: boolean) {
  const ref = useRef<HTMLElement | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    const section = ref.current;
    if (!enabled || !section) return;
    const measure = () => {
      const grid = section.querySelector<HTMLElement>('[data-card-grid]');
      if (!grid) return;
      const cs = getComputedStyle(section);
      const gs = getComputedStyle(grid);
      const rowGap = parseFloat(gs.rowGap) || 0;
      const columnGap = parseFloat(gs.columnGap) || 0;
      const top = grid.getBoundingClientRect().top - section.getBoundingClientRect().top; // border + padding + header
      const bottom = parseFloat(cs.paddingBottom) + parseFloat(cs.borderBottomWidth);
      // A card's height at PANEL_COLUMNS per row (cards are 59 × 86)
      const cardW = (grid.clientWidth - (PANEL_COLUMNS - 1) * columnGap) / PANEL_COLUMNS;
      const cardH = (cardW * 86) / 59;
      setHeight(Math.round(top + PANEL_ROWS * cardH + (PANEL_ROWS - 1) * rowGap + bottom));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    return () => ro.disconnect();
  }, [enabled]);
  return { ref, height };
}

/**
 * Vault Format errata (modified versions of official cards): custom cards (900000000–900009999)
 * whose text has the "~Vault Format erratum~" line. Known once the card's text has loaded.
 */
const isErrata = (card: string, texts: Texts) => isErratum(card, texts[card]?.desc);

/** The card's name once its data has loaded, its id until then. */
const cardName = (card: string, texts: Texts) => texts[card]?.name ?? `Card ${card}`;

/** Small "E" (erratum) tag shown on erratum cards in the grid. */
function ErrataTag() {
  return (
    <Box
      component="span"
      aria-hidden
      sx={{
        position: 'absolute',
        top: '4%',
        right: '-4%',
        px: 0.5,
        fontFamily: fonts.display,
        fontWeight: 700,
        fontSize: 12,
        lineHeight: 1.5,
        letterSpacing: '0.08em',
        color: dmf.ink,
        bgcolor: dmf.orange,
        boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
        pointerEvents: 'none',
      }}
    >
      E
    </Box>
  );
}

/** A line made only of dashes ("---", "--------", ...) in a card text becomes a divider. */
const DIVIDER_LINE = /^[ \t]*-{2,}[ \t]*$/;

/** Card text with its dash lines drawn as dividers. */
function CardText({ text }: { text: string }) {
  const parts = text.split(/\r?\n/).reduce<string[][]>(
    (acc, line) => {
      if (DIVIDER_LINE.test(line)) acc.push([]);
      else acc[acc.length - 1].push(line);
      return acc;
    },
    [[]],
  );
  return (
    <>
      {parts.map((lines, i) => (
        <Box key={i}>
          {i > 0 && <Box role="separator" sx={{ my: 1.5, height: 2, bgcolor: 'rgba(56,200,255,0.3)' }} />}
          <Typography sx={{ whiteSpace: 'pre-line', fontSize: size.text, lineHeight: 1.65, color: dmf.text }}>{lines.join('\n').trim()}</Typography>
        </Box>
      ))}
    </>
  );
}

/** A score as printed: the number, or "?" (stored as "?", or as a negative number). */
const score = (v: number | string | undefined) => (v === undefined || v === '' ? null : typeof v === 'number' && v < 0 ? '?' : String(v));

/**
 * The top of the card text: name, then "LIGHT · Level 4" / "Rank 4" / "LINK-2" (monsters) or
 * "Continuous Trap" (Spells and Traps), the monster's types and its ATK / DEF (Link monsters: ATK
 * only).
 */
function CardHeader({ data }: { data: CardData }) {
  const types = data.typeline ?? [];
  const monster = data.type === 'Monster' || types.length > 0;
  const kind: string[] = [];
  if (monster) {
    if (data.attribute) kind.push(data.attribute);
    if (data.linkRating !== undefined) kind.push(`LINK-${data.linkRating}`);
    else if (data.rank !== undefined) kind.push(`Rank ${data.rank}`);
    else if (data.level !== undefined) kind.push(`${types.includes('Xyz') ? 'Rank' : 'Level'} ${data.level}`);
  } else if (data.type) {
    kind.push(data.property ? `${data.property} ${data.type}` : data.type);
  }
  const atk = score(data.atk);
  const def = score(data.def);
  const scores = [atk && `ATK ${atk}`, def && `DEF ${def}`].filter(Boolean).join(' · ');
  const line = { fontFamily: fonts.display, fontWeight: 600, fontSize: size.ui, lineHeight: 1.5 };

  return (
    <Box>
      {data.name && (
        <Typography component="h3" sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.125rem', lineHeight: 1.25, color: dmf.text, mb: 0.75 }}>
          {data.name}
        </Typography>
      )}
      {kind.length > 0 && <Typography sx={{ ...line, color: dmf.ice }}>{kind.join(' · ')}</Typography>}
      {types.length > 0 && <Typography sx={{ ...line, color: dmf.textMuted }}>{types.join(' / ')}</Typography>}
      {scores && <Typography sx={{ ...line, color: dmf.text }}>{scores}</Typography>}
      <Box role="separator" sx={{ my: 1.5, height: 2, bgcolor: 'rgba(56,200,255,0.3)' }} />
    </Box>
  );
}

/** Note in the card info panel for erratum cards. */
function ErrataBanner() {
  return (
    <Box
      sx={{
        mb: 2,
        px: 2,
        py: 1.25,
        borderLeft: `4px solid ${dmf.orange}`,
        bgcolor: 'rgba(255,138,61,0.1)',
      }}
    >
      <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: dmf.orange, fontSize: size.ui }}>
        Vault Format erratum
      </Typography>
    </Box>
  );
}

/** A card image, or a card back when the image is missing. */
function CardImage({ src, alt, eager = false }: { src: string | null; alt: string; eager?: boolean }) {
  // Image URLs aren't checked in advance: if one fails to load, show the placeholder instead
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) {
    return (
      <Box
        role="img"
        aria-label={alt}
        sx={{
          width: '100%',
          aspectRatio: CARD_RATIO,
          borderRadius: CARD_RADIUS,
          border: '1px solid rgba(56,200,255,0.35)',
          background: `repeating-linear-gradient(45deg, rgba(56,200,255,0.06) 0 6px, transparent 6px 12px), ${dmf.surface}`,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Box sx={{ width: '30%', aspectRatio: '1', border: `2px solid ${dmf.ice}`, transform: 'rotate(45deg)' }} />
      </Box>
    );
  }
  return (
    <Box
      component="img"
      src={src}
      onError={() => setFailed(src)}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      sx={{ display: 'block', width: '100%', height: 'auto', aspectRatio: CARD_RATIO, objectFit: 'cover', borderRadius: CARD_RADIUS }}
    />
  );
}

/** Card data (name, stats, text): undefined while loading, null if there's none. */
type Texts = Record<string, CardData | null | undefined>;
type Lookup = { images: Record<string, string | null>; texts: Texts };

/** Parallel requests when loading card texts. */
const TEXT_REQUESTS = 6;

/**
 * Load the card texts in the background, a few at a time, so the page can show the cards right
 * away. The selected card's text shows as soon as it's in.
 */
function useCardTexts(ids: string[]): Texts {
  const [texts, setTexts] = useState<Texts>({});
  const key = ids.join(',');
  useEffect(() => {
    let alive = true;
    const queue = [...new Set(ids)];
    setTexts({});
    const worker = async () => {
      for (let id = queue.shift(); id !== undefined && alive; id = queue.shift()) {
        const data = await cardData(id).catch(() => null);
        if (alive) setTexts((t) => ({ ...t, [id]: data }));
      }
    };
    for (let i = 0; i < TEXT_REQUESTS; i++) void worker();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return texts;
}

/** A newly selected card settles in; its text fades in. */
const cardIn = keyframes`
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: none; }
`;
const textIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;

/** Big image + card text for the selected card. */
function CardInfo({ card, images, texts, dragScroll = false }: Lookup & { card: string | null; /** Phones: draggable scroll indicator */ dragScroll?: boolean }) {
  if (!card) {
    return (
      <Typography sx={{ color: dmf.textMuted, fontStyle: 'italic', textAlign: 'center', py: 6 }}>
        Click any card to view it here.
      </Typography>
    );
  }
  const data = texts[card];
  const note = (text: string) => <Typography sx={{ fontSize: size.text, color: dmf.textMuted, fontStyle: 'italic' }}>{text}</Typography>;
  const textBody = (
    <>
      {isErrata(card, texts) && <ErrataBanner />}
      {data === undefined ? (
        note('Loading card text…')
      ) : data ? (
        <>
          <CardHeader data={data} />
          {data.desc ? <CardText text={withoutErratumLine(data.desc)} /> : note('No card text.')}
        </>
      ) : (
        note('No card text.')
      )}
    </>
  );
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Card image and text box share the panel's height 40 : 60 (after the 24px gap between
          them); the image's width follows from the card's shape */}
      <Box sx={{ flex: '0 0 calc((100% - 24px) * 0.4)', minHeight: 0, display: 'flex', justifyContent: 'center' }}>
        {/* key={card}: each new card fades in */}
        <Box
          key={card}
          sx={{
            height: '100%',
            aspectRatio: CARD_RATIO,
            filter: `drop-shadow(0 14px 24px rgba(0,0,0,0.55)) drop-shadow(0 0 20px ${dmf.ice}22)`,
            animation: `${cardIn} 180ms ${easeOut}`,
          }}
        >
          <CardImage src={images[card] ?? null} alt={cardName(card, texts)} eager />
        </Box>
      </Box>
      <Box
        sx={{
          mt: 3,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: dmf.surface,
        }}
      >
        {/* key={card}: a new card gets a fresh text box, so its scroll starts at the top (and it fades in) */}
        {dragScroll ? (
          <ScrollArea key={card} sx={{ flex: 1, pl: 2.5, pr: 0.5, pt: 2.5, pb: 1, animation: `${textIn} 180ms ${easeOut}` }}>
            <Box sx={{ pb: 1.5 }}>{textBody}</Box>
          </ScrollArea>
        ) : (
          <Box
            key={card}
            sx={{
              p: 2.5,
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: `${dmf.ice}55 transparent`,
              animation: `${textIn} 180ms ${easeOut}`,
            }}
          >
            {textBody}
          </Box>
        )}
      </Box>
    </Box>
  );
}

function Section({
  section,
  images,
  texts,
  selected,
  onSelect,
  errataTags,
  few,
  sectionRef,
}: {
  sectionRef?: React.Ref<HTMLElement>;
  section: CardSection;
  images: Lookup['images'];
  texts: Texts;
  selected: Selected | null;
  onSelect: (s: Selected) => void;
  errataTags: boolean;
  /** Short card list: bigger cards */
  few: boolean;
}) {
  const { key, label, cards } = section;
  return (
    <Box component="section" ref={sectionRef} sx={{ bgcolor: dmf.surface, p: { xs: 1.5, md: 2.5 } }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 2 }}>
        <Typography component="h2" sx={{ fontFamily: fonts.display, fontWeight: 700, textTransform: 'uppercase', fontSize: { xs: '1.1rem', md: size.sub }, color: dmf.text }}>
          {label}
        </Typography>
        <Typography sx={{ fontFamily: fonts.display, fontWeight: 600, fontSize: size.ui, color: dmf.textMuted }}>
          {cards.length} {cards.length === 1 ? 'card' : 'cards'}
        </Typography>
      </Box>

      {cards.length === 0 ? (
        <Typography sx={{ color: dmf.textMuted, fontStyle: 'italic', fontSize: size.ui }}>Empty</Typography>
      ) : (
        <Box data-card-grid sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(5, 1fr)', sm: `repeat(${few ? 6 : 8}, 1fr)` }, gap: { xs: 0.75, md: 1 } }}>
          {cards.map((card, index) => {
            const active = selected?.section === key && selected.index === index;
            return (
              <Box
                key={`${card}-${index}`}
                component="button"
                type="button"
                data-card={`${key}-${index}`}
                onClick={() => onSelect({ section: key, index, card })}
                aria-label={`Show ${cardName(card, texts)}${isErrata(card, texts) ? ' (Vault Format erratum)' : ''}`}
                aria-pressed={active}
                sx={{
                  p: 0,
                  position: 'relative',
                  border: 0,
                  background: 'none',
                  cursor: 'pointer',
                  display: 'block',
                  borderRadius: CARD_RADIUS,
                  // The selected card stays lifted, with a thick outline
                  outline: active ? `3px solid ${dmf.orange}` : '3px solid transparent',
                  outlineOffset: 2,
                  transform: active ? 'translateY(-4px)' : 'none',
                  transition: `transform 150ms ${easeOut}, outline-color 150ms`,
                  [canHover]: { '&:hover': { transform: 'translateY(-4px)' } },
                  '&:active': { transform: 'scale(0.96)' },
                  // Keyboard focus: blue, except on the selected card (focused while stepping with ← →)
                  '&:focus-visible': { outline: `3px solid ${active ? dmf.orange : dmf.ice}` },
                }}
              >
                <CardImage src={images[card] ?? null} alt={cardName(card, texts)} />
                {errataTags && isErrata(card, texts) && <ErrataTag />}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

export default function CardBrowser({
  sections,
  images,
  errataTags = true,
}: Omit<Lookup, 'texts'> & {
  sections: CardSection[];
  /** Show the small "E" tag on erratum cards (off on the errata page, where every card is one). */
  errataTags?: boolean;
}) {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true });
  // Every card in order (Main Deck, then Extra Deck), for stepping through them
  const all = useMemo(() => sections.flatMap((s) => s.cards.map((card, index) => ({ section: s.key, index, card }))), [sections]);
  // The first card is selected from the start, so the panel never starts empty
  const [selected, setSelected] = useState<Selected | null>(() => all[0] ?? null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const panel = usePanelHeight(desktop);
  const few = all.length <= FEW_CARDS;
  // Texts load in the background once the cards are on screen
  const texts = useCardTexts(all.map((c) => c.card));

  const select = (s: Selected) => {
    setSelected(s);
    if (!desktop) setSheetOpen(true);
  };

  // The card before (-1) or after (+1) the selected one; stops at the first and last card
  const at = all.findIndex((c) => c.section === selected?.section && c.index === selected.index);
  const neighbour = (dir: -1 | 1) => all[at + dir] ?? null;
  const step = (dir: -1 | 1) => {
    const to = neighbour(dir);
    if (!to) return;
    setSelected(to);
    // Desktop: keep the selected card in view and focused, so the arrow keys carry on from it
    if (desktop) {
      const button = document.querySelector<HTMLElement>(`[data-card="${to.section}-${to.index}"]`);
      button?.focus({ preventScroll: true });
      button?.scrollIntoView({ block: 'nearest' });
    }
  };
  const stepRef = useRef(step);
  stepRef.current = step;

  // Desktop: ← and → step through the cards (not while typing in a field)
  useEffect(() => {
    if (!desktop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if ((e.target as Element | null)?.closest?.('input, textarea, [contenteditable]')) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        stepRef.current(e.key === 'ArrowLeft' ? -1 : 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [desktop]);

  // Phones: a sideways swipe on the sheet steps to the card before / after
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    swipeStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > 1.5 * Math.abs(dy)) step(dx < 0 ? 1 : -1);
  };

  return (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px 1fr' }, gap: { xs: 3, md: 4 }, alignItems: 'stretch', mt: 4 }}>
        {/* Card + card text is always as tall as a 40-card Main Deck box. The aside spans the
            whole card column and the panel sticks below the header while scrolling, so it travels
            from the top of the Main Deck to the bottom of the last box. On short windows it's
            capped so it always fits on screen. */}
        <Box component="aside" sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ position: 'sticky', top: PANEL_TOP, height: panel.height ?? 870, maxHeight: 'calc(100vh - 120px)' }}>
            <CardInfo card={selected?.card ?? null} images={images} texts={texts} />
          </Box>
        </Box>

        {/* The last card box stretches so both columns end at the same line. */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 }, '& > section:last-of-type': { flexGrow: 1 } }}>
          {sections.map((s, i) => (
            <Section key={s.key} sectionRef={i === 0 ? panel.ref : undefined} section={s} images={images} texts={texts} selected={selected} onSelect={select} errataTags={errataTags} few={few} />
          ))}
        </Box>
      </Box>

      {/* Phones: card info slides up from the bottom; drag it down to close, swipe sideways or use
          the arrows beside the card for the card before / after */}
      <SwipeableDrawer
        anchor="bottom"
        open={!desktop && sheetOpen}
        onOpen={() => setSheetOpen(true)}
        onClose={() => setSheetOpen(false)}
        disableSwipeToOpen
        slotProps={{ paper: { sx: { bgcolor: dmf.bg, backgroundImage: 'none', maxHeight: '88vh', p: 2.5, pt: 3 } } }}
      >
        {/* Drag handle */}
        <Box aria-hidden sx={{ position: 'absolute', top: 8, left: '50%', ml: '-20px', width: 40, height: 4, borderRadius: 2, bgcolor: 'rgba(232,238,247,0.3)' }} />
        {/* Close button level with the top of the card (pt 3 = the card → text gap) */}
        <IconButton
          aria-label="Close card"
          onClick={() => setSheetOpen(false)}
          sx={{ position: 'absolute', top: 16, right: 12, zIndex: 1, color: dmf.text }}
        >
          <CloseIcon />
        </IconButton>
        <Box sx={{ position: 'relative', height: '75vh' }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <CardInfo card={selected?.card ?? null} images={images} texts={texts} dragScroll />
          {/* Previous / next, level with the middle of the card image (40% of the height after the 24px gap) */}
          {([-1, 1] as const).map((dir) => (
            <IconButton
              key={dir}
              aria-label={dir < 0 ? 'Previous card' : 'Next card'}
              disabled={!neighbour(dir)}
              onClick={() => step(dir)}
              sx={{
                position: 'absolute',
                top: 'calc((100% - 24px) * 0.2)',
                [dir < 0 ? 'left' : 'right']: -8,
                transform: 'translateY(-50%)',
                color: dmf.text,
                '&.Mui-disabled': { color: 'rgba(232,238,247,0.2)' },
              }}
            >
              {dir < 0 ? <ChevronLeftIcon fontSize="large" /> : <ChevronRightIcon fontSize="large" />}
            </IconButton>
          ))}
        </Box>
      </SwipeableDrawer>
    </>
  );
}
