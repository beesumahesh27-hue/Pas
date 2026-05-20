import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';

import { showAlert } from '../store/slices/alertSlice';

const POLL_MS = 30 * 1000;

const formatWhen = (iso) => {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
};

const NotificationPoller = () => {
  const dispatch = useDispatch();
  const seenRef  = useRef(new Set());

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      try {
        const { data } = await axios.get('/api/notifications/due');
        if (cancelled || !Array.isArray(data)) return;

        for (const n of data) {
          if (seenRef.current.has(n.id)) continue;
          seenRef.current.add(n.id);

          dispatch(showAlert({
            message: `"${n.job_title}" starts at ${formatWhen(n.job_start)} (in ~30 min)`,
            severity: 'warning',
          }));

          axios.post(`/api/notifications/${n.id}/dismiss`).catch(() => {
            seenRef.current.delete(n.id);
          });
        }
      } catch {
        /* silent — backend may be sleeping; try again next tick */
      }
    };

    tick();
    const id = setInterval(tick, POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, [dispatch]);

  return null;
};

export default NotificationPoller;
