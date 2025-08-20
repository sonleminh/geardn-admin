import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Box, CircularProgress } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';

import { ArcElement, Chart as ChartJS, Legend, Title, Tooltip } from 'chart.js';
import { formatPrice } from '@/utils/format-price';

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
              return `${label}: ${formatPrice(value)}`;
            },
          },
        },
      },
    }),
    []
  );

  return (
    <Box sx={{ width: '80%', mx: 'auto' }}>
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
