import { useNotifyStore } from '@/contexts/NotificationContext';
import { Card, CardHeader, Divider, Typography } from '@mui/material';

export default function Notification() {
  const items = useNotifyStore((s) => s.items);
  return (
    <Card sx={{ mt: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
            Thông báo
          </Typography>
        }
      />
      <Divider />
      {items.map((n) => (
        <div key={n.id} className='p-3 border rounded-lg'>
          <div className='text-xs opacity-60'>{n.type}</div>
          <div className='font-medium'>{n.title}</div>
          <div className='text-xs opacity-50'>
            {new Date(n.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </Card>
  );
}
