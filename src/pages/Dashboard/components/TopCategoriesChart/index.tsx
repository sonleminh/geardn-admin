import { IProfitRevenueDailyStats } from '@/interfaces/IProfitRevenueDailyStats';
import { Box } from '@mui/material';
import React, { useMemo } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface ITopCategories {
  categoryId: number;
  categoryName: string;
  quantitySold: number;
  revenue: number;
}

const TopCategoriesChart = ({
  topCategories,
}: {
  topCategories: ITopCategories[];
}) => {
  const topCategoryChartData = useMemo(
    () => ({
      labels: topCategories.map((c) => c.categoryName),
      datasets: [
        {
          data: topCategories.map((c) => c.revenue),
          backgroundColor: ['#202123', '#8c8c8d', '#d6d7d9'],
          borderWidth: 2,
        },
      ],
    }),
    []
  );

  const topCategoryChartOptions = useMemo(
    () => ({
      responsive: true,
      cutout: '69%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom' as const,
          labels: {
            boxWidth: 16,
            font: { size: 14 },
          },
        },
        tooltip: {
          callbacks: {
            label: function (
              context: import('chart.js').TooltipItem<'doughnut'>
            ) {
              const label = context.label || '';
              const value = context.parsed || 0;
              return `${label}: ${value} đơn`;
            },
          },
        },
      },
    }),
    []
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Doughnut data={topCategoryChartData} options={topCategoryChartOptions} />
    </Box>
  );
};

export default TopCategoriesChart;
