'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { canHover, dmf, fonts, size } from '@/theme';
import type { Update } from '@/lib/content';
import Markdown from '../Markdown';

function UpdateEntry({ update, latest = false }: { update: Update; latest?: boolean }) {
  return (
    <Box
      component="article"
      sx={{
        position: 'relative',
        pl: { xs: 3, md: 4 },
        pb: 4,
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
        '&::after': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 6,
          width: 12,
          height: 12,
          transform: 'rotate(45deg)',
          bgcolor: latest ? dmf.orange : dmf.ice,
          boxShadow: latest ? `0 0 16px ${dmf.orange}` : 'none',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
        <Typography
          component="time"
          sx={{ fontFamily: fonts.display, fontWeight: 700, letterSpacing: '0.12em', color: dmf.ice, fontSize: size.ui }}
        >
          {update.date}
        </Typography>
        {latest && (
          <Box
            component="span"
            sx={{
              px: 1,
              py: 0.25,
              fontFamily: fonts.display,
              fontSize: size.small,
              fontWeight: 700,
              color: dmf.ink,
              bgcolor: dmf.orange,
            }}
          >
            Latest
          </Box>
        )}
      </Box>
      <Typography variant="h4" component="h3" sx={{ color: dmf.text, mb: 1.5 }}>
        {update.title}
      </Typography>
      {update.description && (
        <Box sx={{ '& p, & li': { fontSize: size.text } }}>
          <Markdown>{update.description}</Markdown>
        </Box>
      )}
    </Box>
  );
}

/**
 * Changelog: only the newest update is shown until the user expands the list. Desktop: heading on
 * the left, the updates on the right (like the Main page's sections).
 */
export default function UpdatesSection({ updates }: { updates: Update[] }) {
  const [open, setOpen] = useState(false);
  if (updates.length === 0) return null;
  const [latest, ...older] = updates;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' }, columnGap: 8 }}>
      <Typography component="h2" variant="h2" sx={{ color: dmf.text, fontSize: { xs: '2rem', md: '2.4rem' }, mb: 4 }}>
        Updates
      </Typography>

      <Box>
        <UpdateEntry update={latest} latest />

        {older.length > 0 && (
          <>
            <Collapse in={open} unmountOnExit>
              {older.map((u) => (
                <UpdateEntry key={u.id} update={u} />
              ))}
            </Collapse>
            <ButtonBase
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              sx={{
                mb: 3,
                gap: 1,
                px: 2,
                py: 1,
                fontFamily: fonts.display,
                fontWeight: 700,
                fontSize: size.ui,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: dmf.ice,
                bgcolor: 'rgba(56,200,255,0.1)',
                transition: 'background-color 150ms',
                [canHover]: { '&:hover': { bgcolor: 'rgba(56,200,255,0.2)' } },
              }}
            >
              {open ? 'Hide older updates' : `Show all updates (${updates.length})`}
              <ExpandMoreIcon fontSize="small" sx={{ transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'none' }} />
            </ButtonBase>
          </>
        )}
      </Box>
    </Box>
  );
}
