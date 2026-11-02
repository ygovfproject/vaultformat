'use client';

import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { canHover, dmf, easeOut, fonts, size } from '@/theme';
import { cardText, isErratum, withoutErratumLine } from '@/lib/fileServer';
import ScrollArea from './ScrollArea';

/**
 * Card grid + card info panel, shared by the deck pages and the errata page.
 * Desktop: info panel on the left, as tall as 5 rows of the first card box (the Main Deck).
 * Phones: tapping a card opens the info panel from the bottom.
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
const isErrata = (card: string, texts: Texts) => isErratum(card, texts[card]);

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
          {i > 0 && <Box role="separator" sx={{ my: 1.5, height: '1px', background: `linear-gradient(90deg, ${dmf.ice}99, ${dmf.ice}22)` }} />}
          <Typography sx={{ whiteSpace: 'pre-line', fontSize: size.text, lineHeight: 1.65, color: dmf.text }}>{lines.join('\n').trim()}</Typography>
        </Box>
      ))}
    </>
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

/** Card texts: undefined while loading, '' if there's none. */
type Texts = Record<string, string | undefined>;
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
        const text = await cardText(id).catch(() => '');
        if (alive) setTexts((t) => ({ ...t, [id]: text }));
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

/** Big image + card text for the selected card. */
function CardInfo({ card, images, texts, dragScroll = false }: Lookup & { card: string | null; /** Phones: draggable scroll indicator */ dragScroll?: boolean }) {
  if (!card) {
    return (
      <Typography sx={{ color: dmf.textMuted, fontStyle: 'italic', textAlign: 'center', py: 6 }}>
        Click any card to view it here.
      </Typography>
    );
  }
  const text = texts[card];
  const textBody = (
    <>
      {isErrata(card, texts) && <ErrataBanner />}
      {text === undefined ? (
        <Typography sx={{ fontSize: size.text, color: dmf.textMuted, fontStyle: 'italic' }}>Loading card text…</Typography>
      ) : text ? (
        <CardText text={withoutErratumLine(text)} />
      ) : (
        <Typography sx={{ fontSize: size.text, color: dmf.textMuted, fontStyle: 'italic' }}>No card text.</Typography>
      )}
    </>
  );
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Box
        sx={{
          flexShrink: 0,
          width: '100%',
          maxWidth: dragScroll ? 198 : 220, // phones: 10% smaller, the text box gets the height
          mx: 'auto',
          mt: dragScroll ? 0 : 2, // phones: the sheet's top padding matches the card → text gap
          filter: `drop-shadow(0 14px 24px rgba(0,0,0,0.55)) drop-shadow(0 0 20px ${dmf.ice}22)`,
        }}
      >
        <CardImage src={images[card] ?? null} alt={`Card ${card}`} eager />
      </Box>
      <Box
        sx={{
          mt: 3,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(56,200,255,0.18)',
          bgcolor: 'rgba(6,14,28,0.6)',
        }}
      >
        {/* key={card}: a new card gets a fresh text box, so its scroll starts at the top */}
        {dragScroll ? (
          <ScrollArea key={card} sx={{ flex: 1, pl: 2.5, pr: 0.5, pt: 2.5, pb: 1 }}>
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
    <Box component="section" ref={sectionRef} sx={{ border: '1px solid rgba(56,200,255,0.18)', bgcolor: 'rgba(6,14,28,0.55)', p: { xs: 1.5, md: 2.5 } }}>
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
                onClick={() => onSelect({ section: key, index, card })}
                aria-label={`Show card ${card}${isErrata(card, texts) ? ' (Vault Format erratum)' : ''}`}
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
                  '&:focus-visible': { outline: `3px solid ${dmf.ice}` },
                }}
              >
                <CardImage src={images[card] ?? null} alt={`Card ${card}`} />
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
  // No card is selected until the user clicks one.
  const [selected, setSelected] = useState<Selected | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const panel = usePanelHeight(desktop);
  const few = sections.reduce((n, s) => n + s.cards.length, 0) <= FEW_CARDS;
  // Texts load in the background once the cards are on screen
  const texts = useCardTexts(sections.flatMap((s) => s.cards));

  const select = (s: Selected) => {
    setSelected(s);
    if (!desktop) setSheetOpen(true);
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

      {/* Phones: card info slides up from the bottom */}
      <Drawer
        anchor="bottom"
        open={!desktop && sheetOpen}
        onClose={() => setSheetOpen(false)}
        slotProps={{ paper: { sx: { bgcolor: dmf.bg, backgroundImage: 'none', maxHeight: '88vh', p: 2.5, pt: 3 } } }}
      >
        {/* Close button level with the top of the card (pt 3 = the card → text gap) */}
        <IconButton
          aria-label="Close card"
          onClick={() => setSheetOpen(false)}
          sx={{ position: 'absolute', top: 16, right: 12, zIndex: 1, color: dmf.text }}
        >
          <CloseIcon />
        </IconButton>
        <Box sx={{ height: '75vh' }}>
          <CardInfo card={selected?.card ?? null} images={images} texts={texts} dragScroll />
        </Box>
      </Drawer>
    </>
  );
}
