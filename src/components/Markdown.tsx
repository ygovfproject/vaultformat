'use client';

import { Children, isValidElement, useState, type ReactElement, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import LinkIcon from '@mui/icons-material/Link';
import CheckIcon from '@mui/icons-material/Check';
import NextLink from 'next/link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { canHover, dmf, fonts, size } from '@/theme';

export type Tone = 'dark' | 'ice';

type MdNode = { type: string; value?: string; children?: MdNode[] };

/**
 * `<br>` (also `<br/>`, `<br />`) in the markdown becomes a line break, also inside table cells.
 * Other HTML stays ignored. (Plain markdown also has one: end a line with `\`.)
 */
function remarkBr() {
  const walk = (node: MdNode) => {
    if (!node.children) return;
    node.children = node.children.map((child) =>
      child.type === 'html' && /^<br\s*\/?>$/i.test((child.value ?? '').trim()) ? { type: 'break' } : child,
    );
    node.children.forEach(walk);
  };
  return (tree: MdNode) => walk(tree);
}

/**
 * Colours per background. Bold is the text colour (only heavier), so it never looks like a link;
 * links are orange and underlined; `info` is for labels like rule numbers.
 */
function palette(tone: Tone) {
  return tone === 'ice'
    ? { text: dmf.ink, link: dmf.ink, info: dmf.ink, marker: dmf.ink, line: 'rgba(10,22,40,0.25)' }
    : { text: dmf.text, link: dmf.orange, info: dmf.ice, marker: dmf.ice, line: 'rgba(232,238,247,0.12)' };
}

type HastNode = { type: string; tagName?: string; value?: string; children?: HastNode[] };

/** "rule-2-5" for a paragraph that starts with **2.5**, else undefined. */
function ruleId(node: HastNode | undefined): string | undefined {
  const first = node?.children?.find((n) => !(n.type === 'text' && !n.value?.trim()));
  if (!first || first.type !== 'element' || first.tagName !== 'strong') return undefined;
  const text = (first.children ?? []).map((n) => n.value ?? '').join('').trim();
  const m = /^(\d+)\.(\d+)$/.exec(text);
  return m ? `rule-${m[1]}-${m[2]}` : undefined;
}

type StrongProps = { node?: { tagName?: string }; children?: ReactNode };

/**
 * A rule's number ("3.3") at the start of its paragraph: a link to the rule itself, plus a button
 * that copies that link, so players can point to "§3.3" in a dispute.
 */
function RuleNumber({ id, number, color }: { id: string; number: ReactNode; color: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.hash = id; // no clipboard access: at least put the link in the address bar
    }
  };
  return (
    <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
      <Box
        component="a"
        href={`#${id}`}
        sx={{ fontFamily: fonts.display, fontWeight: 500, color, textDecoration: 'none', [canHover]: { '&:hover': { textDecoration: 'underline', textUnderlineOffset: 4 } } }}
      >
        {number}
      </Box>
      <Box
        component="button"
        type="button"
        className="copy-rule"
        onClick={copy}
        aria-label={copied ? 'Link copied' : `Copy link to rule ${typeof number === 'string' ? number : ''}`.trim()}
        title={copied ? 'Link copied' : 'Copy link'}
        sx={{
          // Sits in the margin left of the paragraph, so it takes no room in the text. Shown on
          // hover or keyboard focus; touch screens just tap the number (it's the link).
          display: 'none',
          [canHover]: { display: 'inline-flex' },
          position: 'absolute',
          left: -30,
          top: '0.3em',
          p: 0.25,
          border: 0,
          background: 'none',
          cursor: 'pointer',
          color: copied ? dmf.ice : dmf.textMuted,
          opacity: copied ? 1 : 0,
          transition: 'opacity 150ms, color 150ms',
          '&:hover': { color: dmf.orange },
          '&:focus-visible': { opacity: 1 },
        }}
      >
        {copied ? <CheckIcon sx={{ fontSize: size.text }} /> : <LinkIcon sx={{ fontSize: size.text }} />}
      </Box>
    </Box>
  );
}

/** Replace the paragraph's first <strong> (the rule number) with a RuleNumber. */
function withRuleNumber(children: ReactNode, id: string, color: string): ReactNode {
  let done = false;
  return Children.map(children, (child) => {
    if (done || !isValidElement(child)) return child;
    const el = child as ReactElement<StrongProps>;
    if (el.props.node?.tagName !== 'strong') return child;
    done = true;
    const text = Children.toArray(el.props.children).join('');
    return <RuleNumber id={id} number={text} color={color} />;
  });
}

function buildComponents(tone: Tone): Components {
  const c = palette(tone);
  return {
    // Same size as the Rules page's section headings, so an intro heading ("Overview") matches them
    h1: ({ children }) => (
      <Typography variant="h2" component="h2" sx={{ color: c.text, fontSize: { xs: '1.9rem', md: '2.4rem' }, mt: 4, mb: 3, '&:first-child': { mt: 0 } }}>
        {children}
      </Typography>
    ),
    h2: ({ children }) => <Typography variant="h3" component="h3" sx={{ color: c.text, mt: 4, mb: 2 }}>{children}</Typography>,
    h3: ({ children }) => <Typography variant="h4" component="h3" sx={{ color: c.text, mt: 4, mb: 1.5 }}>{children}</Typography>,
    h4: ({ children }) => <Typography variant="h5" component="h4" sx={{ color: c.text, mt: 3, mb: 1 }}>{children}</Typography>,
    p: ({ node, children }) => {
      // A paragraph that starts with a bold rule number ("**2.5** ...") gets id="rule-2-5", so
      // references like §2.5 can link to it, and the number becomes a link to the rule.
      const id = ruleId(node);
      return (
      <Typography
        variant="body1"
        id={id}
        sx={{
          color: c.text,
          maxWidth: '65ch', // comfortable line length
          mb: 2.5,
          '&:last-child': { mb: 0 },
          scrollMarginTop: 96,
          position: id ? 'relative' : undefined,
          transition: 'background-color 600ms',
          '&:target': { bgcolor: 'rgba(56,200,255,0.1)', outline: '6px solid rgba(56,200,255,0.1)' },
          [canHover]: { '&:hover .copy-rule': { opacity: 1 } },
        }}
      >
        {id ? withRuleNumber(children, id, c.info) : children}
      </Typography>
      );
    },
    strong: ({ children }) => (
      <Box component="strong" sx={{ color: c.text, fontWeight: 700 }}>
        {children}
      </Box>
    ),
    em: ({ children }) => <Box component="em" sx={{ color: c.text, fontStyle: 'italic' }}>{children}</Box>,
    a: ({ href, children }) => {
      const external = !!href && /^https?:\/\//.test(href);
      // Links inside the site ("/errata") go through next/link so they get the base path.
      const internal = !!href && href.startsWith('/') && !href.startsWith('//');
      return (
        <Link
          href={href}
          {...(internal ? { component: NextLink } : {})}
          underline="always"
          sx={{ color: c.link, textDecorationColor: 'currentColor', textDecorationThickness: 2, textUnderlineOffset: 4, fontWeight: 600 }}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </Link>
      );
    },
    ul: ({ children }) => (
      <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mb: 2.5, display: 'grid', gap: 1.75 }}>
        {children}
      </Box>
    ),
    ol: ({ children }) => (
      <Box
        component="ol"
        sx={{ listStyle: 'none', p: 0, m: 0, mb: 2.5, display: 'grid', gap: 1.75, counterReset: 'step' }}
      >
        {children}
      </Box>
    ),
    li: ({ children }) => {
      return (
        <Typography
          component="li"
          variant="body1"
          sx={{
            color: c.text,
            maxWidth: '65ch',
            position: 'relative',
            pl: 4,
            '& > p': { mb: 0 },
            // Square bullet for <ul>
            'ul > &::before': {
              content: '""',
              position: 'absolute',
              left: 4,
              top: '0.6em',
              width: 9,
              height: 9,
              bgcolor: c.marker,
              transform: 'rotate(45deg)',
            },
            // Numbered badge for <ol>
            'ol > &': { counterIncrement: 'step' },
            'ol > &::before': {
              content: 'counter(step) "."',
              position: 'absolute',
              left: 0,
              top: '0.1em',
              fontFamily: fonts.display,
              fontWeight: 700,
              color: c.marker,
            },
          }}
        >
          {children}
        </Typography>
      );
    },
    blockquote: ({ children }) => (
      <Box
        component="blockquote"
        sx={{ m: 0, my: 3, pl: 3, borderLeft: `3px solid ${c.line}`, '& p': { color: c.text, fontStyle: 'italic' } }}
      >
        {children}
      </Box>
    ),
    hr: () => <Box component="hr" sx={{ border: 0, borderTop: `1px solid ${c.line}`, my: 5 }} />,
    code: ({ children }) => (
      <Box
        component="code"
        sx={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.9em', px: 0.75, bgcolor: 'rgba(0,0,0,0.25)' }}
      >
        {children}
      </Box>
    ),
    pre: ({ children }) => (
      <Box component="pre" sx={{ p: 2, mb: 2.5, overflowX: 'auto', bgcolor: 'rgba(0,0,0,0.3)', '& code': { bgcolor: 'transparent', px: 0 } }}>
        {children}
      </Box>
    ),
    table: ({ children }) => (
      <TableContainer sx={{ mb: 3, border: `1px solid ${c.line}` }}>
        <Table size="small">{children}</Table>
      </TableContainer>
    ),
    thead: ({ children }) => <TableHead>{children}</TableHead>,
    tbody: ({ children }) => <TableBody>{children}</TableBody>,
    tr: ({ children }) => <TableRow>{children}</TableRow>,
    th: ({ children }) => (
      <TableCell sx={{ fontFamily: fonts.display, fontWeight: 700, color: c.text, borderColor: c.line }}>
        {children}
      </TableCell>
    ),
    td: ({ children }) => <TableCell sx={{ color: c.text, borderColor: c.line }}>{children}</TableCell>,
    img: ({ src, alt }) => (
      <Box component="img" src={typeof src === 'string' ? src : undefined} alt={alt ?? ''} sx={{ maxWidth: '100%', display: 'block', my: 3 }} />
    ),
  };
}

const cache: Partial<Record<Tone, Components>> = {};

export default function Markdown({ children, tone = 'dark' }: { children: string; tone?: Tone }) {
  const components = (cache[tone] ??= buildComponents(tone));
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBr]} components={components}>
      {children}
    </ReactMarkdown>
  );
}
