import { ColumnsType } from 'antd/es/table';
import Link from 'next/link';

export function getKPIs(data?: KPIs) {
  return [
    {
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='none'
          stroke='white'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          height={24}
          width={24}>
          <circle cx='12' cy='12' r='10' />
          <polyline points='12 8 12 12 16 16' />
          <line x1='8' y1='12' x2='12' y2='12' />
        </svg>
      ),
      title: 'Total Assets',
      value: data?.totalAssets,
    },
    {
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='none'
          stroke='white'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          height={24}
          width={24}>
          <circle cx='12' cy='12' r='10' />
          <polyline points='12 8 12 12 16 16' />
          <line x1='8' y1='12' x2='12' y2='12' />
        </svg>
      ),
      title: 'Total Issued Value',
      value: data?.totalInitialValue,
    },
    {
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          width={20}
          height={20}>
          <text
            x='50%'
            y='50%'
            textAnchor='middle'
            fontSize='20'
            dy='.3em'
            fill='#fff'>
            {' '}
            ${' '}
          </text>
        </svg>
      ),
      title: 'Total Redeemed Value',
      value: data?.totalAssetValue,
    },
    {
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          width={20}
          height={20}>
          <text
            x='50%'
            y='50%'
            textAnchor='middle'
            fontSize='20'
            dy='.3em'
            fill='#fff'>
            {' '}
            ${' '}
          </text>
        </svg>
      ),
      title: 'Total Carbon Issued',
      value: data?.totalAccruedValue,
    },
    {
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          width={20}
          height={20}>
          <text
            x='50%'
            y='50%'
            textAnchor='middle'
            fontSize='20'
            dy='.3em'
            fill='#fff'>
            {' '}
            ${' '}
          </text>
        </svg>
      ),
      title: 'Total Carbon Redeemed',
      value: data?.totalYieldClaimed,
    },
    {
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width={20}
          height={20}
          viewBox='0 0 20 20'
          fill='white'
          xmlnsXlink='http://www.w3.org/1999/xlink'
          transform='matrix(-1,1.2246467991473532e-16,-1.2246467991473532e-16,-1,0,0)'>
          <path
            d='M10 3.125V16.875M10 16.875L4.375 11.25M10 16.875L15.625 11.25'
            stroke='white'
            strokeWidth={2.5}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      ),
      title: 'Total Redeemed Credits',
      value: data?.totalDeliquent,
    },
  ];
}

export function getGraphData(graphValues?: PortfolioPerformance) {
  return {
    labels: graphValues?.labels || [],
    datasets: [
      {
        type: 'line' as const,
        label: 'Total Accured Value',
        data: graphValues?.accruedValues || [],
        backgroundColor: '#fc4103',
        borderColor: '#fc4103',
        borderWidth: 3,
        fill: false,
      },
      {
        type: 'line' as const,
        label: 'Total Yield Value',
        data: graphValues?.yieldClaimedTill || [],
        backgroundColor: '#fc8c03',
        borderColor: '#fc8c03',
        borderWidth: 3,
        fill: false,
      },
      {
        label: 'Total Initial Value',
        data: graphValues?.initialValues || [],
        backgroundColor: '#2f59d6',
        borderWidth: 0,
        barThickness: 30,
        categoryPercentage: 0.5,
        barPercentage: 1,
      },
      {
        label: 'Net Asset Value',
        data: graphValues?.assetValues || [],
        backgroundColor: '#7a7977',
        borderColor: '#7a7977',
        borderWidth: 0,
        barThickness: 30,
        categoryPercentage: 0.5,
        barPercentage: 1,
      },
    ],
  };
}

export const DASHBOARD_COLUMNS: ColumnsType<MintedToken> = [
  {
    dataIndex: 'id',
    title: 'Id',
    align: 'left',
    render: (recordId: string) => {
      return (
        <Link
          href={`/nft-detail/${recordId}`}
          className='text-light-blue-500 cursor-pointer'>
          {' '}
          {recordId}{' '}
        </Link>
      );
    },
  },
  { dataIndex: '_tokenId', title: 'Token Id', align: 'center' },
  { dataIndex: '_loanId', title: 'Loan Id', align: 'center' },
  { dataIndex: '_createdAt', title: 'NFT Created', align: 'center' },
  {
    dataIndex: '_amount',
    title: 'Original Value',
    align: 'center',
    sorter: true,
  },
  {
    dataIndex: '_currentValue',
    title: 'Current Value',
    align: 'right',
    sorter: true,
  },
];
