"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  LineController,
} from 'chart.js';
import { Bar, Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  LineController
);

interface BarChartData {
  labels: string[];
  datasets: BarChartDataSet[];
}

interface BarChartDataSet {
  type?: 'line' | 'bar';
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
  barThickness?: number;
  categoryPercentage?: number;
  barPercentage?: number;
}

interface BarChartProps {
  data: BarChartData;
  title: string;
}

const BarChart = ({ data, title }: BarChartProps) => {

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  return (
    <div className='p-2'>
      <Chart type='bar' options={options} data={data} />
    </div>
  );
};

export default BarChart;
