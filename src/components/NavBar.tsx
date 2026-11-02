'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { NAV_ITEMS } from '@/lib/nav';
import { canHover, dmf, easeOut, fonts, size } from '@/theme';

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

function Logo() {
  return (
    <Box
      component={NextLink}
      href="/"
      aria-label="Vault Format home"
      sx={{ display: 'flex', alignItems: 'center', gap: 1.25, textDecoration: 'none', mr: 'auto' }}
    >
      <Box
        aria-hidden
        sx={{
          width: 18,
          height: 18,
          border: `2px solid ${dmf.ice}`,
          transform: 'rotate(45deg)',
          position: 'relative',
          '&::after': { content: '""', position: 'absolute', inset: 3, bgcolor: dmf.orange },
        }}
      />
      <Box
        component="span"
        sx={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: '1.6rem',
          letterSpacing: '0.12em',
          // Solid orange at the top, solid blue at the bottom, a short blend in the middle.
          background: `linear-gradient(180deg, ${dmf.orange} 30%, ${dmf.ice} 70%)`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        VAULT FORMAT
      </Box>
    </Box>
  );
}

const linkSx = (active: boolean) => ({
  position: 'relative' as const,
  px: 2,
  py: 1,
  fontFamily: fonts.display,
  fontWeight: 600,
  fontSize: size.ui,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  textDecoration: 'none',
  color: active ? dmf.orange : dmf.text,
  transition: 'color 150ms',
  // Current page: no hover effect. Other pages: text turns blue.
  ...(active ? { cursor: 'default' } : { [canHover]: { '&:hover': { color: dmf.ice } } }),
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 2,
    height: 2,
    bgcolor: dmf.orange,
    transform: active ? 'scaleX(1)' : 'scaleX(0)',
    transformOrigin: 'left',
    transition: `transform 200ms ${easeOut}`,
  },
});

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ bgcolor: dmf.header, borderBottom: `1px solid rgba(255,255,255,0.06)`, backgroundImage: 'none' }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
          <Logo />

          <Box component="nav" sx={{ display: { xs: 'none', sm: 'flex' }, gap: 0.5 }}>
            {NAV_ITEMS.map((item) => (
              <Box key={item.href} component={NextLink} href={item.href} sx={linkSx(isActive(pathname, item.href))}>
                {item.label}
              </Box>
            ))}
          </Box>

          <IconButton
            sx={{
              display: { xs: 'inline-flex', sm: 'none' },
              color: dmf.text,
              borderRadius: 1,
              '&:hover': { bgcolor: 'transparent', color: dmf.orange },
            }}
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{ paper: { sx: { width: '100%', maxWidth: 320, bgcolor: dmf.header, p: 3 } } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          <IconButton
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            sx={{ color: dmf.text, '&:hover': { bgcolor: 'transparent', color: dmf.orange } }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box component="nav" sx={{ display: 'grid', gap: 1 }}>
          {NAV_ITEMS.map((item) => (
            <Box
              key={item.href}
              component={NextLink}
              href={item.href}
              onClick={() => setOpen(false)}
              sx={{ ...linkSx(isActive(pathname, item.href)), fontSize: size.sub, fontFamily: fonts.display, fontWeight: 700 }}
            >
              {item.label}
            </Box>
          ))}
        </Box>
      </Drawer>
    </AppBar>
  );
}
