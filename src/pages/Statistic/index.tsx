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
import {
  useGetOverviewStats,
  useGetRevenueProfitStats,
} from '@/services/statistic';
import RevenueProfitChart from './components/RevenueProfitChart';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import { formatPrice } from '@/utils/format-price';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';

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

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
  bgcolor?: string;
  iconBg?: string;
}

function InfoCard({
  icon,
  title,
  content,
  bgcolor = '#fff',
  iconBg = '#ebebeb',
}: InfoCardProps) {
  return (
    <Card
      sx={{
        bgcolor,
        color: bgcolor === '#000' ? '#fff' : undefined,
        borderRadius: '2px',
      }}>
      <CardContent sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
          }}>
          <Box sx={cardIconBox(iconBg)}>{icon}</Box>
          <Typography sx={cardTitle}>{title}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {content}
        </Box>
      </CardContent>
    </Card>
  );
}

const Statistic = () => {
  // const { data: revenueProfitStats, isLoading: isLoadingRevenueProfitStats } =
  //   useGetRevenueProfitStats({
  //     fromDate: new Date(new Date().setDate(new Date().getDate() - 7)),
  //     toDate: new Date(),
  //   });
  return (
    <Container maxWidth='xl'>
      <Grid2 container spacing={3}>
        <Grid2 size={12}>
          <Card>
            <CardContent>
              <RevenueProfitChart />
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={6}>
          <Card>
            <CardContent>
              <RevenueProfitChart />
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={6}>
          <InfoCard
            icon={<MonetizationOnOutlinedIcon sx={{ fontSize: 28 }} />}
            title='Tổng doanh số'
            content={
              <Typography>
                {/* {formatPrice(revenueProfitStats?.data?.totalRevenue || 0)} */}
              </Typography>
            }
            // subtitle={`${overviewStats?.data?.totalOrders} đơn hàng`}
            // value={formatPrice(overviewStats?.data?.totalRevenue || 0)}
          />
        </Grid2>
      </Grid2>
    </Container>
  );
};

export default Statistic;
