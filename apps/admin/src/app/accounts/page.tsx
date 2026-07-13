import { Suspense } from 'react';

import { AccountsPage } from '@/views/accounts';

const Accounts = async () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccountsPage />
    </Suspense>
  );
};

export default Accounts;
