import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ClubsPage } from '@/views/clubs';

export const metadata: Metadata = {
  title: '동아리',
};

const Clubs = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClubsPage />
    </Suspense>
  );
};

export default Clubs;
