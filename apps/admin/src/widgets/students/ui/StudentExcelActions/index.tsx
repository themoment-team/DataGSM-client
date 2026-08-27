import { useRef } from 'react';

import { studentUrl } from '@repo/shared/api';
import { Button } from '@repo/shared/ui';
import { cn } from '@repo/shared/utils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { downloadExcel } from '@/shared/utils';
import { useUploadStudentExcel } from '@/widgets/students';

const StudentExcelActions = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const { mutate: uploadExcel } = useUploadStudentExcel({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Excel 업로드에 성공했습니다.');
    },
    onError: (error) => {
      console.error('Excel 업로드 실패:', error);
      toast.error('Excel 업로드에 실패했습니다.');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadExcel(file);
    }
    e.target.value = '';
  };

  return (
    <>
      <Button
        type="button"
        variant="pixel"
        className={cn('px-3')}
        onClick={() =>
          downloadExcel({
            url: studentUrl.getStudentExport(),
            fileName: '학생목록',
          })
        }
      >
        Excel 다운로드
      </Button>
      <Button
        type="button"
        variant="pixel"
        className={cn('px-3')}
        onClick={() => fileInputRef.current?.click()}
      >
        Excel 업로드
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className={cn('hidden')}
        onChange={handleFileChange}
      />
    </>
  );
};

export default StudentExcelActions;
