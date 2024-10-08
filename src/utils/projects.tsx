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
    render: (project: Project) => {
      return (
        <div className='w-5/12 flex items-center'>
          <div className='flex justify-center items-center pr-4 border-r'>
            {/* Eye Icon triggers onProjectClick */}
            <Eye
              className='text-xl cursor-pointer hover:text-blue-500'
              onClick={() => onProjectClick(project)}
            />
          </div>
          <div className='w-12 h-12 relative rounded overflow-hidden flex-shrink-0 ml-4'>
            <Image
              src={project.coverImage?.url() || '/default-image.png'}
              alt={project.title}
              fill
              className='object-cover'
            />
          </div>
          <h2 className='ml-4 text-lg font-semibold'>{project.title}</h2>
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
    sortIcon: () => <ArrowSwapVertical size={20} />,
  },
  {
    dataIndex: 'registryURL',
    title: 'Registry URL',
    align: 'left',
    sorter: { compare: (a:any, b:any) => a.registryURL.localeCompare(b.registryURL), multiple: 2},
    sortIcon: () => <ArrowSwapVertical size={20} />,
    render: (registryURL: string) => {
      return (
        <div className='flex justify-between'>
          <Link href={registryURL} target='_blank' rel='noreferrer'>
            {registryURL}
          </Link>
          <button
            onClick={() => {
              copyURL(registryURL);
            }}>
            <Copy size={20} />
          </button>
        </div>
      );
    },
  },
];
