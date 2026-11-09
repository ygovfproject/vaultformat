"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { keyframes } from "@emotion/react";
import { dmf, easeOut, fonts } from "@/theme";
import { Title, NotchButton, PixelEdge } from "./Decor";
import Markdown from "./Markdown";
import { FlipFan } from "./cards/CardAnimations";

const rise = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: none; }
`;

/** The hero's intro split into its text and its tagline (the "> ..." lines: our slogan, not a quote). */
function splitTagline(intro: string): { text: string; tagline: string[] } {
  const text: string[] = [];
  const tagline: string[] = [];
  for (const line of intro.split("\n")) {
    if (/^\s*>/.test(line)) tagline.push(line.replace(/^\s*>\s?/, ""));
    else text.push(line);
  }
  // "<br>" in the tagline is a line break
  const lines = tagline.join(" ").split(/<br\s*\/?>/i).map((l) => l.trim()).filter(Boolean);
  return { text: text.join("\n").trim(), tagline: lines };
}

/** Phones show the fan at this scale (it's laid out for desktop at full size). */
const PHONE_SCALE = 0.68;

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
  const { text, tagline } = splitTagline(intro);
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        // Tall enough for the fan on desktop; the text and fan are centred in it, so there's no band
        // of empty space under the buttons
        minHeight: { md: 640 },
        display: "flex",
        alignItems: "center",
        // Phones: room for the update note laid over the top, plus a clear gap above the headline
        pt: { xs: 13, md: 8 },
        pb: { xs: 9, md: 8 },
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
        {/* Text first everywhere: on phones the headline starts at the top, the cards follow the buttons */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          sx={{ alignItems: { xs: "flex-start", md: "center" }, justifyContent: "space-between", gap: { xs: 6, md: 6 } }}
        >
          <Box sx={{ maxWidth: 640, animation: `${rise} 500ms ${easeOut} both` }}>
            <Title variant="h1" component="h1" sx={{ fontSize: { xs: "2.75rem", sm: "4rem", md: "4.75rem" }, mb: 3 }}>
              {title}
            </Title>
            {text && (
              <Box sx={{ maxWidth: 560, mb: tagline.length ? 3 : 5 }}>
                <Markdown>{text}</Markdown>
              </Box>
            )}
            {tagline.length > 0 && (
              <Typography
                component="p"
                className="tagline"
                sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: { xs: "1.25rem", md: "1.5rem" }, lineHeight: 1.3, color: dmf.text, mb: 5 }}
              >
                {tagline.map((line, i) => (
                  <Box component="span" key={i} sx={{ display: "block" }}>
                    {line}
                  </Box>
                ))}
              </Typography>
            )}
            {/* Narrow phones: both buttons full width, so they line up */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2.5,
                "@media (max-width: 479.95px)": { flexDirection: "column", alignItems: "stretch", "& > *": { width: "100%" } },
              }}
            >
              <NotchButton href="/decks">Browse decks</NotchButton>
              <NotchButton href="/rules" variant="ghost">
                Read the rules
              </NotchButton>
            </Box>
          </Box>
          {/* Click-to-flip cards. Shown face-down only until the card list and images are in;
              left out when there are no cards at all (no decks). The fan's rotated right card
              reaches past its box, hence the right margin. Phones: scaled down from the desktop
              layout (its box is cut to the scaled size). */}
          {(cards === null || cards.length > 0) && (
            <Box
              sx={{
                flexShrink: 0,
                alignSelf: { xs: "center", md: "auto" },
                width: { xs: 470 * PHONE_SCALE, md: 470 },
                height: { xs: 480 * PHONE_SCALE, md: 480 },
                mr: { md: 5 },
                // Desktop: sits a little below the text's centre line
                position: "relative",
                top: { md: 40 },
                "& > *": { transform: { xs: `scale(${PHONE_SCALE})`, md: "none" }, transformOrigin: "top left" },
              }}
            >
              <FlipFan cards={cards ?? []} />
            </Box>
          )}
        </Stack>
      </Container>

      <PixelEdge color={dmf.bg} seed={7} />
    </Box>
  );
}
