import ProjectsHeader from '@/components/ProjectsHeader';
import { getDashboardLayout } from '@/Layouts';
import { TelescopeIcon } from '@/assets';
import { Button } from 'antd';
import CreateProjectModal from '@/components/CreateProjectModal';
import React, { useCallback, useEffect, useState } from 'react';
import { KronosService } from '@/services/KronosService';
import ProjectListView from '@/components/ProjectListView';

export default function Projects() {
  const [open, setOpen] = useState(false);
  const [projectList, setProjectList] = useState<Project[]>([]);

  const api = KronosService();

  const handleCreateProject = () => {
    setOpen(true);
  };

  const fetchProjects = useCallback(() => {
    api.getProjects().then((projects) => {
      setProjectList(
        projects?.map((project) => {
          return {
            id: project.id,
            title: project.attributes.title,
            description: project.attributes.description,
            logo: project.attributes.logo,
            coverImage: project.attributes.coverImage,
            registryURL: project.attributes.registryURL,
          };
        }) || []
      );
    });
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <>
      <CreateProjectModal open={open} setOpen={setOpen} />
      <ProjectsHeader setOpen={setOpen} />
      {projectList.length > 0 ? (
        <ProjectListView projects={projectList} className="mt-5" />
      ) : (
        <div className='flex flex-col text-nomyx-text-light dark:text-nomyx-text-dark h-[80%] items-center justify-center w-full grow'>
          <TelescopeIcon />
          <p>The Sky Is Clear Today!</p>
          <p>Spread your sails and let&apos;s set sail</p>
          <br />
          <Button className='bg-[#3c89e8]' onClick={handleCreateProject}>
            Create New Project
          </Button>
        </div>
      )}
    </>
  );
}

Projects.getLayout = getDashboardLayout;
