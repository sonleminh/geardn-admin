import { useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid2,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { DateRange, RangeKeyDict } from 'react-date-range';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

// Import react-date-range styles
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useGetProfitRevenueDailyStats } from '@/services/statistic';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const phakeData = [
  {
    date: '2025-06-26T00:00:00.000Z',
    revenue: 1500000,
    profit: 200000,
  },
  {
    date: '2025-06-27T00:00:00.000Z',
    revenue: 319000,
    profit: 50000,
  },
  {
    date: '2025-06-28T00:00:00.000Z',
    revenue: 339000,
    profit: 60000,
  },
];

// Fake data for top categories
const topCategories = [
  { name: 'Điện thoại', value: 320 },
  { name: 'Laptop', value: 210 },
  { name: 'Phụ kiện', value: 150 },
];

const Dashboard = () => {
  const queryClient = useQueryClient();

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  // Use the data to prevent unused variable warning
  const { data: profitRevenueDailyStats } = useGetProfitRevenueDailyStats({
    fromDate: dateRange[0].startDate,
    toDate: dateRange[0].endDate,
  });

  // Transform API data for chart
  const chartData = useMemo(() => {
    if (!profitRevenueDailyStats?.data) {
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

    const labels = profitRevenueDailyStats.data.map((item: any) =>
      format(new Date(item.date), 'dd/MM', { locale: vi })
    );
    const revenueData = profitRevenueDailyStats.data.map(
      (item: any) => item.revenue
    );
    const profitData = profitRevenueDailyStats.data.map(
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
  }, [profitRevenueDailyStats]);
  // const chartData = useMemo(() => {
  //   if (!profitRevenueDailyStats?.data) {
  //     return {
  //       labels: [],
  //       datasets: [
  //         {
  //           label: 'Doanh thu',
  //           data: [],
  //           fill: false,
  //           borderColor: 'rgb(75, 192, 192)',
  //           backgroundColor: 'rgba(75, 192, 192, 0.2)',
  //           tension: 0.1,
  //         },
  //         {
  //           label: 'Lợi nhuận',
  //           data: [],
  //           fill: false,
  //           borderColor: 'rgb(255, 99, 132)',
  //           backgroundColor: 'rgba(255, 99, 132, 0.2)',
  //           tension: 0.1,
  //         },
  //       ],
  //     };
  //   }

  //   const labels = profitRevenueDailyStats.data.map((item: any) =>
  //     format(new Date(item.date), 'dd/MM', { locale: vi })
  //   );
  //   const revenueData = profitRevenueDailyStats.data.map(
  //     (item: any) => item.revenue
  //   );
  //   const profitData = profitRevenueDailyStats.data.map(
  //     (item: any) => item.profit
  //   );

  //   return {
  //     labels,
  //     datasets: [
  //       {
  //         label: 'Doanh thu (VNĐ)',
  //         data: revenueData,
  //         fill: false,
  //         borderColor: 'rgb(75, 192, 192)',
  //         backgroundColor: 'rgba(75, 192, 192, 0.2)',
  //         tension: 0.1,
  //         yAxisID: 'y',
  //       },
  //       {
  //         label: 'Lợi nhuận (VNĐ)',
  //         data: profitData,
  //         fill: false,
  //         borderColor: 'rgb(255, 99, 132)',
  //         backgroundColor: 'rgba(255, 99, 132, 0.2)',
  //         tension: 0.1,
  //         yAxisID: 'y',
  //       },
  //     ],
  //   };
  // }, [profitRevenueDailyStats]);

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

  queryClient.invalidateQueries({ queryKey: ['Product'] });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDateSelect = (daysAgo: number) => {
    const endDate = new Date();
    const startDate = subDays(new Date(), daysAgo);

    setDateRange([
      {
        startDate,
        endDate,
        key: 'selection',
      },
    ]);
    handleClose();

    // Here you can add logic to fetch data based on the selected date range
    console.log(
      `Selected date range: ${format(startDate, 'dd/MM/yyyy', {
        locale: vi,
      })} - ${format(endDate, 'dd/MM/yyyy', { locale: vi })}`
    );
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

  const topCategoryChartData = useMemo(
    () => ({
      labels: topCategories.map((c) => c.name),
      datasets: [
        {
          data: topCategories.map((c) => c.value),
          backgroundColor: ['#1976d2', '#38ad48', '#f59e42'],
          borderWidth: 2,
        },
      ],
    }),
    []
  );

  const topCategoryChartOptions = useMemo(
    () => ({
      responsive: true,
      cutout: '95%',
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
    <Container maxWidth='lg'>
      <Grid2 container spacing={3}>
        <Grid2 size={4}>
          <Card
            sx={{
              bgcolor: '#000',
              color: '#fff',
              borderRadius: 8,
            }}>
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 3,
                }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      mr: 2,
                      bgcolor: '#58595a',
                      borderRadius: 3,
                      p: 1,
                    }}>
                    <ShoppingBagIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                      Tổng doanh số
                    </Typography>
                    <Typography
                      sx={{
                        color: '#828384',
                        fontSize: 15,
                        fontWeight: 500,
                      }}>
                      1231 đơn hàng
                    </Typography>
                  </Box>
                </Box>
                <ChevronRightOutlinedIcon sx={{ color: '#fff' }} />
              </Box>
              <Typography sx={{ mb: 2, fontSize: 24, fontWeight: 600 }}>
                220.000.000 VNĐ
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 14,
                    fontWeight: 500,
                    mr: 2,
                  }}>
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  <Typography component={'span'} sx={{ fontWeight: 500 }}>
                    +19%
                  </Typography>
                </Typography>
                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 14,
                    fontWeight: 500,
                  }}>
                  <Typography sx={{ mr: 1, fontWeight: 500 }}>+69</Typography>
                  <Typography
                    component={'span'}
                    sx={{ fontWeight: 500, color: '#828384' }}>
                    tuần này
                  </Typography>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={4}>
          <Card
            sx={{
              borderRadius: 8,
            }}>
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 3,
                }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      mr: 2,
                      bgcolor: '#ebebeb',
                      borderRadius: 3,
                      p: 1,
                    }}>
                    <VisibilityIcon sx={{ fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                      Lượt truy cập
                    </Typography>
                    <Typography
                      sx={{
                        color: '#828384',
                        fontSize: 15,
                        fontWeight: 500,
                      }}>
                      Avg.time: 4:20m
                    </Typography>
                  </Box>
                </Box>
                <ChevronRightOutlinedIcon sx={{ color: '#fff' }} />
              </Box>
              <Typography sx={{ mb: 2, fontSize: 24, fontWeight: 600 }}>
                696
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 14,
                    fontWeight: 500,
                    mr: 2,
                  }}>
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  <Typography component={'span'} sx={{ fontWeight: 500 }}>
                    +19%
                  </Typography>
                </Typography>
                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 14,
                    fontWeight: 500,
                  }}>
                  <Typography sx={{ mr: 1, fontWeight: 500 }}>+69</Typography>
                  <Typography
                    component={'span'}
                    sx={{ fontWeight: 500, color: '#828384' }}>
                    tuần này
                  </Typography>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={4}>
          <Card
            sx={{
              borderRadius: 8,
            }}>
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 3,
                }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      mr: 2,
                      bgcolor: '#ebebeb',
                      borderRadius: 3,
                      p: 1,
                    }}>
                    <PendingActionsIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                      Đơn hàng đang xử lý
                    </Typography>
                    <Typography
                      sx={{
                        color: '#828384',
                        fontSize: 15,
                        fontWeight: 500,
                      }}>
                      ...
                    </Typography>
                  </Box>
                </Box>
                <ChevronRightOutlinedIcon sx={{ color: '#fff' }} />
              </Box>
              <Typography sx={{ mb: 2, fontSize: 24, fontWeight: 600 }}>
                69
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 14,
                    fontWeight: 500,
                    mr: 2,
                  }}>
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  <Typography component={'span'} sx={{ fontWeight: 500 }}>
                    +19%
                  </Typography>
                </Typography>
                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 14,
                    fontWeight: 500,
                  }}>
                  <Typography sx={{ mr: 1, fontWeight: 500 }}>+69</Typography>
                  <Typography
                    component={'span'}
                    sx={{ fontWeight: 500, color: '#828384' }}>
                    tuần này
                  </Typography>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={8}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
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
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                PaperProps={{
                  sx: {
                    p: 1,
                    minWidth: 200,
                  },
                }}>
                <MenuItem onClick={() => handleDateSelect(7)}>
                  7 ngày trước
                </MenuItem>
                <MenuItem onClick={() => handleDateSelect(14)}>
                  14 ngày trước
                </MenuItem>
                <MenuItem onClick={() => handleDateSelect(30)}>
                  30 ngày trước
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ p: 1 }}>
                  <DateRange
                    ranges={dateRange}
                    onChange={handleDateRangeChange}
                    months={1}
                    direction='horizontal'
                    showDateDisplay={false}
                    showMonthAndYearPickers={false}
                    rangeColors={['#1976d2']}
                  />
                </Box>
              </Menu>
              <Box sx={{ width: '100%', height: 320, p: 0, m: 0 }}>
                <Line data={chartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={4}>
          <Card>
            <CardContent>
              <Box>
                <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                  Top danh mục
                </Typography>
                <Box sx={{ width: '100%', maxWidth: 320, mx: 'auto', mt: 2 }}>
                  <Doughnut
                    data={topCategoryChartData}
                    options={topCategoryChartOptions}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Container>
  );
};

export default Dashboard;
