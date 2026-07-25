import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AccountsPage } from '@/views/accounts';

export const metadata: Metadata = {
  title: '계정',
};

const Accounts = async () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccountsPage />
    </Suspense>
  );
};

export default Accounts;
