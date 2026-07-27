import type { Metadata } from 'next';

const DOCS_URL = 'https://docs.datagsm.kr';
const DOCS_DESCRIPTION = '광주소프트웨어마이스터고등학교 DataGSM 기술 문서';

type CreateDocsPageMetadataOptions = {
  title: string;
  pathname: string;
  description?: string;
  absoluteTitle?: boolean;
};

const normalizePathname = (pathname: string) => {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.startsWith('/') ? pathname : `/${pathname}`;
};

const createFullTitle = (title: string) => `DataGSM Docs | ${title}`;

export const docsMetadataBase = new URL(DOCS_URL);

export const createDocsPageMetadata = ({
  title,
  pathname,
  description = DOCS_DESCRIPTION,
  absoluteTitle = false,
}: CreateDocsPageMetadataOptions): Metadata => {
  const normalizedPathname = normalizePathname(pathname);
  const fullTitle = createFullTitle(title);
  const ogImageUrl = new URL('/og', docsMetadataBase);

  ogImageUrl.searchParams.set('title', title);

  return {
    title: absoluteTitle ? fullTitle : title,
    description,
    alternates: {
      canonical: normalizedPathname,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: normalizedPathname,
      siteName: 'DataGSM',
      locale: 'ko_KR',
      type: 'website',
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImageUrl.toString()],
    },
  };
};

export const docsRootMetadata: Metadata = {
  metadataBase: docsMetadataBase,
  title: {
    template: 'DataGSM Docs | %s',
    default: 'DataGSM Docs',
  },
  description: DOCS_DESCRIPTION,
  openGraph: {
    title: 'DataGSM Docs',
    description: DOCS_DESCRIPTION,
    url: '/',
    siteName: 'DataGSM',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: 'https://docs.datagsm.kr/og?title=Overview',
        width: 1200,
        height: 630,
        alt: 'DataGSM Docs | Overview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DataGSM Docs',
    description: DOCS_DESCRIPTION,
    images: ['https://docs.datagsm.kr/og?title=Overview'],
  },
};
