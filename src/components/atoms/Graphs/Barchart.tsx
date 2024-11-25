"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  LineController,
} from "chart.js";
import { Bar, Chart } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend, PointElement, LineElement, LineController);

interface BarChartData {
  labels: string[];
  datasets: BarChartDataSet[];
}

interface BarChartDataSet {
  label: string;
  data: number[];
  backgroundColor: string;
}

interface BarChartProps {
  data: BarChartData;
  title: string;
}

const BarChart = ({ data, title }: BarChartProps) => {
  const maxData = Math.max(...data.datasets.map((dataset) => Math.max(...dataset.data)));

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: false,
        ticks: {
          stepSize: 5,
        },
        max: maxData,
      },
    },
  };

  return (
    <div className="p-2">
      <Bar options={options} data={data} />
    </div>
  );
};

export default BarChart;
