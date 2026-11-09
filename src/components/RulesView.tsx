'use client';

import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { dmf, fonts, size } from '@/theme';
import { splitMarkdown } from '@/lib/sections';
import { downloadRulesPdf, rulesVersion } from '@/lib/rulesPdf';
import { GlitchDivider, Title, NotchButton } from './Decor';
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

/** Highlight the section currently at the top of the screen. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  useEffect(() => {
    if (ids.length === 0 || !('IntersectionObserver' in window)) return;
    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting);
        const first = ids.find((id) => visible.get(id));
        if (first) setActive(first);
      },
      { rootMargin: '-90px 0px -60% 0px' },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [ids]);
  return active;
}

/** Renders rulings.md: header from "# Title" + intro, one section per "## Heading" (the document numbers its own sections). */
export default function RulingsView({ markdown }: { markdown: string }) {
  // §n.n references become links (the section ids come from a first, plain split)
  const page = useMemo(() => splitMarkdown(linkRuleRefs(markdown, splitMarkdown(markdown).sections)), [markdown]);
  const ids = useMemo(() => page.sections.map((s) => s.id), [page]);
  const active = useActiveSection(ids);
  const version = useMemo(() => rulesVersion(markdown), [markdown]);
  // The "Version 1.2" line is shown on the download button instead (the PDF keeps it)
  const intro = useMemo(() => page.intro.replace(/^[ \t]*version\s*:?\s*v?\d[\w.-]*[ \t]*$/gim, '').trim(), [page]);

  return (
    <PageShell>
        <Title variant="h1" component="h1" sx={{ fontSize: PAGE_TITLE_SIZE }}>
          {page.title || 'Rulings'}
        </Title>
        <GlitchDivider />

        {intro && (
          <Box sx={{ mb: 2 }}>
            <Markdown>{intro}</Markdown>
          </Box>
        )}

        {markdown.trim() && (
          <Box sx={{ mt: 3, mb: 1 }}>
            <NotchButton variant="ghost" onClick={() => downloadRulesPdf(markdown, page.title || 'Vault Format Rules')}>
              Download rules{version ? ` v${version}` : ''} (PDF)
            </NotchButton>
          </Box>
        )}

        {page.sections.length === 0 && !intro && (
          <Typography sx={{ color: dmf.text }}>No rulings yet.</Typography>
        )}

        {page.sections.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '240px 1fr' }, gap: { xs: 2, md: 6 }, alignItems: 'start', mt: 4 }}>
            {/* Table of contents: sticks beside the rules on desktop; a block before them on phones */}
            <Box
              component="nav"
              aria-label="Rulings sections"
              sx={{
                position: { md: 'sticky' },
                top: { md: 96 },
                bgcolor: { xs: dmf.surface, md: 'transparent' },
                p: { xs: 2.5, md: 0 },
                mb: { xs: 4, md: 0 },
              }}
            >
              <Typography component="h2" sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: size.text, color: dmf.text, mb: 1.5 }}>
                Contents
              </Typography>
              <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0, borderLeft: '2px solid rgba(56,200,255,0.18)' }}>
                {page.sections.map((s) => {
                  const on = active === s.id;
                  return (
                    <Box component="li" key={s.id}>
                      <Box
                        component="a"
                        href={`#${s.id}`}
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
            </Box>

            {/* Sections */}
            <Box sx={{ minWidth: 0 }}>
              {page.sections.map((s) => (
                <Box
                  key={s.id}
                  component="section"
                  id={s.id}
                  sx={{
                    scrollMarginTop: 90,
                    // Sections are set apart by space alone
                    mb: { xs: 8, md: 10 },
                    '&:last-of-type': { mb: 0 },
                  }}
                >
                  <Title variant="h2" component="h2" sx={{ fontSize: { xs: '1.9rem', md: '2.4rem' }, mb: 3 }}>
                    {s.title}
                  </Title>
                  <Markdown>{s.body}</Markdown>
                </Box>
              ))}
            </Box>
          </Box>
        )}
    </PageShell>
  );
}
