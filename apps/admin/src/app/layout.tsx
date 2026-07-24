import { TanStackProvider, ToastProvider } from '@repo/shared/lib';
import { Header } from '@repo/shared/ui';
import type { Metadata } from 'next';
import { DM_Sans, JetBrains_Mono, Press_Start_2P } from 'next/font/google';
import localFont from 'next/font/local';

import '@/shared/styles/globals.css';

import AuthGuard from './AuthGuard';

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
    template: 'DataGSM Admin | %s',
    default: 'DataGSM Admin',
  },
  description: '광주소프트웨어마이스터고등학교 OpenAPI 서비스 관리 페이지',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html
      lang="ko"
      className={`${pressStart2P.variable} ${galmuri11.variable} ${jetbrainsMono.variable} ${dmSans.variable}`}
    >
      <body>
        <TanStackProvider>
          <ToastProvider>
            <AuthGuard>
              <Header role="admin" />
              {children}
            </AuthGuard>
          </ToastProvider>
        </TanStackProvider>
      </body>
    </html>
  );
};

export default RootLayout;
