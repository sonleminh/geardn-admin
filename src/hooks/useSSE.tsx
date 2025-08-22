import { useEffect } from 'react';
import { useNotifyStore } from '../contexts/NotificationContext';
import { getSSE } from '../lib/sse';
import { Notification } from '@/types/type.notification';

export function useAdminSSE(url = 'http://localhost:8080/api/realtime/stream') {
  const add = useNotifyStore((s) => s.add);

  useEffect(() => {
    const es = getSSE(url);

    // const onNew = (e: MessageEvent) => {
    //   try {
    //     const n = JSON.parse(e.data) as Notification;
    //     console.log('[SSE] raw:', e.data);
    //     add(n);
    //   } catch {}
    // };

    const onAny = (e: MessageEvent) => {
      try {
        const n = JSON.parse(e.data) as Notification;
        add(n);
      } catch {}
    };

    // server của bạn đang không set "event:", nên onmessage sẽ nhận
    es.onmessage = onAny;

    // vẫn giữ listener tên nếu sau này BE thêm "event: NEW_NOTIFICATION"
    es.addEventListener('NEW_NOTIFICATION', onAny);

    // es.addEventListener('NEW_NOTIFICATION', onNew);

    return () => {
      es.onmessage = null;
      es.removeEventListener('NEW_NOTIFICATION', onAny);
      // không close singleton ở đây
    };
  }, [url, add]);
}
