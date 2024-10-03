import { message, Table } from 'antd';
import { ColumnGroupType } from 'antd/es/table';
import { ArrowSwapVertical, Copy } from 'iconsax-react';
import Image from 'next/image';
import Link from 'next/link';

interface ProjectListViewProps {
  projects: Project[];
  className?: string;
}

const projectColumns: any = [
  {
    title: 'Title',
    align: 'left',
    sorter: true,
    sortIcon: () => <ArrowSwapVertical size={20}/>,
    render: (project: Project) => {
      return (
        <div className='flex items-center gap-1'>
          <Image src={project.logo?.url()} alt={project.title} width={42} height={42} className='rounded-md' />
        <Link href={`/projects/${project.id}`}>
          {project.title}
        </Link>
        </div>
      );
    },
  },
  {
    dataIndex: 'description',
    title: 'Description',
    align: 'left',
    ellipsis: true,
  },
  {
    title: 'Total Carbon Offset (Tons)',
    sorter: true,
  },
  {
    title: 'Total Tokens',
    sorter: true,
    sortIcon: () => <ArrowSwapVertical size={20}/>,
  },
  {
    dataIndex: 'registryURL',
    title: 'Registry URL',
    align: 'left',
    sorter: true,
    sortIcon: () => <ArrowSwapVertical size={20}/>,
    render: (registryURL: string) => {
      return (
        <div className='flex justify-between'>
        <Link href={registryURL} target='_blank' rel='noreferrer'>
          {registryURL}
        </Link>
        <button onClick={() => {message.success('Successfully copied!')}}>
          <Copy size={20}/>
        </button>
        </div>
      );
    },
  },
];

export default function ProjectListView({ projects, className }: ProjectListViewProps) {
  console.log('projects', projects);
  return (
    <Table
      columns={projectColumns}
      dataSource={projects}
      className={`bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark rounded-lg ${className}`}
    />
  );
}
