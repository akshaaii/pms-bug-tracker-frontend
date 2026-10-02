import React, { useState, useEffect } from 'react';
import { ShieldAlert, Sparkles, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

/**
 * Role-specific notification banner shown at the top of the main content area.
 * Developer mode: amber containment warning.
 * QA mode: blue commander mode notice.
 *
 * It can be closed with the X button. Once closed it stays closed (remembered
 * per user in this browser), so it no longer sits on every page.
 */
const storageKey = (employeeId: string) => `pms_role_banner_dismissed_${employeeId}`;

export default function RoleBanner() {
  const { currentUser } = useAppContext();
  const employeeId = currentUser?.employeeId;

  const [dismissed, setDismissed] = useState(false);

  // Load this user's saved choice (re-runs if a different user logs in / switches role)
  useEffect(() => {
    if (!employeeId) return;
    try {
      setDismissed(localStorage.getItem(storageKey(employeeId)) === '1');
    } catch {
      setDismissed(false);
    }
  }, [employeeId]);

  if (!currentUser || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(storageKey(currentUser.employeeId), '1');
    } catch { /* storage unavailable - banner is still hidden for this visit */ }
  };

  const closeButton = (
    <button
      type="button"
      onClick={handleDismiss}
      aria-label="Dismiss this message"
      title="Dismiss"
      className="shrink-0 p-1 rounded-md text-[#8e90a0] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
    >
      <X className="w-4 h-4" />
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row gap-4 items-stretch select-none">
      {currentUser.role === 'Sr. Developer' ? (
        <div className="flex-1 bg-amber-950/20 text-[#ffb68e] border border-amber-800/40 p-3 rounded-lg flex items-center gap-3 text-xs font-sans leading-normal shadow-lg">
          <ShieldAlert className="w-5 h-5 text-amber-300 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Attention Developer ({currentUser.fullName}):</span>{' '}
            You are navigating in developer containment mode. System visibility is locked exclusively to your assigned bugs. Complete verification requests swiftly.
          </div>
          {closeButton}
        </div>
      ) : (
        <div className="flex-1 bg-blue-950/25 text-[#b8c3ff] border border-blue-800/40 p-3 rounded-lg flex items-center gap-3 text-xs font-sans leading-normal shadow-lg">
          <Sparkles className="w-5 h-5 text-indigo-300 shrink-0 animate-pulse" />
          <div className="flex-1">
            <span className="font-bold">QA Commander Mode Active:</span>{' '}
            Welcome back, {currentUser.fullName}. You have global coordinator authorizations to logs verification requirements, re-open tickets, flag blockers, and assign developers.
          </div>
          {closeButton}
        </div>
      )}
    </div>
  );
}
