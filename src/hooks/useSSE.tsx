// src/hooks/useAdminSSE.ts
import { useEffect } from 'react';
import { useNotifyStore } from '../contexts/NotificationContext';
import { getSSE } from '../lib/sse';
import { Notification } from '@/types/type.notification';

export function useAdminSSE(url = '/realtime/stream') {
  const add = useNotifyStore((s) => s.add);

  useEffect(() => {
    const es = getSSE(url);

    const onNew = (e: MessageEvent) => {
      try {
        const n = JSON.parse(e.data) as Notification;
        add(n);
      } catch {}
    };

    es.addEventListener('NEW_NOTIFICATION', onNew);

    return () => {
      es.removeEventListener('NEW_NOTIFICATION', onNew);
      // không close singleton ở đây
    };
  }, [url, add]);
}
