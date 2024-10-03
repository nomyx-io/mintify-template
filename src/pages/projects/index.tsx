import ProjectsHeader from '@/components/projects/ProjectsHeader';
import { getDashboardLayout } from '@/Layouts';
import { TelescopeIcon } from '@/assets';
import { Button } from 'antd';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { KronosService } from '@/services/KronosService';
import ProjectListView from '@/components/projects/ProjectListView';
import { useRouter } from 'next/router';
import ProjectCard from '@/components/projects/ProjectCard';

export default function Projects() {
  const [open, setOpen] = useState(false);
  const [projectList, setProjectList] = useState<Project[]>([]);

  const api = useMemo(() => KronosService(), []);

  const router = useRouter();
  const { query } = router;
  const queryString = query?.query as string;
  const viewMode = query?.viewMode || 'card';
  const filteredProjects = projectList.filter(
    (project) =>
      project.title.toLowerCase().includes(queryString?.toLowerCase()) ||
      project.description.toLowerCase().includes(queryString?.toLowerCase()) ||
      project.registryURL.toLowerCase().includes(queryString?.toLowerCase())
  );

  const handleCreateProject = () => {
    setOpen(true);
  };

  const fetchProjects = useCallback(async () => {
    try {
      const projects = await api.getProjects();
      setProjectList(
        projects?.map((project) => ({
          id: project.id,
          title: project.attributes.title,
          description: project.attributes.description,
          logo: project.attributes.logo,
          coverImage: project.attributes.coverImage,
          registryURL: project.attributes.registryURL,
        })) || []
      );
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  }, [api]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const onCreateSuccess = () => {
    fetchProjects();
  };

  return (
    <>
      <CreateProjectModal
        open={open}
        setOpen={setOpen}
        onCreateSuccess={onCreateSuccess}
      />
      <ProjectsHeader setOpen={setOpen} />
      {filteredProjects.length > 0 ? (
        <>
          {viewMode === 'table' && (
            <ProjectListView projects={filteredProjects} className='mt-5' />
          )}
          {viewMode === 'card' && (
            <div className='gap-5 grid grid-cols-2 xl:grid-cols-3 mt-5'>
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project}></ProjectCard>
              ))}
            </div>
          )}
        </>
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
