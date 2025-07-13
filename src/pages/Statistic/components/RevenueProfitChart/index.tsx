import DateRangeMenu from '@/components/DateRangeMenu';
import { useGetRevenueProfitStats } from '@/services/statistic';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Box, Button, Divider, Typography } from '@mui/material';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import React, { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { RangeKeyDict } from 'react-date-range';

import { IRevenueProfitDateStats } from '@/interfaces/IRevenueProfitStats';
import { formatPrice } from '@/utils/format-price';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RevenueProfitChart = () => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  const { data: revenueProfitStats } = useGetRevenueProfitStats({
    fromDate: dateRange[0].startDate,
    toDate: dateRange[0].endDate,
  });

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

    const labels = revenueProfitStats?.data?.revenueProfitData.map(
      (item: IRevenueProfitDateStats) =>
        format(new Date(item.date), 'dd/MM', { locale: vi })
    );
    const revenueData = revenueProfitStats?.data?.revenueProfitData.map(
      (item: any) => item.revenue
    );
    const profitData = revenueProfitStats?.data?.revenueProfitData.map(
      (item: any) => item.profit
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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleDateSelect = (daysAgo: number) => {
    const endDate = new Date();
    const startDate = subDays(new Date(), daysAgo);
    setDateRange([{ startDate, endDate, key: 'selection' }]);
    handleClose();
  };
  const handleDateRangeChange = (rangesByKey: RangeKeyDict) => {
    const selection = rangesByKey.selection;
    if (selection.startDate && selection.endDate) {
      setDateRange([
        {
          startDate: selection.startDate,
          endDate: selection.endDate,
          key: 'selection',
        },
      ]);
    }
  };

  const getDateDisplayText = () => {
    const { startDate, endDate } = dateRange[0];
    if (!startDate || !endDate) return 'Chọn ngày';
    if (startDate.getTime() === endDate.getTime()) {
      return format(startDate, 'dd/MM/yyyy', { locale: vi });
    }
    return `${format(startDate, 'dd/MM/yyyy', { locale: vi })} - ${format(
      endDate,
      'dd/MM/yyyy',
      { locale: vi }
    )}`;
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}>
        <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
          Doanh thu và lợi nhuận
        </Typography>
        <Button
          variant='outlined'
          onClick={handleClick}
          endIcon={<KeyboardArrowDownIcon />}
          sx={{ minWidth: 150 }}>
          {getDateDisplayText()}
        </Button>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-evenly',
        }}>
        <Box>
          <Typography sx={{ fontSize: 14, color: '#a0a0a0' }}>
            Doanh thu
          </Typography>
          <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
            {formatPrice(revenueProfitStats?.data.totalRevenue || 0)}
          </Typography>
        </Box>
        <Divider orientation='vertical' flexItem />
        <Box>
          <Typography sx={{ fontSize: 14, color: '#a0a0a0' }}>
            Lợi nhuận
          </Typography>
          <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
            {formatPrice(revenueProfitStats?.data.totalProfit || 0)}
          </Typography>
        </Box>
      </Box>
      <DateRangeMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onSelect={handleDateSelect}
        dateRange={dateRange}
        onRangeChange={handleDateRangeChange}
      />
      <Box sx={{ width: '100%', height: 320, p: 0, m: 0 }}>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </>
  );
};

export default RevenueProfitChart;
