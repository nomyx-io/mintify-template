import ProjectsHeader from '@/components/projects/ProjectsHeader';
import { getDashboardLayout } from '@/layouts';
import { TelescopeIcon } from '@/assets';
import { Button } from 'antd';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CustomerService } from '@/services/CustomerService';
import ProjectListView from '@/components/projects/ProjectListView';
import { useRouter } from 'next/router';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectDetails from '@/components/projects/ProjectDetails';

export default function Projects() {
  const [open, setOpen] = useState(false);
  const [projectList, setProjectList] = useState<Project[]>([]);

  const api = useMemo(() => CustomerService(), []);

  const router = useRouter();
  const { query } = router;
  const queryString = query?.query as string || '';
  const viewMode = query?.viewMode || 'card';
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const filteredProjects = projectList.filter(
    (project) =>
      project.title.toLowerCase().includes(queryString?.toLowerCase()) ||
      project.description.toLowerCase().includes(queryString?.toLowerCase())
  );

  const handleCreateProject = () => {
    setOpen(true);
  };

  const fetchProjects = useCallback(async () => {
    try {
      const [tokens, projects] = await Promise.all([api.getMintedNfts(), api.getProjects()]);
      setProjectList(
        projects?.map((project) => {
        const projectTokens = tokens?.filter((token) => token.attributes.projectId === project.id);
        return {
          id: project.id,
          title: project.attributes.title,
          description: project.attributes.description,
          logo: project.attributes.logo,
          coverImage: project.attributes.coverImage,
          totalValue: projectTokens?.reduce((acc, token) => acc + Number(token.attributes.price), 0) || 0,
          totalTokens: projectTokens?.length || 0,
          createdAt: project.createdAt,
        }}) || []
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

  // Handle project card or list item click
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  return (
    <>
      <CreateProjectModal
        open={open}
        setOpen={setOpen}
        onCreateSuccess={onCreateSuccess}
      />
      {!selectedProject && <ProjectsHeader setOpen={setOpen} />}
      {selectedProject ? (
        // Render Project Details
        <ProjectDetails
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
        />
      ) : (
        <>
          {filteredProjects.length > 0 ? (
            <>
              {viewMode === 'table' && (
                <ProjectListView
                  projects={filteredProjects}
                  className='mt-5'
                  onProjectClick={handleProjectClick}
                />
              )}
              {viewMode === 'card' && (
                <div className='gap-5 grid grid-cols-2 xl:grid-cols-3 mt-5'>
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onProjectClick={handleProjectClick}
                    />
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
      )}
    </>
  );
}

Projects.getLayout = getDashboardLayout;
