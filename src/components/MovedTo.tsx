'use client';

import { useEffect } from 'react';
import NextLink from 'next/link';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { withBase } from '@/lib/basePath';
import { dmf } from '@/theme';
import PageShell from './PageShell';

/** A page that has moved: forwards to its new address right away, keeping the #anchor. */
export default function MovedTo({ path, label }: { path: string; label: string }) {
  useEffect(() => {
    window.location.replace(withBase(path) + window.location.search + window.location.hash);
  }, [path]);
  return (
    <PageShell>
      <Typography sx={{ color: dmf.text }}>
        This page has moved to{' '}
        <Link component={NextLink} href={path} underline="always" sx={{ color: dmf.orange, fontWeight: 600 }}>
          {label}
        </Link>
        .
      </Typography>
    </PageShell>
  );
}
