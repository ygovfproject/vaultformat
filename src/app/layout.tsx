import type { Metadata } from 'next';
import { Chakra_Petch, Work_Sans } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import theme from '@/theme';
import { SITE_NAME, SITE_URL } from '@/lib/meta';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';

const display = Chakra_Petch({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-display' });
const body = Work_Sans({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-body' }); // italic: real italics for _emphasis_ instead of the browser's slanted fake
export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}/`),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description:
    'Yu-Gi-Oh! Vault Format (Yugioh Vault Format): a fixed Yu-Gi-Oh! format with premade, balanced decks and Vault Format card errata.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <LoadingScreen>
              <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <NavBar />
                <Box component="main" sx={{ flex: 1 }}>
                  {children}
                </Box>
                <Footer />
              </Box>
            </LoadingScreen>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
