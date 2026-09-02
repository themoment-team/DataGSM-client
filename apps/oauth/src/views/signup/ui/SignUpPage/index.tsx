import { cn } from '@repo/shared/utils';

import { SignUpObjectType } from '@/entities/signup';
import { SignUpForm } from '@/widgets/signup';

interface SignUpPageProps {
  objectType?: SignUpObjectType;
}

const SignUpPage = ({ objectType = 'STUDENT' }: SignUpPageProps) => {
  return (
    <div className={cn('bg-background flex min-h-screen items-center justify-center px-4 py-10')}>
      <SignUpForm objectType={objectType} />
    </div>
  );
};

export default SignUpPage;
