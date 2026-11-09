'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { dmf, fonts, size } from '@/theme';
import { formatDate, type DeckJson, type Update } from '@/lib/content';
import Markdown from '../Markdown';
import { Subtitle, Title } from '../Decor';
import PageShell, { PAGE_TITLE_SIZE } from '../PageShell';

/**
 * Placeholders in an update's .md: [decks] becomes the update's decks (each a chip linking to it),
 * [n] the number of them.
 */
function fillPlaceholders(text: string, decks: DeckJson[]): string {
  // Read as a sentence: "A, B and C"
  const links = decks.map((d) => `[${d.title.replace(/[[\]]/g, '')}](/deck/?d=${encodeURIComponent(d.id)})`);
  const list = links.length > 1 ? `${links.slice(0, -1).join(', ')} and ${links[links.length - 1]}` : (links[0] ?? '');
  return text.replace(/\[decks\]/gi, list).replace(/\[n\]/gi, String(decks.length));
}

function UpdateEntry({ update, decks, latest = false, first = false }: { update: Update; decks: DeckJson[]; latest?: boolean; /** The oldest update: named "Launch" if it has no title */ first?: boolean }) {
  return (
    <Box
      component="article"
      sx={{
        position: 'relative',
        pl: { xs: 3, md: 4 },
        pb: 6,
        '&:last-of-type': { pb: 0 },
        // Timeline line + diamond marker
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 5,
          top: 10,
          bottom: 0,
          width: 2,
          bgcolor: 'rgba(56,200,255,0.2)',
        },
        '&:last-of-type::before': { display: 'none' },
        '&::after': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 6,
          width: 12,
          height: 12,
          transform: 'rotate(45deg)',
          bgcolor: dmf.ice, // the "Latest" badge marks the newest; orange is only for things you can click
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
        <Typography component="time" sx={{ fontFamily: fonts.display, fontWeight: 700, letterSpacing: '0.04em', color: dmf.ice, fontSize: size.ui }}>
          {formatDate(update.date)}
        </Typography>
        {latest && (
          <Box component="span" sx={{ px: 1, py: 0.25, fontFamily: fonts.display, fontSize: size.small, fontWeight: 700, color: dmf.ink, bgcolor: dmf.orange }}>
            Latest
          </Box>
        )}
      </Box>
      <Typography variant="h4" component="h2" sx={{ color: dmf.text, mb: 1.5 }}>
        {update.title.trim() || (first ? 'Launch' : 'Update')}
      </Typography>
      {update.description && (
        <Box
          sx={{
            '& p, & li': { fontSize: size.text },
            // Links to decks ([decks]) read as part of the sentence: body-colour text with an orange
            // underline (orange = clickable), not a wall of bold orange links
            '& a[href*="/deck/?d="]': {
              color: dmf.text,
              fontWeight: 500,
              textDecoration: 'underline',
              textDecorationColor: 'rgba(255,138,61,0.6)',
              textDecorationThickness: '1px',
              textUnderlineOffset: '3px',
              whiteSpace: 'nowrap',
              transition: 'color 150ms, text-decoration-color 150ms',
              '&:hover': { color: dmf.orange, textDecorationColor: dmf.orange },
            },
          }}
        >
          <Markdown>{fillPlaceholders(update.description, decks)}</Markdown>
        </Box>
      )}
    </Box>
  );
}

/** /updates/: every update, newest first, with the decks it added. */
export default function UpdatesView({ updates, decks }: { updates: Update[]; decks: DeckJson[] }) {
  return (
    <PageShell>
      <Title variant="h1" component="h1" sx={{ fontSize: PAGE_TITLE_SIZE, mb: 3 }}>
        Updates
      </Title>
      <Subtitle>Every update to the Vault Format pool, newest first. Released decks never change, so an update only ever adds decks.</Subtitle>
      <Box sx={{ mt: { xs: 5, md: 6 }, maxWidth: 760 }}>
        {updates.length === 0 ? (
          <Typography sx={{ color: dmf.text }}>No updates yet.</Typography>
        ) : (
          updates.map((u, i) => (
            <UpdateEntry
              key={u.id}
              update={u}
              latest={i === 0 && updates.length > 1}
              first={i === updates.length - 1}
              decks={decks.filter((d) => String(d.update_id) === String(u.id)).sort((a, b) => a.title.localeCompare(b.title))}
            />
          ))
        )}
      </Box>
    </PageShell>
  );
}
