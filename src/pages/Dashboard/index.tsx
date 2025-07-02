import { useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardHeader,
  Divider,
  Grid2,
  Link,
  Typography,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const lineData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Số lượng đơn hàng',
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    },
  ],
};

const lineOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Biểu đồ số lượng đơn hàng theo tháng',
    },
  },
};

const Dashboard = () => {
  const queryClient = useQueryClient();
  queryClient.invalidateQueries({ queryKey: ['Product'] });
  return (
    <>
      <Card sx={{ borderRadius: 2 }}>
        <Card>
          <CardHeader
            title={
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                Dashboard
              </Typography>
            }
          />
          <Divider />
          <Box sx={{ p: 2 }}>
            <Grid2 container>
              <Grid2
                size={6}
                sx={{ borderRight: '1px solid rgb(213, 213, 213)' }}>
                <Box sx={{ p: 4 }}>
                  <Typography sx={{ mb: 2 }}>
                    Top 5 trang có lượt xem nhiều nhất trong 30 ngày
                  </Typography>
                  {[1, 2, 3, 4, 5].map((_, index) => (
                    <Box
                      key={index}
                      component={Link}
                      // href={`https://${item.fullPageUrl}`}
                      target='_blank'
                      underline='hover'
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        my: 1,
                        color: '#333',
                        border: '1px solid #d3d3d3',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        ':hover': {
                          bgcolor: '#f7f7f7',
                          color: '#236dcf',
                        },
                      }}>
                      {/* <ProductOutlinedIcon sx={{ mr: 1 }} /> */}
                      <Typography>Tiêu đề: ccc</Typography>
                    </Box>
                  ))}
                </Box>
              </Grid2>
              <Divider />
              <Grid2 size={6}>
                <Line data={lineData} options={lineOptions} />
              </Grid2>
            </Grid2>
          </Box>
        </Card>
      </Card>
    </>
  );
};

export default Dashboard;
