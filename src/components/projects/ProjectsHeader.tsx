import React from 'react';
import SearchBar from '@/components/atoms/SearchBar';
import { Button } from 'antd';
import { Category, RowVertical } from 'iconsax-react';
import { useRouter } from 'next/router';

interface ProjectsHeaderProps {
  setOpen: (open: boolean) => void;
}

export default function ProjectsHeader({ setOpen }: ProjectsHeaderProps) {
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
          <Button className='bg-nomyx-blue-light mr-4 hover:!bg-nomyx-dark1-light hover:dark:!bg-nomyx-dark1-dark' onClick={handleCreateProject}>
            Create Project
          </Button>
          <div className='flex items-center p-1 gap-1'>
            <button
              onClick={() => toggleView('card')}
              className={`p-0.5 rounded-sm ${
                viewMode === 'card'
                  ? 'bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-blue-light'
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
                  ? 'bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-blue-light'
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
