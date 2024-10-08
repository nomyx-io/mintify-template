import React from 'react';
import { Table } from 'antd';
import { projectColumns } from '@/utils/projects';

interface ProjectListViewProps {
  projects: Project[];
  className?: string;
  onProjectClick: (project: Project) => void;
}

export default function ProjectListView({
  projects,
  className,
  onProjectClick,
}: ProjectListViewProps) {

  console.log('projects:', projects);
  
  return (
    <div
      className={`pt-2 bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark text-nomyx-text-light dark:text-nomyx-text-dark rounded-lg ${className}`}>
      <Table
        columns={projectColumns(onProjectClick)}
        dataSource={projects}
        className={`bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark text-nomyx-text-light dark:text-nomyx-text-dark rounded-lg`}
        pagination={{
          pageSize: 8,
          total: projects.length,
          showTotal: (total, range) => (
            <span className='text-nomyx-text-light dark:text-nomyx-text-dark'>{`${range[0]}-${range[1]} of ${total} items`}</span>
          ),
        }}
      />
    </div>
  );
}
