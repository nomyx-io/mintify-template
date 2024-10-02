import ProjectsHeader from '@/components/ProjectsHeader';
import { getDashboardLayout } from '@/Layouts';
import { TelescopeIcon } from '@/assets';
import { Button } from 'antd';
import CreateProjectModal from '@/components/CreateProjectModal';
import { useEffect, useState } from 'react';
import { KronosService } from '@/services/KronosService';


export default function Projects() {
  const [open, setOpen] = useState(false);
  const [projectList, setProjectList] = useState<Parse.Object<Parse.Attributes>[]>([]);

  const api = KronosService();

  const handleCreateProject = () => {
    setOpen(true);
  };

  function fetchProjects() {
    api.getProjects().then((projects) => {
      setProjectList(projects || []);
    });
  };

  useEffect(() => {
    fetchProjects();
    console.log(projectList);
  }, [])


  return (
    <>
      <CreateProjectModal open={open} setOpen={setOpen} />
      <ProjectsHeader setOpen={setOpen} />
      { projectList.length > 0 ? (projectList.map((project) => (
        <div className='text-white' key={project.id}>{project.attributes.title} {project.attributes.description}</div>))) : (
      <div className='flex flex-col text-white h-[80%] items-center justify-center w-full grow'>
        <TelescopeIcon />
        <p>The Sky Is Clear Today!</p>
        <p>Spread your sails and let&apos;s set sail</p>
        <br />
        <Button className='bg-[#3c89e8]' onClick={handleCreateProject}>
          Create New Project
        </Button>
      </div>)}
    </>
  );
}

Projects.getLayout = getDashboardLayout;
