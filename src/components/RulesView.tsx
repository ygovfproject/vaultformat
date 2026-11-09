'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import ListIcon from '@mui/icons-material/FormatListBulleted';
import CloseIcon from '@mui/icons-material/Close';
import { dmf, fonts, size } from '@/theme';
import { splitMarkdown } from '@/lib/sections';
import { formatDate } from '@/lib/content';
import { VERSION_LINE, downloadRulesPdf, rulesDate, rulesPdfBytes, rulesVersion } from '@/lib/rulesPdf';
import { Title, NotchButton } from './Decor';
import PageShell, { PAGE_TITLE_SIZE } from './PageShell';
import Markdown from './Markdown';

/**
 * Turn rule references into links: "§2.5" -> the paragraph starting with **2.5** (#rule-2-5),
 * "§6" -> section 6. References to rules or sections that don't exist stay plain text, and text
 * that's already a link isn't touched. Only for the page; the PDF shows plain references.
 */
function linkRuleRefs(markdown: string, sections: { id: string; title: string }[]): string {
  const rules = new Set([...markdown.matchAll(/\*\*(\d+\.\d+)\*\*/g)].map((m) => m[1]));
  const sectionIds = new Map<string, string>();
  for (const s of sections) {
    const m = /^(\d+)\./.exec(s.title);
    if (m) sectionIds.set(m[1], s.id);
  }
  return markdown.replace(/(?<!\[)§(\d+)(?:\.(\d+))?/g, (ref, major: string, minor?: string) => {
    if (minor !== undefined) return rules.has(`${major}.${minor}`) ? `[${ref}](#rule-${major}-${minor})` : ref;
    const id = sectionIds.get(major);
    return id ? `[${ref}](#${id})` : ref;
  });
}

/** How far below the top of the window a section counts as "being read" (the header is 72px). */
const READ_LINE = 140;

/**
 * The section being read: the last one whose top has passed the reading line. Worked out on every
 * scroll (and resize), so it's right in both directions; near the top of the page it's always the
 * first section, and at the very bottom the last one.
 */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  useEffect(() => {
    if (ids.length === 0) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
      if (els.length === 0) return;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let current = els[0].id;
      if (atBottom) current = els[els.length - 1].id;
      else for (const el of els) if (el.getBoundingClientRect().top <= READ_LINE) current = el.id;
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids]);
  return active;
}

/** "180 KB" */
const fileSize = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);

function Contents({ sections, active, onPick }: { sections: { id: string; title: string }[]; active: string | null; onPick?: () => void }) {
  return (
    <>
      <Typography component="h2" sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: size.text, color: dmf.text, mb: 1.5 }}>
        Contents
      </Typography>
      <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0, borderLeft: '2px solid rgba(232,238,247,0.15)' }}>
        {sections.map((s) => {
          const on = active === s.id;
          return (
            <Box component="li" key={s.id}>
              <Box
                component="a"
                href={`#${s.id}`}
                onClick={onPick}
                aria-current={on ? 'location' : undefined}
                sx={{
                  display: 'block',
                  py: 0.75,
                  pl: 2,
                  ml: '-2px',
                  borderLeft: `2px solid ${on ? dmf.orange : 'transparent'}`,
                  textDecoration: 'none',
                  fontSize: size.ui,
                  lineHeight: 1.35,
                  color: on ? dmf.text : dmf.textMuted,
                  fontWeight: on ? 600 : 400,
                  transition: 'color 150ms, border-color 150ms',
                  '&:hover': { color: dmf.orange },
                }}
              >
                {s.title}
              </Box>
            </Box>
          );
        })}
      </Box>
    </>
  );
}

/** Renders rulings.md: header from "# Title" + intro, one section per "## Heading" (the document numbers its own sections). */
export default function RulesView({ markdown }: { markdown: string }) {
  // §n.n references become links (the section ids come from a first, plain split)
  const page = useMemo(() => splitMarkdown(linkRuleRefs(markdown, splitMarkdown(markdown).sections)), [markdown]);
  const ids = useMemo(() => page.sections.map((s) => s.id), [page]);
  const active = useActiveSection(ids);
  const version = useMemo(() => rulesVersion(markdown), [markdown]);
  const date = useMemo(() => rulesDate(markdown), [markdown]);
  const title = page.title || 'Vault Format Rules';
  // The "Version 1.2" line is shown under the download button instead (the PDF keeps it)
  const intro = useMemo(() => page.intro.replace(VERSION_LINE, '').trim(), [page]);

  // The PDF's size, worked out once the page is up (the PDF itself is only made on download)
  const [pdfSize, setPdfSize] = useState<number | null>(null);
  useEffect(() => {
    if (!markdown.trim()) return;
    const t = setTimeout(() => setPdfSize(rulesPdfBytes(markdown, title).length), 300);
    return () => clearTimeout(t);
  }, [markdown, title]);
  const pdfMeta = [version && `v${version}`, date && formatDate(date), pdfSize && fileSize(pdfSize)].filter(Boolean).join(' · ');

  // Phones: a "Contents" button stays at the bottom of the screen once the contents list has scrolled away
  const tocRef = useRef<HTMLElement | null>(null);
  const [tocGone, setTocGone] = useState(false);
  const [sheet, setSheet] = useState(false);
  useEffect(() => {
    const el = tocRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setTocGone(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [page.sections.length]);

  return (
    <PageShell>
      <Title variant="h1" component="h1" sx={{ fontSize: PAGE_TITLE_SIZE, mb: { xs: 4, md: 6 } }}>
        {title}
      </Title>

      {page.sections.length === 0 && !intro && <Typography sx={{ color: dmf.text }}>No rules yet.</Typography>}

      {/* Desktop: contents on the left; the overview, the download and the sections share one left
          edge on the right. Phones: overview, download, contents, sections. */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '240px minmax(0, 1fr)' },
          columnGap: 6,
          alignItems: 'start',
        }}
      >
        {(intro || markdown.trim()) && (
          <Box sx={{ gridColumn: { md: 2 }, gridRow: { md: 1 }, mb: { xs: 5, md: 8 } }}>
            {intro && (
              // The overview's own "# Overview" heading is set like the section headings
              <Box sx={{ mb: 4 }}>
                <Markdown>{intro}</Markdown>
              </Box>
            )}
            {markdown.trim() && (
              <Box>
                <NotchButton variant="ghost" onClick={() => downloadRulesPdf(markdown, title)}>
                  Download rules (PDF)
                </NotchButton>
                {pdfMeta && (
                  <Typography sx={{ mt: 1.5, fontSize: size.small, color: dmf.textMuted }}>
                    {pdfMeta}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}

        {page.sections.length > 0 && (
          <>
            <Box
              component="nav"
              ref={tocRef}
              aria-label="Rules sections"
              sx={{
                gridColumn: { md: 1 },
                gridRow: { md: '1 / span 2' },
                position: { md: 'sticky' },
                top: { md: 96 },
                bgcolor: { xs: dmf.surface, md: 'transparent' },
                p: { xs: 2.5, md: 0 },
                mb: { xs: 6, md: 0 },
              }}
            >
              <Contents sections={page.sections} active={active} />
            </Box>

            {/* Phones: room at the end for the floating Contents button, so the last rule scrolls clear of it */}
            <Box sx={{ gridColumn: { md: 2 }, gridRow: { md: 2 }, minWidth: 0, pb: { xs: 10, md: 0 } }}>
              {page.sections.map((s) => (
                <Box
                  key={s.id}
                  component="section"
                  id={s.id}
                  sx={{ scrollMarginTop: 90, mb: { xs: 8, md: 10 }, '&:last-of-type': { mb: 0 } }}
                >
                  <Title variant="h2" component="h2" sx={{ fontSize: { xs: '1.9rem', md: '2.4rem' }, mb: 3 }}>
                    {s.title}
                  </Title>
                  <Markdown>{s.body}</Markdown>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>

      {/* Phones: jump around without scrolling back to the top */}
      {page.sections.length > 0 && (
        <>
          <ButtonBase
            onClick={() => setSheet(true)}
            aria-haspopup="dialog"
            sx={{
              display: { xs: 'inline-flex', md: 'none' },
              position: 'fixed',
              left: '50%',
              bottom: 16,
              zIndex: 10,
              gap: 1,
              px: 2.5,
              py: 1.25,
              bgcolor: dmf.orange,
              color: dmf.ink,
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: size.ui,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              transform: tocGone ? 'translate(-50%, 0)' : 'translate(-50%, 140%)',
              visibility: tocGone ? 'visible' : 'hidden',
              transition: 'transform 200ms, visibility 200ms',
            }}
          >
            <ListIcon fontSize="small" /> Contents
          </ButtonBase>
          <Drawer
            anchor="bottom"
            open={sheet}
            onClose={() => setSheet(false)}
            slotProps={{ paper: { sx: { bgcolor: dmf.bg, backgroundImage: 'none', maxHeight: '75vh', p: 3, pt: 2.5 } } }}
          >
            <IconButton aria-label="Close contents" onClick={() => setSheet(false)} sx={{ position: 'absolute', top: 8, right: 8, color: dmf.text }}>
              <CloseIcon />
            </IconButton>
            <Box component="nav" aria-label="Rules sections">
              <Contents sections={page.sections} active={active} onPick={() => setSheet(false)} />
            </Box>
          </Drawer>
        </>
      )}
    </PageShell>
  );
}
