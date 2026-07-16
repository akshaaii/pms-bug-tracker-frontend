import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bug as BugIcon,
  ClipboardList,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  BookOpen,
  LogOut
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenLearnings: () => void;
}

export default function Sidebar({ currentUser, onLogout, onOpenLearnings }: SidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const testerMenuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/bugs',      name: 'Bug Reports', icon: BugIcon },
    { path: '/tasks',     name: 'Task Board',  icon: ClipboardList },
    { path: '/team',      name: 'Team',        icon: Users },
    { path: '/reports',   name: 'Reports',     icon: BarChart3 },
  ];

  const developerMenuItems = [
    { path: '/dashboard', name: 'Dashboard',    icon: LayoutDashboard },
    { path: '/bugs',      name: 'My Bugs',      icon: BugIcon },
    { path: '/tasks',     name: 'Tasks',        icon: ClipboardList },
    { path: '/team',      name: 'Pending Tasks',icon: Users },
    { path: '/reports',   name: 'Reports',      icon: BarChart3 },
  ];

  const menuItems = currentUser?.role === 'Sr. Developer' ? developerMenuItems : testerMenuItems;

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <aside className="w-[260px] h-screen fixed left-0 top-0 bg-[#161a2e] border-r border-[#2a2d3e] flex flex-col py-6 px-4 z-40 select-none">
      {/* Brand Header */}
      <div className="mb-6 px-2">
        <h1 className="text-xl font-bold font-sans tracking-tight text-[#b8c3ff] flex items-center gap-2">
          CSE – PMS
        </h1>
      </div>

      {/* User Profile Card */}
      {currentUser && (
        <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-[#0d1226]/80 border border-[#2a2d3e]/60">
          <img
            alt={currentUser.fullName}
            className="w-10 h-10 rounded-full border border-[#b8c3ff]/35 object-cover shrink-0"
            src={currentUser.avatar}
            referrerPolicy="no-referrer"
          />
          <div className="overflow-hidden">
            <p className="font-semibold text-sm font-sans text-[#dee1fd] truncate">{currentUser.fullName}</p>
            <p className="text-[11px] text-[#c4c5d7]/70 font-mono tracking-wider uppercase truncate">{currentUser.role}</p>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);
          return (
            <button
              id={`nav-${item.path.replace('/', '')}`}
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                active
                  ? 'bg-[#2f3449] text-[#b8c3ff] border-r-2 border-[#b8c3ff]'
                  : 'text-[#c4c5d7] hover:bg-[#1a1f32] hover:text-[#dee1fd]'
              }`}
            >
              <IconComponent className={`w-[18px] h-[18px] ${active ? 'text-[#b8c3ff]' : 'text-[#c4c5d7]'}`} />
              <span className="font-sans font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Controls & Learnings */}
      <div className="mt-auto pt-4 border-t border-[#2a2d3e]/50 space-y-1 bg-[#161a2e]">
        <button
          id="btn-learnings"
          onClick={onOpenLearnings}
          className="w-full flex items-center justify-center gap-2 bg-[#294fdb]/20 text-[#b8c3ff] hover:bg-[#294fdb]/35 active:scale-95 transition-all py-2 rounded-lg font-bold text-xs border border-[#294fdb]/40"
        >
          <BookOpen className="w-[14px] h-[14px]" />
          <span>Learnings</span>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-[#c4c5d7] hover:bg-[#1a1f32] hover:text-[#dee1fd] text-left ${
            isActive('/settings') ? 'bg-[#2f3449] text-[#b8c3ff]' : ''
          }`}
        >
          <Settings className="w-[16px] h-[16px]" />
          <span className="font-sans text-xs">Settings</span>
        </button>

        <button
          onClick={() => navigate('/support')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-[#c4c5d7] hover:bg-[#1a1f32] hover:text-[#dee1fd] text-left ${
            isActive('/support') ? 'bg-[#2f3449] text-[#b8c3ff]' : ''
          }`}
        >
          <HelpCircle className="w-[16px] h-[16px]" />
          <span className="font-sans text-xs">Support</span>
        </button>

        <button
          id="sidebar-logout"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#ffb4ab] hover:bg-[#93000a]/20 hover:text-red-200 transition-all text-left"
        >
          <LogOut className="w-[16px] h-[16px]" />
          <span className="font-sans text-xs font-semibold">Logout Session</span>
        </button>
      </div>
    </aside>
  );
}
