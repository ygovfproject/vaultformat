'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import { Title, NotchButton, Subtitle, pageBg } from './Decor';
import { FaceDownCards, ShuffleStack } from './cards/CardAnimations';
import { useCardFeed } from './cards/useCardFeed';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

/** The shuffling stack. Its own component so the card loading only starts when it's shown. */
function Shuffle({ cards }: { cards: string[] }) {
  // Start with 8 cards (the full stack), then load one more every 3 seconds.
  const feed = useCardFeed(cards, { initial: 8, everyMs: 3000 });
  if (feed.length === 0) return null;
  return <ShuffleStack cards={feed} complete={feed.length === cards.length} />;
}

/**
 * "Not found" page: a shuffling card stack next to the message. Used for the 404 and for a deck
 * link that doesn't match any deck. (Reduced motion: the stack stands still.)
 */
export default function NotFoundView({
  cards,
  title = 'Card not found',
  text = 'Error 404: this page isn’t in the deck. It may have been moved, or the link is wrong. Shuffling for a better one…',
  children,
}: {
  cards: string[];
  title?: string;
  text?: React.ReactNode;
  /** Shown under the text (e.g. "Did you mean …?") */
  children?: React.ReactNode;
}) {
  // Desktop only: phones get no stack and download no card images.
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box
      sx={{
        ...pageBg,
        minHeight: 'calc(100vh - 72px)',
        // The card sliding out of the stack pokes past the right edge for a moment;
        // clip it so the page doesn't get a horizontal scrollbar.
        overflowX: 'clip',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 8, md: 10 },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, alignItems: 'center', gap: { xs: 4, md: 8 } }}>
          <Box>
            {/* Phones: no shuffling stack (it would download card images), just two card backs */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
              <FaceDownCards width={80} />
            </Box>
            <Title variant="h1" component="h1" sx={{ fontSize: { xs: '3rem', md: '5rem' }, mb: 3 }}>
              {title}
            </Title>
            <Subtitle>{text}</Subtitle>
            {children}
            <Stack direction="row" sx={{ gap: 2.5, flexWrap: 'wrap', mt: 5 }}>
              <NotchButton href="/">Back to home</NotchButton>
              <NotchButton href="/decks" variant="ghost">
                Browse decks
              </NotchButton>
            </Stack>
          </Box>

          {desktop && cards.length > 0 && (
            // mr: the stack's back cards reach past its box on the right; this keeps them inside the page's edge
            <Box aria-hidden sx={{ display: 'flex', justifyContent: 'center', mr: 4 }}>
              <Shuffle cards={cards} />
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
