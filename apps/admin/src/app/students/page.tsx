import type { Metadata } from 'next';
import { Suspense } from 'react';

import { StudentsPage } from '@/views/students';

export const metadata: Metadata = {
  title: '학생',
};

const Students = async () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StudentsPage />
    </Suspense>
  );
};

export default Students;
