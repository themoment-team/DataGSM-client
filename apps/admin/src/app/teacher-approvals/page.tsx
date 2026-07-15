import { Suspense } from 'react';

import { TeacherApprovalsPage } from '@/views/teacher-approvals';

const TeacherApprovals = async () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TeacherApprovalsPage />
    </Suspense>
  );
};

export default TeacherApprovals;
