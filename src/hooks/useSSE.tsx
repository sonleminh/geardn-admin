import { useEffect, useRef } from 'react';
import { useNotifyStore } from '../contexts/NotificationContext';
import { getSSE } from '../lib/sse';
import { Notification } from '@/types/type.notification';
import axios from 'axios';

export function useAdminSSE(url = 'http://localhost:8080/api/realtime/stream') {
  const add = useNotifyStore((s) => s.add);
  const isOpen = useNotifyStore((s) => s.isOpen);
  // flush theo lô mỗi 1s khi panel mở
  useEffect(() => {
    const es = getSSE(url);
    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data); // { event, data }
        add(payload);
      } catch {}
    };
    es.onerror = () => {
      es.close(); /* optional backoff reconnect */
    };
    return () => es.close();
  }, [url, add, isOpen]);
}
