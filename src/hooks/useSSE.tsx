import { useEffect, useRef } from 'react';
import { useNotifyStore } from '../contexts/NotificationContext';
import { getSSE } from '../lib/sse';
import { Notification } from '@/types/type.notification';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/constants/query-key';

export function useAdminSSE(url = 'http://localhost:8080/api/realtime/stream') {
  const qc = useQueryClient();
  const isOpen = useNotifyStore((s) => s.isOpen);

  const listKey = [QueryKeys.Notification, 'infinite']; // phải khớp với useNotiInfinite
  const statsKey = [QueryKeys.Notification, 'stats'];

  useEffect(() => {
    const es = getSSE(url);

    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        console.log('msg:', msg);
        const n: Notification = msg?.data ?? msg; // chuẩn hoá
        if (!n?.attributeId) return;

        // 1) Prepend vào page đầu nếu chưa tồn tại
        qc.setQueryData(listKey, (old: any) => {
          console.log('old:', old);
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

        // 2) Cập nhật badge trong cache stats
        qc.setQueryData(statsKey, (old: any) => {
          if (!old?.data) return old;
          const unread = (old.data.unreadCount ?? 0) + 1; // noti mới = chưa đọc
          const unseen = (old.data.unseenCount ?? 0) + (isOpen ? 0 : 1); // panel mở thì không tăng unseen
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
