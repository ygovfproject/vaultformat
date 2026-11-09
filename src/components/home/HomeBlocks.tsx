'use client';

import NextLink from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import type { SvgIconComponent } from '@mui/icons-material';
import StyleIcon from '@mui/icons-material/Style';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import BalanceIcon from '@mui/icons-material/Balance';
import BoltIcon from '@mui/icons-material/Bolt';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { canHover, dmf, easeOut, fonts, size } from '@/theme';
import type { MdSection } from '@/lib/sections';
import { Title, NotchButton, PixelEdge } from '../Decor';
import Markdown from '../Markdown';

/** One vertical spacing for every block on the page, so the rhythm down the page is even. */
export const BLOCK_PY = 'clamp(64px, 8vw, 112px)';
/** Block heading size (h2). */
const H2_SIZE = { xs: '2.25rem', md: '3rem' };

/**
 * An icon for a point, picked from words in its heading. Unknown headings get a number instead,
 * so new text in philosophy.md never breaks the layout.
 */
const ICONS: [RegExp, SvgIconComponent][] = [
  [/deck|budget|pick/i, StyleIcon],
  [/frozen|release|change/i, AcUnitIcon],
  [/table|real|paper/i, TableRestaurantIcon],
  [/balance/i, BalanceIcon],
  [/power|level/i, BoltIcon],
  [/archetype|identity/i, FingerprintIcon],
];

function PointMarker({ title, index }: { title: string; index: number }) {
  const Icon = ICONS.find(([re]) => re.test(title))?.[1];
  return (
    <Box
      aria-hidden
      sx={{
        width: 48,
        height: 48,
        display: 'grid',
        placeItems: 'center',
        border: `2px solid ${dmf.ice}`,
        color: dmf.ice,
        fontFamily: fonts.display,
        fontWeight: 700,
        fontSize: size.ui,
        flexShrink: 0,
      }}
    >
      {Icon ? <Icon /> : String(index + 1).padStart(2, '0')}
    </Box>
  );
}

function Block({ id, bg, children }: { id?: string; bg: string; children: React.ReactNode }) {
  return (
    <Box component="section" id={id} sx={{ position: 'relative', scrollMarginTop: 72, py: BLOCK_PY, bgcolor: bg }}>
      <Container maxWidth="lg">{children}</Container>
    </Box>
  );
}

/** A block of points ("How it works", "How balance works"): heading and intro, then the points side by side, each with its icon. */
export function ColumnsBlock({ section, intro, items, bg }: { section: MdSection; intro: string; items: MdSection[]; bg: string }) {
  return (
    <Block id={section.id} bg={bg}>
      <Title variant="h2" component="h2" sx={{ fontSize: H2_SIZE, mb: intro ? 2 : { xs: 5, md: 7 } }}>
        {section.title}
      </Title>
      {intro && (
        <Box sx={{ mb: { xs: 5, md: 7 } }}>
          <Markdown>{intro}</Markdown>
        </Box>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: `repeat(${Math.min(items.length, 3)}, 1fr)` },
          gap: { xs: 6, md: 6 },
        }}
      >
        {items.map((item, i) => (
          <Box key={item.id} component="article" id={item.id}>
            <PointMarker title={item.title} index={i} />
            <Typography variant="h3" component="h3" sx={{ color: dmf.text, mt: 3, mb: 2, fontSize: { xs: '1.5rem', md: '1.6rem' } }}>
              {item.title}
            </Typography>
            <Box sx={{ '& p, & li': { fontSize: size.text } }}>
              <Markdown>{item.body}</Markdown>
            </Box>
          </Box>
        ))}
      </Box>
    </Block>
  );
}

/** A plain block: heading over its text, one comfortable column. */
export function TextBlock({ section, bg }: { section: MdSection; bg: string }) {
  return (
    <Block id={section.id} bg={bg}>
      <Box sx={{ maxWidth: 760 }}>
        <Title variant="h2" component="h2" sx={{ fontSize: H2_SIZE, mb: 3 }}>
          {section.title}
        </Title>
        <Markdown>{section.body}</Markdown>
      </Box>
    </Block>
  );
}

export type Boss = { deckId: string; deckTitle: string; name: string; image: string };

/** Card ratio and corners, as on the deck pages. */
const CARD_RATIO = '59 / 86';
const CARD_RADIUS = '3.5% / 2.4%';

function BossCard({ boss }: { boss: Boss }) {
  return (
    <Box
      component={NextLink}
      href={`/deck/?d=${encodeURIComponent(boss.deckId)}`}
      sx={{
        display: 'block',
        textDecoration: 'none',
        color: dmf.ink,
        scrollSnapAlign: 'start',
        '& img': { transition: `transform 200ms ${easeOut}, box-shadow 200ms ${easeOut}` },
        [canHover]: {
          '&:hover img': { transform: 'translateY(-6px)', boxShadow: '0 18px 30px rgba(10,22,40,0.45)' },
          '&:hover .name': { textDecorationThickness: 2 },
        },
      }}
    >
      <Box
        component="img"
        src={boss.image}
        alt={boss.name}
        loading="lazy"
        decoding="async"
        sx={{ display: 'block', width: '100%', height: 'auto', aspectRatio: CARD_RATIO, objectFit: 'cover', borderRadius: CARD_RADIUS, boxShadow: '0 10px 22px rgba(10,22,40,0.35)' }}
      />
      {/* The deck as a small line above, the boss as the label: the boss's name often contains
          the deck's ("Ancient Gear Golem"), so it reads once instead of twice */}
      <Typography sx={{ mt: 1.5, fontFamily: fonts.display, fontWeight: 600, fontSize: size.small, lineHeight: 1.3, color: 'rgba(10,22,40,0.75)' }}>
        {boss.deckTitle}
      </Typography>
      <Typography
        className="name"
        sx={{ mt: 0.25, fontFamily: fonts.display, fontWeight: 700, fontSize: size.ui, lineHeight: 1.25, textDecoration: 'underline', textUnderlineOffset: 3, textDecorationThickness: 1 }}
      >
        {boss.name}
      </Typography>
    </Box>
  );
}

/**
 * "Every deck has a boss": the page's one bright band, with a row of real boss cards, each
 * linking to its deck. The row scrolls sideways on phones.
 */
export function BossBlock({ section, bosses, prevColor, nextColor }: { section: MdSection; bosses: Boss[] | null; prevColor: string; nextColor: string }) {
  return (
    <Box component="section" id={section.id} sx={{ position: 'relative', overflow: 'clip', scrollMarginTop: 72, py: BLOCK_PY, bgcolor: dmf.ice }}>
      <PixelEdge color={prevColor} flip seed={23} />
      <Container maxWidth="lg">
        <Box sx={{ maxWidth: 760 }}>
          <Title variant="h2" component="h2" sx={{ color: dmf.ink, fontSize: H2_SIZE, mb: 3 }}>
            {section.title}
          </Title>
          <Markdown tone="ice">{section.body}</Markdown>
        </Box>
        {/* Space for the row is kept while it loads; no row at all if there are no decks */}
        {(bosses === null || bosses.length > 0) && (
          <Box
            sx={{
              mt: { xs: 5, md: 7 },
              display: 'grid',
              gridAutoFlow: { xs: 'column', md: 'row' },
              gridAutoColumns: { xs: '42%', sm: '28%' },
              gridTemplateColumns: { md: 'repeat(6, 1fr)' },
              gap: { xs: 2, md: 3 },
              overflowX: { xs: 'auto', md: 'visible' },
              scrollSnapType: { xs: 'x mandatory', md: 'none' },
              // No scrollbar on the bright band: the half-shown next card already says it scrolls
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              // Room for the hover lift and shadows inside the scroll box
              pt: 1,
              pb: 2,
              minHeight: bosses === null ? { xs: 300, md: 340 } : undefined,
            }}
          >
            {bosses?.map((b) => <BossCard key={b.deckId} boss={b} />)}
          </Box>
        )}
      </Container>
      <PixelEdge color={nextColor} seed={41} />
    </Box>
  );
}

/** The page's last block: an invitation to pick a deck. */
export function ClosingCta({ deckCount, bg }: { deckCount: number | null; bg: string }) {
  return (
    <Box component="section" sx={{ py: BLOCK_PY, bgcolor: bg }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: { md: 'flex-end' }, justifyContent: 'space-between', gap: 4 }}>
          <Box sx={{ maxWidth: 640 }}>
            <Title variant="h2" component="h2" sx={{ fontSize: H2_SIZE, mb: 2 }}>
              Pick a deck
            </Title>
            <Typography sx={{ color: dmf.text }}>
              {deckCount ? `${deckCount} decks, each built around its boss and ready to play.` : 'Every deck is built around its boss and ready to play.'} Find yours, shuffle up and duel.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
            <NotchButton href="/decks">Browse decks</NotchButton>
            <NotchButton href="/rules" variant="ghost">
              Read the rules
            </NotchButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
