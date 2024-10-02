import SearchBar from '@/components/SearchBar';
import { getDashboardLayout } from '@/Layouts';
import { Button } from 'antd';
import { Category, RowVertical } from 'iconsax-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function ProjectsHeader({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) {
  const router = useRouter();
  const { query, pathname } = router;

  const toggleView = (view: string) => {
    if (view) {
      query.viewMode = view;
    } else {
      delete query.viewMode;
    }
    router.replace({ pathname, query });
  };
  const viewMode = query?.viewMode || 'card';

  const handleCreateProject = () => {
    setOpen(true);
  };

  return (
    <>
      <div className='flex justify-between items-center p-2 rounded-lg bg-[#141414]'>
        <SearchBar />
        <div className='flex items-center'>
          <Button className='bg-[#3c89e8] mr-4' onClick={handleCreateProject}>
            Create Project
          </Button>
          <div className='flex items-center p-1 gap-1'>
            <button
              onClick={() => toggleView('card')}
              className={`p-0.5 rounded-sm ${
                viewMode === 'card' ? 'bg-black' : ''
              }`}>
              <Category
                size='20'
                variant={viewMode === 'card' ? 'Bold' : 'Linear'}
                color={viewMode === 'card' ? '#3c89e8' : 'white'}
              />
            </button>
            <button
              onClick={() => toggleView('table')}
              className={`p-0.5 rounded-sm ${
                viewMode === 'table' ? 'bg-black' : ''
              }`}>
              <RowVertical
                size='20'
                variant={viewMode === 'table' ? 'Bold' : 'Linear'}
                color={viewMode === 'table' ? '#3c89e8' : 'white'}
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
