import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import React, { useCallback, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { RangeKeyDict } from 'react-date-range';
import { useNavigate } from 'react-router-dom';

import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Link,
  Typography,
} from '@mui/material';

import DateRangeMenu from '@/components/DateRangeMenu';
import { ROUTES } from '@/constants/route';
import { IOrderDateStats } from '@/interfaces/IStats';
import {
  useGetOrderStats,
  useGetOrderSummaryStats,
} from '@/services/statistic';

interface SummaryStatProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  iconBg: string;
}

const valueStyle = (value: number) => ({
  fontSize: 28,
  fontWeight: 500,
  color: value < 0 ? 'red' : 'green',
});

const SummaryStat: React.FC<SummaryStatProps> = ({
  label,
  value,
  icon,
  iconBg,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 48,
            height: 48,
            mr: 2,
            bgcolor: iconBg,
            borderRadius: '50%',
          }}>
          {icon}
        </Box>
        <Typography sx={{ fontSize: 16, fontWeight: 500 }}>{label}</Typography>
      </Box>
      {value}
    </Box>
  );
};

const UserStats: React.FC = () => {
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState<
    [{ startDate: Date; endDate: Date; key: string }]
  >([
    {
      startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { data: orderSummaryStats } = useGetOrderSummaryStats();

  const summaryStats = useMemo(
    () => [
      {
        label: 'Tổng lượt truy cập',
        value: (
          <Typography sx={{ fontSize: 28, fontWeight: 500 }}>
            {orderSummaryStats?.data.totals.delivered || 0}
          </Typography>
        ),
        icon: <ShoppingBagOutlinedIcon sx={{ color: '#fff' }} />,
        iconBg: '#000',
      },

      {
        label: 'Tăng trưởng tháng',
        value: (
          <Typography
            sx={valueStyle(orderSummaryStats?.data?.growth?.delivered || 0)}>
            {orderSummaryStats?.data?.growth?.delivered?.toFixed(2) || 0} %
          </Typography>
        ),
        icon: <TrendingUpIcon sx={{ color: '#fff' }} />,
        iconBg: '#59b35c',
      },
      {
        label: '...',
        value: (
          <Typography sx={{ fontSize: 28, fontWeight: 500 }}>
            {orderSummaryStats?.data.totals.delivered || 0}
          </Typography>
        ),
        icon: <AttachMoneyIcon sx={{ color: '#fff' }} />,
        iconBg: '#000',
      },
      {
        label: '...',
        value: (
          <Typography
            sx={valueStyle(orderSummaryStats?.data?.growth?.delivered || 0)}>
            {orderSummaryStats?.data?.growth?.delivered?.toFixed(2) || 0} %
          </Typography>
        ),
        icon: <TrendingUpIcon sx={{ color: '#fff' }} />,
        iconBg: '#59b35c',
      },
    ],
    [orderSummaryStats]
  );

  const { data: orderStats } = useGetOrderStats({
    fromDate: dateRange[0].startDate,
    toDate: dateRange[0].endDate,
  });

  const chartData = useMemo(() => {
    if (!orderStats) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Lượt truy cập',
            data: [],
            fill: false,
            borderColor: '#000',
            backgroundColor: '#fff',
            tension: 0.1,
          },
        ],
      };
    }

    const labels = orderStats?.data?.orderStats.map((item: IOrderDateStats) => {
      return format(new Date(item.date), 'dd/MM', { locale: vi });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Lượt truy cập',
          data: orderStats?.data?.orderStats.map(
            (item: IOrderDateStats) => item.orders
          ),
          fill: false,
          borderColor: '#000',
          backgroundColor: '#fff',
          tension: 0.4,
          yAxisID: 'y',
        },
      ],
    };
  }, [orderStats]);

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

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget),
    []
  );
  const handleClose = useCallback(() => setAnchorEl(null), []);
  const handleDateSelect = useCallback(
    (daysAgo: number) => {
      const endDate = new Date();
      const startDate = subDays(new Date(), daysAgo);
      setDateRange([{ startDate, endDate, key: 'selection' }]);
      handleClose();
    },
    [handleClose]
  );
  const handleDateRangeChange = useCallback((rangesByKey: RangeKeyDict) => {
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
  }, []);

  const getDateDisplayText = useCallback(() => {
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
  }, [dateRange]);

  return (
    <>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize='small' />}
        aria-label='breadcrumb'
        sx={{ mb: 3 }}>
        <Link
          underline='hover'
          color='inherit'
          onClick={() => navigate(ROUTES.DASHBOARD)}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <HomeOutlinedIcon sx={{ fontSize: 24 }} />
        </Link>
        <Typography color='text.primary'>Thống kê</Typography>
        <Typography color='text.primary'>Người dùng</Typography>
      </Breadcrumbs>
      <Card>
        <CardContent>
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 4,
              }}>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                Lượt truy cập
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
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: '#696969' }}>Lượt truy cập</Typography>
                <Typography
                  sx={{ fontSize: 20, fontWeight: 600, color: '#333' }}>
                  {orderSummaryStats?.data?.totals?.delivered || 0}
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
            <Box sx={{ width: '100%', height: 400, p: 0, m: 0 }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            {summaryStats.map((stat, idx) => (
              <Box
                key={idx}
                sx={{
                  width: '25%',
                  borderLeft: idx !== 0 ? '1px solid #e0e0e0' : 'none',
                }}>
                <Box sx={{ px: 3 }}>
                  <SummaryStat {...stat} />
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

export default UserStats;
