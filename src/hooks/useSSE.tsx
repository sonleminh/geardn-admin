import { QueryKeys } from '@/constants/query-key';
import { Notification } from '@/types/type.notification';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNotifyStore } from '../contexts/NotificationContext';
import { getSSE } from '../lib/sse';

export function useAdminSSE(url = 'http://localhost:8080/api/realtime/stream') {
  const qc = useQueryClient();
  const isOpen = useNotifyStore((s) => s.isOpen);

  const listKey = [QueryKeys.Notification, 'infinite'];
  const statsKey = [QueryKeys.Notification, 'stats'];

  useEffect(() => {
    const es = getSSE(url);

    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        const n: Notification = msg;
        if (!n?.data) return;

        qc.setQueryData(listKey, (old: any) => {
          if (!old?.pages?.length) return old;

          const exists = old.pages.some((p: any) =>
            p?.data?.items?.some((it: Notification) => it.id === n.id)
          );
          if (exists) return old;

          const first = old.pages[0];
          const pageSize = first?.data?.items?.length ?? 20;

          const nextFirst = {
            ...first,
            data: {
              ...first.data,
              items: [n, ...(first.data.items || [])].slice(0, pageSize),
            },
          };

          return { ...old, pages: [nextFirst, ...old.pages.slice(1)] };
        });

        qc.setQueryData(statsKey, (old: any) => {
          if (!old?.data) return old;
          const unread = (old.data.unreadCount ?? 0) + 1;
          const unseen = (old.data.unseenCount ?? 0) + (isOpen ? 0 : 1);
          return {
            ...old,
            data: { ...old.data, unreadCount: unread, unseenCount: unseen },
          };
        });
      } catch {}
    };

    es.onerror = () => es.close();
    return () => es.close();
  }, [url, qc, isOpen]);
}
