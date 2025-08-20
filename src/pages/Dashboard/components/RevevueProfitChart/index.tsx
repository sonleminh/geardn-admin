import { Box } from '@mui/material';
import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { IRevenueProfitDateStats } from '@/interfaces/IStats';
import { vi } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RevevueProfitChart = ({
  revenueProfitStats,
}: {
  revenueProfitStats: IRevenueProfitDateStats[];
}) => {
  const chartData = useMemo(() => {
    if (!revenueProfitStats) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Doanh thu',
            data: [],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
          },
          {
            label: 'Lợi nhuận',
            data: [],
            fill: false,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.1,
          },
        ],
      };
    }

    const labels = revenueProfitStats.map((item: IRevenueProfitDateStats) =>
      format(new Date(item.date), 'dd/MM', { locale: vi })
    );

    const revenueData = revenueProfitStats.map(
      (item: IRevenueProfitDateStats) => item.revenue
    );
    const profitData = revenueProfitStats.map(
      (item: IRevenueProfitDateStats) => item.profit
    );

    return {
      labels,
      datasets: [
        {
          label: 'Doanh thu (VNĐ)',
          data: revenueData,
          fill: false,
          borderColor: '#000',
          backgroundColor: '#fff',
          tension: 0.4,
          yAxisID: 'y',
        },
        {
          label: 'Lợi nhuận (VNĐ)',
          data: profitData,
          fill: false,
          borderColor: '#38ad48',
          backgroundColor: '#e0f5dd',
          tension: 0.4,
          yAxisID: 'y',
        },
      ],
    };
  }, [revenueProfitStats]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const,
        },
        title: {
          display: true,
          // text: 'Biểu đồ doanh thu và lợi nhuận theo ngày',
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            // text: 'Ngày',
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            // text: 'Số tiền (VNĐ)',
          },
        },
      },
    }),
    []
  );

  return (
    <Box sx={{ width: '100%', height: 320, p: 0, m: 0 }}>
      <Line data={chartData} options={chartOptions} />
    </Box>
  );
};

export default RevevueProfitChart;
