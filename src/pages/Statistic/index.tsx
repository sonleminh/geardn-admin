import { useRoutes } from 'react-router-dom';
import StatisticLayout from './components/StatisticLayout';
import {
  Button,
  Box,
  Card,
  CardContent,
  Container,
  Grid2,
  Typography,
} from '@mui/material';
import { useGetOverviewStats } from '@/services/statistic';
import RevenueProfitChart from './components/RevenueProfitChart';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import { formatPrice } from '@/utils/format-price';

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

const Statistic = () => {
  return (
    <Container maxWidth='lg'>
      <Grid2 container spacing={3}>
        <Grid2 size={9}>
          <Card>
            <CardContent>
              <RevenueProfitChart />
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={3}>
          {/* <SummaryCard
            icon={<ShoppingBagIcon sx={{ fontSize: 28 }} />}
            title='Tổng doanh số'
            subtitle={`${overviewStats?.data?.totalOrders} đơn hàng`}
            value={formatPrice(overviewStats?.data?.totalRevenue || 0)}
          /> */}
        </Grid2>
      </Grid2>
    </Container>
  );
};

export default Statistic;
