import { IProfitRevenueDailyStats } from '@/interfaces/IProfitRevenueDailyStats';
import { Box, CircularProgress } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import React, { useMemo } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import CircularProgressWithLabel from '@/components/CircularProgress';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface ITopCategories {
  categoryId: number;
  categoryName: string;
  quantitySold: number;
  revenue: number;
}

interface TopCategoriesChartProps {
  topCategories: ITopCategories[];
  isLoading?: boolean;
}

function TopCategoriesChart({
  topCategories,
  isLoading = false,
}: TopCategoriesChartProps) {
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
    [topCategories]
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
      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}>
          <CircularProgress size={120} sx={{ my: 2 }} />
          <Skeleton variant='text' width={200} height={40} />
          <Skeleton variant='text' width={200} height={40} />
        </Box>
      ) : (
        <Doughnut
          data={topCategoryChartData}
          options={topCategoryChartOptions}
        />
      )}
    </Box>
  );
}

export default TopCategoriesChart;
