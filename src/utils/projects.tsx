import { message } from 'antd';
import { ArrowSwapVertical, Copy, Eye } from 'iconsax-react';
import Image from 'next/image';
import Link from 'next/link';

const copyURL = (text: string) => {
  navigator.clipboard.writeText(text);
  message.success('Copied to clipboard!');
};

export const projectColumns: any = (onProjectClick: (project: Project) => void) => [
  {
    title: 'Title',
    align: 'left',
    sorter: {compare: (a:Project, b:Project) => a.title.localeCompare(b.title), multiple: 1},
    sortIcon: () => <ArrowSwapVertical size={20} />,
    width: 300,
    render: (project: Project) => {
      return (
        <div className='flex items-center'>
          <div className='flex justify-center items-center pr-4 border-r'>
            {/* Eye Icon triggers onProjectClick */}
            <Eye
              className='text-xl cursor-pointer hover:text-blue-500'
              onClick={() => onProjectClick(project)}
            />
          </div>
          <div className='w-10 h-10 relative rounded overflow-hidden flex-shrink-0 ml-4'>
            <Image
              src={project.coverImage?.url() || '/default-image.png'}
              alt={project.title}
              fill
              className='object-cover'
            />
          </div>
          <h2 className='ml-4 font-semibold'>{project.title}</h2>
        </div>
      );
    },
  },
  {
    dataIndex: 'description',
    title: 'Description',
    align: 'left',
    width: 400,
    ellipsis: true,
  },
  {
    title: 'Total Carbon Offset (Tons)',
    dataIndex: 'totalCarbon',
    width: 300,
    sorter: true,
  },
  {
    title: 'Total Tokens',
    dataIndex: 'totalTokens',
    sorter: true,
    width: 150,
    sortIcon: () => <ArrowSwapVertical size={20} />,
  },
  {
    dataIndex: 'registryName',
    title: 'Registry URL',
    align: 'left',
    width: 200,
    sorter: { compare: (a:any, b:any) => a.registryName.localeCompare(b.registryName), multiple: 2},
    sortIcon: () => <ArrowSwapVertical size={20} />,
  },
];
