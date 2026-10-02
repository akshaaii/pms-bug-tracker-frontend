import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAllBugs } from '../api';
import { Bug } from '../types';
import { useAppContext } from '../context/AppContext';

/**
 * Keeps a complete, always-fresh copy of every bug the current user can see.
 *
 * Unlike `bugs` from AppContext (which is just ONE page of the Bug Reports
 * table and is changed by the search box / filters / rows-per-page), this is
 * the full list - so the Task Board, Team and Reports pages are never missing
 * bugs or showing counts that depend on what is typed in the search box.
 *
 * It refreshes:
 *  - when the page first opens
 *  - right after this user adds / edits / changes status / reopens / reassigns a bug
 *  - every `intervalMs` while the browser tab is visible (picks up other people's changes)
 *  - when the user comes back to the tab
 */
export function useLiveBugs(intervalMs = 15000) {
  const { currentUser, dataVersion } = useAppContext();
  const [liveBugs, setLiveBugs] = useState<Bug[]>([]);
  const [loaded, setLoaded] = useState(false);

  const inFlight = useRef(false);
  const queued = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const refresh = useCallback(async () => {
    if (!currentUser) return;
    // If a request is already running, remember to run once more afterwards so a
    // change made mid-request is never missed.
    if (inFlight.current) { queued.current = true; return; }
    inFlight.current = true;
    try {
      const all = await fetchAllBugs();
      if (mounted.current) { setLiveBugs(all); setLoaded(true); }
    } catch {
      // Keep showing the last good data; a 401 is handled globally (auto-logout).
    } finally {
      inFlight.current = false;
      if (queued.current && mounted.current) { queued.current = false; refresh(); }
    }
  }, [currentUser]);

  // First load + reload after any local change
  useEffect(() => { refresh(); }, [refresh, dataVersion]);

  // Periodic refresh + refresh on returning to the tab
  useEffect(() => {
    if (!currentUser) return;
    const tick = () => { if (document.visibilityState === 'visible') refresh(); };
    const id = window.setInterval(tick, intervalMs);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('focus', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('focus', tick);
    };
  }, [currentUser, refresh, intervalMs]);

  return { liveBugs, loaded, refresh };
}
