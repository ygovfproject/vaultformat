"use client";

import NextLink from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { keyframes } from "@emotion/react";
import { canHover, dmf, easeOut, fonts, size } from "@/theme";
import { Title, NotchButton, PixelEdge } from "./Decor";
import Markdown from "./Markdown";
import { FlipFan } from "./cards/CardAnimations";

const rise = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: none; }
`;

export default function Hero({
  title,
  intro,
  cards,
}: {
  title: string;
  intro: string;
  /** null while the card list is loading (cards show face-down); [] = no cards, no fan */
  cards: string[] | null;
}) {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        minHeight: { xs: "calc(100vh - 64px)", md: "calc(100vh - 72px)" },
        display: "flex",
        alignItems: "center",
        py: { xs: 7, md: 12 },
        bgcolor: dmf.bgDeep,
        backgroundImage: `
          radial-gradient(max(320px, 48vw) max(230px, 34vw) at 80% 40%, rgba(56,200,255,0.18), transparent 70%),
          radial-gradient(max(280px, 42vw) max(190px, 28vw) at 10% 90%, rgba(255,138,61,0.12), transparent 70%),
          linear-gradient(rgba(56,200,255,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(56,200,255,0.06) 1px, transparent 1px)`,
        backgroundSize: "auto, auto, 48px 48px, 48px 48px",
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative" }}>
        {/* Phones: the cards above the text; desktop: text left, cards right */}
        <Stack
          direction={{ xs: "column-reverse", md: "row" }}
          sx={{ alignItems: { xs: "flex-start", md: "center" }, justifyContent: "space-between", gap: { xs: 4, md: 6 } }}
        >
          <Box sx={{ maxWidth: 680, animation: `${rise} 500ms ${easeOut} both` }}>
            <Title
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: "3.25rem", sm: "4.5rem", md: "6rem" },
                mb: 4,
              }}
            >
              {title}
            </Title>
            {intro && (
              <Box sx={{ maxWidth: 600, mb: 5 }}>
                <Markdown>{intro}</Markdown>
              </Box>
            )}
            {/* One main action; the rules are a plain link next to it */}
            <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: 4, rowGap: 2 }}>
              <NotchButton href="/decks">Browse Decks</NotchButton>
              <Box
                component={NextLink}
                href="/rulings"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  py: 1,
                  fontFamily: fonts.display,
                  fontWeight: 700,
                  fontSize: size.ui,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: dmf.orange,
                  textDecoration: "none",
                  "& svg": { transition: `transform 150ms ${easeOut}` },
                  [canHover]: { "&:hover svg": { transform: "translateX(4px)" } },
                }}
              >
                Read the rules <ArrowForwardIcon fontSize="small" />
              </Box>
            </Box>
          </Box>
          {/* Click-to-flip cards: full size on desktop, half size on phones. Shown face-down while
              the card list loads, flipped up once it and the images are in; left out when there are
              no cards at all (no decks). The fan's rotated right card reaches past its box, hence
              the right margin, so it stays inside the page's edge. */}
          {(cards === null || cards.length > 0) && (
            <Box
              sx={{
                flexShrink: 0,
                alignSelf: { xs: "center", md: "auto" },
                width: { xs: 235, md: 470 },
                height: { xs: 240, md: 480 },
                mr: { md: 5 },
                "& > *": { transform: { xs: "scale(0.5)", md: "none" }, transformOrigin: "top left" },
              }}
            >
              <FlipFan cards={cards ?? []} />
            </Box>
          )}
        </Stack>
      </Container>

      <PixelEdge color={dmf.bg} />
    </Box>
  );
}
