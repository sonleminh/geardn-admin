import React, {
  FC,
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

import { useQueryClient } from '@tanstack/react-query';

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid2,
  Link,
  Skeleton,
  Typography,
} from '@mui/material';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { ROUTES } from '@/constants/route';
import { formatPrice } from '@/utils/format-price';
import {
  useGetOverviewStats,
  useGetRevenueProfitStats,
} from '@/services/statistic';
import DateRangeMenu from '@/components/DateRangeMenu';

const RevevueProfitChart = lazy(
  () => import('./components/RevevueProfitChart')
);
const TopCategoriesChart = lazy(
  () => import('./components/TopCategoriesChart')
);

const cardIconBox = (bgcolor: string) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: { lg: 42, xl: 48 },
  height: { lg: 42, xl: 48 },
  mr: 2,
  bgcolor,
  borderRadius: 3,
  p: 1,
});
const cardTitle = {
  fontSize: { lg: 18, xl: 20 },
  fontWeight: 500,
  lineHeight: { lg: 1.2, xl: 1.3 },
};
const cardSubTitle = {
  color: '#828384',
  fontSize: { lg: 14, xl: 15 },
  fontWeight: 500,
};
const cardValue = { mb: 2, fontSize: { lg: 22, xl: 24 }, fontWeight: 600 };
const cardTrend = {
  display: 'flex',
  alignItems: 'center',
  fontSize: 14,
  fontWeight: 500,
};

const trendingIcon = {
  mr: { lg: 0.5, xl: 1 },
  fontSize: { lg: 20, xl: 24 },
};

const valueStyle = (value: number) => ({
  mr: 1,
  fontSize: { lg: 14, xl: 16 },
  fontWeight: 500,
  color: value < 0 ? 'red' : value > 0 ? '#19e120' : '#828384',
});

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  link?: string;
  value: React.ReactNode;
  trend?: React.ReactNode;
  extra?: React.ReactNode;
  bgcolor?: string;
  iconBg?: string;
  isLoading?: boolean;
}

const SummaryCard: FC<SummaryCardProps> = memo(function SummaryCard({
  icon,
  title,
  subtitle,
  link,
  value,
  trend,
  extra,
  bgcolor = '#fff',
  iconBg = '#ebebeb',
  isLoading = false,
}) {
  return (
    <Card
      sx={{
        height: { lg: 180, xl: 204 },
        bgcolor,
        color: bgcolor === '#000' ? '#fff' : undefined,
        borderRadius: 4,
      }}>
      <CardContent sx={{ p: { lg: 2.5, xl: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: { lg: 2.5, xl: 3 },
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={cardIconBox(iconBg)}>
              {isLoading ? (
                <Skeleton
                  variant='circular'
                  width={24}
                  height={24}
                  sx={{
                    bgcolor:
                      bgcolor === '#000'
                        ? 'rgba(255, 255, 255, 0.3)'
                        : undefined,
                  }}
                />
              ) : (
                icon
              )}
            </Box>
            <Box>
              {isLoading ? (
                <>
                  <Skeleton
                    variant='text'
                    width={120}
                    height={24}
                    sx={{
                      mb: 1,
                      bgcolor:
                        bgcolor === '#000'
                          ? 'rgba(255, 255, 255, 0.3)'
                          : undefined,
                    }}
                  />
                  <Skeleton
                    variant='text'
                    width={80}
                    height={16}
                    sx={{
                      bgcolor:
                        bgcolor === '#000'
                          ? 'rgba(255, 255, 255, 0.3)'
                          : undefined,
                    }}
                  />
                </>
              ) : (
                <>
                  <Typography sx={cardTitle}>{title}</Typography>
                  {subtitle && (
                    <Typography sx={cardSubTitle}>{subtitle}</Typography>
                  )}
                </>
              )}
            </Box>
          </Box>
          <Link
            component={RouterLink}
            to={link || ''}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: '8px 0 8px 8px',
              '&:hover': {
                textDecoration: 'none',
                svg: {
                  color: bgcolor === '#000' ? '#cccccc' : '#969696',
                },
              },
            }}>
            <ChevronRightOutlinedIcon
              sx={{ color: bgcolor === '#000' ? '#fff' : undefined }}
            />
          </Link>
        </Box>
        {isLoading ? (
          <Skeleton
            variant='text'
            width={100}
            height={32}
            sx={{
              mb: 2,
              bgcolor:
                bgcolor === '#000' ? 'rgba(255, 255, 255, 0.3)' : undefined,
            }}
          />
        ) : (
          <Typography sx={cardValue}>{value}</Typography>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {isLoading ? (
            <>
              <Skeleton
                variant='text'
                width={80}
                height={20}
                sx={{
                  bgcolor:
                    bgcolor === '#000' ? 'rgba(255, 255, 255, 0.3)' : undefined,
                }}
              />
              <Skeleton
                variant='text'
                width={80}
                height={20}
                sx={{
                  bgcolor:
                    bgcolor === '#000' ? 'rgba(255, 255, 255, 0.3)' : undefined,
                }}
              />
            </>
          ) : (
            <>
              {trend}
              {extra}
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

const Dashboard: FC = () => {
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

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['Product'] });
  }, [queryClient]);

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

  const dateDisplayText = useMemo(() => {
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

  const overview = overviewStats?.data;
  const revenueProfitSeries =
    revenueProfitStats?.data?.revenueProfitStatsData || [];

  return (
    <Container maxWidth='xl'>
      <Grid2 container spacing={{ lg: 2, xl: 3 }}>
        <Grid2 size={3}>
          <SummaryCard
            icon={
              <AttachMoneyOutlinedIcon sx={{ fontSize: { lg: 24, xl: 28 } }} />
            }
            title='Tổng doanh số'
            link={ROUTES.STATISTIC_REVENUE_PROFIT}
            value={formatPrice(overview?.total?.revenue || 0)}
            trend={
              <Typography sx={cardTrend}>
                {overview && overview?.growth?.revenue > 0 ? (
                  <TrendingUpIcon
                    sx={{
                      ...trendingIcon,
                      color: '#19e120',
                    }}
                  />
                ) : overview && overview?.growth?.revenue < 0 ? (
                  <TrendingDownIcon
                    sx={{
                      ...trendingIcon,
                      color: 'red',
                    }}
                  />
                ) : (
                  <TrendingFlatIcon
                    sx={{
                      ...trendingIcon,
                      color: '#828384',
                    }}
                  />
                )}
                <Typography
                  component='span'
                  sx={valueStyle(overview?.growth?.revenue || 0)}>
                  {overview?.growth?.revenue?.toFixed(2)}%
                </Typography>
              </Typography>
            }
            extra={
              <Typography sx={cardTrend}>
                <Typography
                  component='span'
                  sx={{
                    mr: { lg: 0.5, xl: 1 },
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}>
                  {/* {formatPrice(overview?.total?.totalCurrentMonthRevenue || 0)} */}
                  99.999.000 d
                </Typography>
                <Typography
                  component='span'
                  sx={{
                    fontWeight: 500,
                    color: '#828384',
                    whiteSpace: 'nowrap',
                  }}>
                  tháng này
                </Typography>
              </Typography>
            }
            bgcolor='#000'
            iconBg='#58595a'
            isLoading={isLoadingOverviewStats}
          />
        </Grid2>

        <Grid2 size={3}>
          <SummaryCard
            icon={<ShoppingBagOutlinedIcon sx={{ fontSize: 28 }} />}
            title='Tổng đơn hàng'
            link={ROUTES.STATISTIC_ORDER}
            value={
              <Typography
                sx={{ fontSize: { lg: 22, xl: 24 }, fontWeight: 500 }}>
                {overview?.total?.orders || 0} đơn
              </Typography>
            }
            trend={
              <Typography sx={cardTrend}>
                {overview && overview?.growth?.delivered > 0 ? (
                  <TrendingUpIcon sx={{ ...trendingIcon, color: '#59b35c' }} />
                ) : overview && overview?.growth?.delivered < 0 ? (
                  <TrendingDownIcon sx={{ ...trendingIcon, color: 'red' }} />
                ) : (
                  <TrendingFlatIcon
                    sx={{
                      ...trendingIcon,
                      color: '#828384',
                    }}
                  />
                )}
                <Typography
                  component='span'
                  sx={valueStyle(overview?.growth?.delivered || 0)}>
                  {overview?.growth?.delivered?.toFixed(2)}%
                </Typography>
              </Typography>
            }
            extra={
              <Typography sx={cardTrend}>
                <Typography component='span' sx={{ mr: 1, fontWeight: 500 }}>
                  {overview?.total?.deliveredThisMonthCount || 0}
                </Typography>
                <Typography
                  component='span'
                  sx={{ fontWeight: 500, color: '#828384' }}>
                  tháng này
                </Typography>
              </Typography>
            }
            isLoading={isLoadingOverviewStats}
          />
        </Grid2>

        <Grid2 size={3}>
          <SummaryCard
            icon={<PendingActionsIcon sx={{ fontSize: 28 }} />}
            title='Đơn đang xử lý'
            link={ROUTES.ORDER_LIST}
            value={
              <Typography sx={{ fontSize: 24, fontWeight: 500 }}>
                {overview?.total?.pendingOrders || 0} đơn
              </Typography>
            }
            isLoading={isLoadingOverviewStats}
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
                {overview && overview?.growth?.delivered > 0 ? (
                  <TrendingUpIcon sx={{ ...trendingIcon, color: '#59b35c' }} />
                ) : overview && overview?.growth?.delivered < 0 ? (
                  <TrendingDownIcon sx={{ ...trendingIcon, color: 'red' }} />
                ) : (
                  <TrendingFlatIcon
                    sx={{
                      ...trendingIcon,
                      color: '#828384',
                    }}
                  />
                )}
                <Typography component='span' sx={{ fontWeight: 500 }}>
                  +..%
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
            isLoading={isLoadingOverviewStats}
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
                  {dateDisplayText}
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

              <Suspense
                fallback={
                  <Skeleton variant='rectangular' width='100%' height={320} />
                }>
                <RevevueProfitChart revenueProfitStats={revenueProfitSeries} />
              </Suspense>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography sx={{ mb: 4, fontSize: 20, fontWeight: 500 }}>
                Top danh mục
              </Typography>
              <Suspense
                fallback={
                  <Skeleton variant='rectangular' width='100%' height={240} />
                }>
                <TopCategoriesChart
                  topCategories={overview?.bestSellingCategory || []}
                  isLoading={isLoadingOverviewStats}
                />
              </Suspense>
            </CardContent>
          </Card>
        </Grid2>

        {/* 
        <Grid2 size={12}>
          <Card>
            <CardContent>
              <TopProductsCarousel
                products={overview?.bestSellingProduct || []}
                isLoading={isLoadingOverviewStats}
              />
            </CardContent>
          </Card>
        </Grid2> */}
      </Grid2>
    </Container>
  );
};

export default Dashboard;
