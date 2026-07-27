import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ProjectsPage } from '@/views/projects';

export const metadata: Metadata = {
  title: '프로젝트',
};

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectsPage />
    </Suspense>
  );
};

export default Page;
