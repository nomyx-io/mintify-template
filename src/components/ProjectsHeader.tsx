import React from 'react';
import SearchBar from '@/components/SearchBar';
import { Button } from 'antd';
import { Category, RowVertical } from 'iconsax-react';
import { useRouter } from 'next/router';

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
      <div className='flex justify-between items-center p-2 rounded-lg bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark text-nomyx-text-light dark:text-nomyx-text-dark'>
        <SearchBar />
        <div className='flex items-center'>
          <Button className='bg-[#3c89e8] mr-4' onClick={handleCreateProject}>
            Create Project
          </Button>
          <div className='flex items-center p-1 gap-1'>
            <button
              onClick={() => toggleView('card')}
              className={`p-0.5 rounded-sm ${
                viewMode === 'card'
                  ? 'bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-[#3c89e8]'
                  : ''
              }`}>
              <Category
                size='20'
                variant={viewMode === 'card' ? 'Bold' : 'Linear'}
              />
            </button>
            <button
              onClick={() => toggleView('table')}
              className={`p-0.5 rounded-sm ${
                viewMode === 'table'
                  ? 'bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-[#3c89e8]'
                  : ''
              }`}>
              <RowVertical
                size='20'
                variant={viewMode === 'table' ? 'Bold' : 'Linear'}
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
