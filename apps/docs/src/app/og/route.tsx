import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

const size = {
  width: 1200,
  height: 630,
};

export const runtime = 'nodejs';

const titleFontPath = join(process.cwd(), 'node_modules/galmuri/dist/Galmuri11-Bold.ttf');
const bodyFontPath = join(process.cwd(), 'node_modules/galmuri/dist/Galmuri11.ttf');
const logoPath = join(process.cwd(), 'public/images/docs/D_black.svg');

const titleFontDataPromise = readFile(titleFontPath);
const bodyFontDataPromise = readFile(bodyFontPath);
const logoDataPromise = readFile(logoPath, 'utf8');

const fallbackTitle = 'Overview';
const maxTitleLength = 64;

const sanitizeTitle = (title: string | null) => {
  if (!title) {
    return fallbackTitle;
  }

  const normalizedTitle = title.trim().replace(/\s+/g, ' ');

  if (!normalizedTitle) {
    return fallbackTitle;
  }

  return normalizedTitle.slice(0, maxTitleLength);
};

const createLogoDataUrl = (logo: string) => `data:image/svg+xml;base64,${Buffer.from(logo).toString('base64')}`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = sanitizeTitle(searchParams.get('title'));

  const [titleFontData, bodyFontData, logo] = await Promise.all([
    titleFontDataPromise,
    bodyFontDataPromise,
    logoDataPromise,
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background: '#fafafa',
          color: '#101418',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0))',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 30,
            border: '1px solid rgba(16, 20, 24, 0.08)',
            borderRadius: 28,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 76,
            bottom: 74,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            width: 860,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              color: '#101418',
              fontFamily: 'Galmuri Title',
              fontSize: 30,
              letterSpacing: '-0.035em',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={createLogoDataUrl(logo)}
              alt="DataGSM logo"
              width="56"
              height="56"
              style={{
                width: 56,
                height: 56,
              }}
            />
            <div style={{ display: 'flex' }}>DataGSM</div>
          </div>
          <div
            style={{
              display: 'flex',
              maxWidth: '100%',
              fontFamily: 'Galmuri Title',
              fontSize: 64,
              lineHeight: 1.24,
              letterSpacing: '-0.045em',
              textWrap: 'balance',
              textShadow: '0 1px 0 rgba(255, 255, 255, 0.7)',
            }}
          >
            {title}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Galmuri Title',
          data: titleFontData,
          style: 'normal',
          weight: 700,
        },
        {
          name: 'Galmuri Body',
          data: bodyFontData,
          style: 'normal',
          weight: 400,
        },
      ],
    },
  );
}
