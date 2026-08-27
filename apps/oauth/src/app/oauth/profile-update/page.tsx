import { Suspense } from 'react';

import { ProfileUpdatePage } from '@/views/profile-update';

const ProfileUpdate = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileUpdatePage />
    </Suspense>
  );
};

export default ProfileUpdate;
