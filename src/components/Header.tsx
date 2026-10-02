import React, { useState } from 'react';
import { Search, Bell, HelpCircle, Plus, Users, Download } from 'lucide-react';
import { User } from '../types';
import { useAppContext } from '../context/AppContext';

interface HeaderProps {
  currentUser: User | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onReportBugClick: () => void;
  onLogout: () => void;
  onSwitchUser: (username: string) => void;
}

// Wraps a CSV field in quotes and escapes any embedded quotes, so titles/
// comments containing commas or line breaks don't corrupt the file.
function csvField(value: string | undefined | null): string {
  const str = (value ?? '').toString();
  return `"${str.replace(/"/g, '""')}"`;
}

export default function Header({
  currentUser,
  searchQuery,
  setSearchQuery,
  onReportBugClick,
  onLogout,
  onSwitchUser,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const { bugs, resolveModuleName, resolveEmployeeName } = useAppContext();

  const notifications = [
    { id: '1', text: 'Sarah Chen added a comment on BUG-1042', time: '15m ago', unread: true },
    { id: '2', text: 'System Health metrics dropped below 95%', time: '1h ago', unread: true },
    { id: '3', text: 'Akshay reopened BUG-0003', time: 'Yesterday', unread: false },
  ];

  // Exports whatever bug rows are currently loaded (the developer's
  // assigned bugs, server-filtered/paginated same as what's on screen)
  // as a downloadable CSV file.
  const handleExportList = () => {
    if (bugs.length === 0) {
      alert('There are no bugs on the current page to export.');
      return;
    }

    const headers = ['Bug ID', 'Title', 'Module', 'Severity', 'Priority', 'Status', 'Assigned To', 'Reported By', 'Created Date', 'Updated Date'];
    const rows = bugs.map((bug) => [
      bug.id,
      bug.title,
      resolveModuleName(bug.projectId, bug.module),
      bug.severity,
      bug.priority,
      bug.status,
      bug.assignedTo ? resolveEmployeeName(bug.assignedTo) : 'Unassigned',
      resolveEmployeeName(bug.reportedBy),
      bug.createdDate || '',
      bug.updatedDate || '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(csvField).join(','))
      .join('\r\n');

    // Prepend a BOM so Excel opens the file with correct UTF-8 encoding
    // instead of mangling any non-ASCII characters in titles/names.
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `bug-list-${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="fixed top-0 right-0 h-16 ml-[260px] w-[calc(100%-260px)] bg-[#0d1226] border-b border-[#2a2d3e] flex justify-between items-center px-6 z-30 select-none">
      {/* Search Input and Links */}
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e90a0]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search bugs, modules, descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161a2e] border border-[#2a2d3e] text-xs text-[#dee1fd] rounded-lg pl-9 pr-4 py-2 focus:ring-1 focus:ring-[#b8c3ff] focus:border-[#b8c3ff] outline-none transition-all placeholder:text-[#8e90a0]/60"
          />
        </div>

        <nav className="hidden lg:flex gap-6">
          <a href="#" className="font-sans text-xs font-semibold text-[#b8c3ff] hover:text-[#b8c3ff] transition-colors border-b-2 border-[#b8c3ff] pb-5 translate-y-1">Projects</a>
        </nav>
      </div>

      {/* Trigger Buttons and User Badge */}
      <div className="flex items-center gap-4">

        {/* Quick User Role Switcher */}
        <div className="relative">
          <button
            id="role-switcher-btn"
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#1a1f32] hover:bg-[#2f3449] border border-[#2a2d3e] text-[11px] font-sans font-bold rounded-lg text-[#b8c3ff] transition-colors align-middle"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="max-w-[125px] truncate">
              {currentUser?.fullName} ({currentUser?.username === 'tester' ? 'QA' : 'Dev'})
            </span>
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-56 bg-[#1a1f32] border border-[#2a2d3e] rounded-lg shadow-xl py-1.5 z-50 text-left animate-in fade-in duration-200">
              <p className="text-[10px] font-bold text-[#8e90a0] uppercase px-3 py-1 font-mono tracking-wider">
                Quick Switch Accounts (Tester/Dev)
              </p>
              <button
                id="switch-tester"
                onClick={() => { onSwitchUser('tester'); setShowRoleSwitcher(false); }}
                className="w-full text-left px-3 py-2 text-xs text-[#dee1fd] hover:bg-[#2f3449] transition-colors flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <div>
                  <p className="font-bold">Akshay</p>
                  <p className="text-[10px] text-[#8e90a0]">QA Lead (Tester credentials)</p>
                </div>
              </button>
              <button
                id="switch-developer"
                onClick={() => { onSwitchUser('developer'); setShowRoleSwitcher(false); }}
                className="w-full text-left px-3 py-2 text-xs text-[#dee1fd] hover:bg-[#2f3449] transition-colors flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <div>
                  <p className="font-bold">Antony Lawrence</p>
                  <p className="text-[10px] text-[#8e90a0]">Sr. Developer (Dev credentials)</p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Action Triggers */}
        <div className="flex gap-1.5">
          {/* Notifications */}
          <div className="relative">
            <button
              id="bell-notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 text-[#8e90a0] hover:text-[#b8c3ff] hover:bg-[#161a2e] rounded-full transition-all relative"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-[#1a1f32] border border-[#2a2d3e] rounded-lg shadow-xl py-1.5 z-50 text-left animate-in fade-in duration-200">
                <div className="px-3 py-1.5 border-b border-[#2a2d3e]/70 flex justify-between items-center bg-[#161a2e]">
                  <span className="text-xs font-bold font-sans text-[#dee1fd]">System Alerts</span>
                  <span className="text-[10px] text-[#b8c3ff] cursor-pointer hover:underline">Mark read</span>
                </div>
                <div className="divide-y divide-[#2a2d3e]/55 max-h-64 overflow-y-auto">
                  {notifications.map((item) => (
                    <div key={item.id} className={`p-2.5 hover:bg-[#2f3449]/50 transition-colors ${item.unread ? 'bg-[#2f3449]/20' : ''}`}>
                      <p className="text-xs text-[#dee1fd] font-sans">{item.text}</p>
                      <span className="text-[10px] text-[#8e90a0] font-mono mt-1 block">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            id="header-help-trigger"
            title="System Documentation & Support Help"
            onClick={() => alert("CSE - PMS System Help Guide:\n\n1. Use credentials 'tester'/'tester' to view Akshay's QA view.\n2. Use credentials 'developer'/'developer' to view Antony Lawrence's Developer board.\n3. Create dynamic workflows with status updates, comment logs, and reopen pipelines.\n4. Click any row or sidebar button for complete fluid control.")}
            className="p-1.5 text-[#8e90a0] hover:text-[#b8c3ff] hover:bg-[#161a2e] rounded-full transition-all"
          >
            <HelpCircle className="w-[18px] h-[18px]" />
          </button>
        </div>

        <div className="h-6 w-px bg-[#2a2d3e] mx-1" />

        {/* Role-based action button */}
        {currentUser?.role === 'QA Lead' ? (
          <button
            id="btn-report-bug-trigger"
            onClick={onReportBugClick}
            className="bg-[#294fdb] hover:bg-[#4a6cf7] text-[#dee1fd] px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1 shadow-lg shadow-[#001e77]/40 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Report Bug</span>
          </button>
        ) : (
          <button
            id="btn-export-list"
            onClick={handleExportList}
            className="border border-[#294fdb] text-[#b8c3ff] px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 active:scale-95 transition-all hover:bg-[#294fdb]/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export List</span>
          </button>
        )}

        <button
          id="header-logout"
          onClick={onLogout}
          className="text-xs font-sans text-[#c4c5d7] hover:text-[#ffb4ab] transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
