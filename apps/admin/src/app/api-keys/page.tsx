import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ApiKeyPage } from '@/views/api-keys';

export const metadata: Metadata = {
  title: 'API 키',
};

const ApiKey = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApiKeyPage />
    </Suspense>
  );
};

export default ApiKey;
