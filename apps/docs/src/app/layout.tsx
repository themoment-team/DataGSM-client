import { DM_Sans, JetBrains_Mono, Press_Start_2P } from 'next/font/google';
import localFont from 'next/font/local';

import { TanStackProvider } from '@repo/shared/lib';
import { Header } from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import type { Metadata } from 'next';

import '@/shared/styles/globals.css';
import { DocsSidebar } from '@/widgets/docs';

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pixel',
});

const galmuri11 = localFont({
  src: '../../node_modules/galmuri/dist/Galmuri11-Bold.woff2',
  display: 'swap',
  variable: '--font-korean-pixel',
});

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

const dmSans = DM_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    template: 'DataGSM Docs | %s',
    default: 'DataGSM Docs',
  },
  description: '광주소프트웨어마이스터고등학교 DataGSM 기술 문서',
  openGraph: {
    title: {
      template: 'DataGSM Docs | %s',
      default: 'DataGSM Docs',
    },
    description: '광주소프트웨어마이스터고등학교 DataGSM 기술 문서',
    url: 'https://docs.datagsm.kr/',
    siteName: 'DataGSM',
    images: 'https://docs.datagsm.kr/images/og-image.png',
    type: 'website',
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html
      lang="ko"
      className={`${pressStart2P.variable} ${jetbrainsMono.variable} ${dmSans.variable} ${galmuri11.variable}`}
    >
      <body>
        <TanStackProvider>
          <Header role="docs" />
          <div className={cn('container mx-auto px-4 py-12')}>
            <div className={cn('mx-auto flex max-w-7xl flex-col lg:flex-row lg:gap-8')}>
              <DocsSidebar />
              <main className={cn('min-w-0 flex-1')}>{children}</main>
            </div>
          </div>
        </TanStackProvider>
      </body>
    </html>
  );
};

export default RootLayout;
