import React from 'react';
import { ShieldAlert, Sparkles } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

/**
 * Role-specific notification banner shown at the top of the main content area.
 * Developer mode: amber containment warning.
 * QA mode: blue commander mode notice.
 */
export default function RoleBanner() {
  const { currentUser } = useAppContext();

  if (!currentUser) return null;

  return (
    <div className="flex flex-col md:flex-row gap-4 items-stretch select-none">
      {currentUser.role === 'Sr. Developer' ? (
        <div className="flex-1 bg-amber-950/20 text-[#ffb68e] border border-amber-800/40 p-3 rounded-lg flex items-center gap-3 text-xs font-sans leading-normal shadow-lg">
          <ShieldAlert className="w-5 h-5 text-amber-300 shrink-0" />
          <div>
            <span className="font-bold">Attention Developer ({currentUser.fullName}):</span>{' '}
            You are navigating in developer containment mode. System visibility is locked exclusively to your assigned bugs. Complete verification requests swiftly.
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-blue-950/25 text-[#b8c3ff] border border-blue-800/40 p-3 rounded-lg flex items-center gap-3 text-xs font-sans leading-normal shadow-lg">
          <Sparkles className="w-5 h-5 text-indigo-300 shrink-0 animate-pulse" />
          <div>
            <span className="font-bold">QA Commander Mode Active:</span>{' '}
            Welcome back, {currentUser.fullName}. You have global coordinator authorizations to logs verification requirements, re-open tickets, flag blockers, and assign developers.
          </div>
        </div>
      )}
    </div>
  );
}
