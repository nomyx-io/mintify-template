import { message } from 'antd';
import { ArrowSwapVertical, Copy } from 'iconsax-react';
import Image from 'next/image';
import Link from 'next/link';

const copyURL = (text: string) => {
  navigator.clipboard.writeText(text);
  message.success('Copied to clipboard!');
};

export const projectColumns: any = [
  {
    title: 'Title',
    align: 'left',
    sorter: {compare: (a:Project, b:Project) => a.title.localeCompare(b.title), multiple: 1},
    sortIcon: () => <ArrowSwapVertical size={20} />,
    render: (project: Project) => {
      return (
        <div className='flex items-center gap-1'>
          <Image
            src={project.logo?.url()}
            alt={project.title}
            width={42}
            height={42}
            className='rounded-md'
          />
          <Link href={`/projects/${project.id}`}>{project.title}</Link>
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
