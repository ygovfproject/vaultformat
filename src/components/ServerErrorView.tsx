'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { withBase } from '@/lib/basePath';
import { Title, NotchButton, Subtitle, pageBg } from './Decor';
import { RETURN_KEY } from '@/lib/serverError';
import { FaceDownCards } from './cards/CardAnimations';

/** 500 page: the file server is down, so cards and decks can't be shown right now. */
export default function ServerErrorView() {
  const retry = () => {
    let to = '/';
    try {
      to = window.sessionStorage.getItem(RETURN_KEY) || '/';
    } catch {
      /* storage blocked: go home */
    }
    // A full reload, so the page checks the file server again
    window.location.href = to.startsWith('/') ? (to.startsWith(withBase('/')) ? to : withBase(to)) : withBase('/');
  };

  return (
    <Box sx={{ ...pageBg, minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', py: { xs: 8, md: 10 } }}>
      <Container maxWidth="lg">
        {/* Text left, two face-down cards right (above the text on phones). The card backs are the
            site's own image, so they show even though the file server is down. */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, alignItems: 'center', gap: { xs: 3, md: 8 } }}>
          <Box sx={{ order: { md: 2 }, mr: { md: 6 } }}>
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <FaceDownCards width={80} />
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <FaceDownCards width={220} />
            </Box>
          </Box>
          <Box>
            <Title variant="h1" component="h1" sx={{ fontSize: { xs: '3rem', md: '5rem' }, mb: 3 }}>
              The deck slipped
            </Title>
            <Subtitle>
              Error 500: the cards and decks live on a separate server, and it isn&apos;t answering right now. It&apos;s not
              you: try again in a few minutes.
            </Subtitle>
            <Box sx={{ mt: 4 }}>
              <NotchButton onClick={retry}>Try again</NotchButton>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
