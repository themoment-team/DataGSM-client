import type { Metadata } from 'next';
import { Suspense } from 'react';

import { TeacherApprovalsPage } from '@/views/teacher-approvals';

export const metadata: Metadata = {
  title: '선생님 승인',
};

const TeacherApprovals = async () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TeacherApprovalsPage />
    </Suspense>
  );
};

export default TeacherApprovals;
