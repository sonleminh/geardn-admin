import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {
  useGetOverviewStats,
  useGetRevenueProfitStats,
} from '@/services/statistic';
import { formatPrice } from '@/utils/format-price';
import RevevueProfitChart from './components/RevevueProfitChart';
import TopCategoriesChart from './components/TopCategoriesChart';
import TopProductsCarousel from './components/TopProductsCarousel';
import DateRangeMenu from '@/components/DateRangeMenu';

// Card styles
const cardIconBox = (bgcolor: string) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  mr: 2,
  bgcolor,
  borderRadius: 3,
  p: 1,
});
const cardTitle = { fontSize: 20, fontWeight: 500 };
const cardSubTitle = { color: '#828384', fontSize: 15, fontWeight: 500 };
const cardValue = { mb: 2, fontSize: 24, fontWeight: 600 };
const cardTrend = {
  display: 'flex',
  alignItems: 'center',
  fontSize: 14,
  fontWeight: 500,
};

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value: React.ReactNode;
  trend?: React.ReactNode;
  extra?: React.ReactNode;
  bgcolor?: string;
  iconBg?: string;
}

function SummaryCard({
  icon,
  title,
  subtitle,
  value,
  trend,
  extra,
  bgcolor = '#fff',
  iconBg = '#ebebeb',
}: SummaryCardProps) {
  return (
    <Card
      sx={{
        bgcolor,
        color: bgcolor === '#000' ? '#fff' : undefined,
        borderRadius: 4,
      }}>
      <CardContent sx={{ p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={cardIconBox(iconBg)}>{icon}</Box>
            <Box>
              <Typography sx={cardTitle}>{title}</Typography>
              {subtitle && (
                <Typography sx={cardSubTitle}>{subtitle}</Typography>
              )}
            </Box>
          </Box>
          <ChevronRightOutlinedIcon
            sx={{ color: bgcolor === '#000' ? '#fff' : undefined }}
          />
        </Box>
        <Typography sx={cardValue}>{value}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {trend}
          {extra}
        </Box>
      </CardContent>
    </Card>
  );
}

const Dashboard = () => {
  const queryClient = useQueryClient();
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
  const { data: overviewStats, isLoading: isLoadingOverviewStats } =
    useGetOverviewStats();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  queryClient.invalidateQueries({ queryKey: ['Product'] });

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
    <Container maxWidth='xl'>
      <Grid2 container spacing={3}>
        <Grid2 size={3}>
          <SummaryCard
            icon={<ShoppingBagIcon sx={{ fontSize: 28 }} />}
            title='Tổng doanh số'
            subtitle={`${overviewStats?.data?.totalOrders} đơn hàng`}
            value={formatPrice(overviewStats?.data?.totalRevenue || 0)}
            trend={
              <Typography sx={cardTrend}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                <Typography component='span' sx={{ fontWeight: 500 }}>
                  +19%
                </Typography>
              </Typography>
            }
            extra={
              <Typography sx={cardTrend}>
                <Typography component='span' sx={{ mr: 1, fontWeight: 500 }}>
                  +69
                </Typography>
                <Typography
                  component='span'
                  sx={{ fontWeight: 500, color: '#828384' }}>
                  tuần này
                </Typography>
              </Typography>
            }
            bgcolor='#000'
            iconBg='#58595a'
          />
        </Grid2>
        <Grid2 size={3}>
          <SummaryCard
            icon={<VisibilityIcon sx={{ fontSize: 24 }} />}
            title='Lượt truy cập'
            subtitle='Avg.time: 4:20m'
            value='696'
            trend={
              <Typography sx={cardTrend}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                <Typography component='span' sx={{ fontWeight: 500 }}>
                  +19%
                </Typography>
              </Typography>
            }
            extra={
              <Typography sx={cardTrend}>
                <Typography component='span' sx={{ mr: 1, fontWeight: 500 }}>
                  +69
                </Typography>
                <Typography
                  component='span'
                  sx={{ fontWeight: 500, color: '#828384' }}>
                  tuần này
                </Typography>
              </Typography>
            }
          />
        </Grid2>
        <Grid2 size={3}>
          <SummaryCard
            icon={<PendingActionsIcon sx={{ fontSize: 28 }} />}
            title='Đơn hàng đang xử lý'
            value={overviewStats?.data?.pendingOrders}
            trend={
              <Typography sx={cardTrend}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                <Typography component='span' sx={{ fontWeight: 500 }}>
                  +19%
                </Typography>
              </Typography>
            }
            extra={
              <Typography sx={cardTrend}>
                <Typography component='span' sx={{ mr: 1, fontWeight: 500 }}>
                  +69
                </Typography>
                <Typography
                  component='span'
                  sx={{ fontWeight: 500, color: '#828384' }}>
                  tuần này
                </Typography>
              </Typography>
            }
          />
        </Grid2>
        <Grid2 size={3}>
          <SummaryCard
            icon={<PendingActionsIcon sx={{ fontSize: 28 }} />}
            title='Đơn hàng đang xử lý'
            value={overviewStats?.data?.pendingOrders}
            trend={
              <Typography sx={cardTrend}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                <Typography component='span' sx={{ fontWeight: 500 }}>
                  +19%
                </Typography>
              </Typography>
            }
            extra={
              <Typography sx={cardTrend}>
                <Typography component='span' sx={{ mr: 1, fontWeight: 500 }}>
                  +69
                </Typography>
                <Typography
                  component='span'
                  sx={{ fontWeight: 500, color: '#828384' }}>
                  tuần này
                </Typography>
              </Typography>
            }
          />
        </Grid2>
        <Grid2 size={9}>
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
              <DateRangeMenu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onSelect={handleDateSelect}
                dateRange={dateRange}
                onRangeChange={handleDateRangeChange}
              />
              <RevevueProfitChart
                revenueProfitStats={
                  revenueProfitStats?.data?.revenueProfitData || []
                }
              />
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography sx={{ mb: 4, fontSize: 20, fontWeight: 500 }}>
                Top danh mục
              </Typography>
              <TopCategoriesChart
                topCategories={overviewStats?.data?.bestSellingCategory || []}
                isLoading={isLoadingOverviewStats}
              />
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={12}>
          <Card>
            <CardContent>
              <TopProductsCarousel
                products={overviewStats?.data?.bestSellingProduct || []}
                isLoading={isLoadingOverviewStats}
              />
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Container>
  );
};

export default Dashboard;
