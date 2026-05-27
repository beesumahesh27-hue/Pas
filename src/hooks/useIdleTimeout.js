import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { logout } from '../store/slices/authSlice';
import { showAlert } from '../store/slices/alertSlice';

// Auto sign-out after this many ms of no user activity.
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// User interactions that count as "active" and reset the idle timer.
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];

/**
 * Logs the user out after IDLE_TIMEOUT_MS of inactivity. Only armed while a
 * token is present; clearing the token (via logout) re-runs the effect and
 * tears the listeners/timer down. After logout, ProtectedRoute redirects to
 * /login automatically.
 */
export default function useIdleTimeout() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!token) return undefined;

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        dispatch(logout());
        dispatch(showAlert({
          message: 'Signed out due to 5 minutes of inactivity. Please sign in again.',
          severity: 'warning',
        }));
      }, IDLE_TIMEOUT_MS);
    };

    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, resetTimer, { passive: true }),
    );
    resetTimer(); // start the countdown immediately

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [token, dispatch]);
}
