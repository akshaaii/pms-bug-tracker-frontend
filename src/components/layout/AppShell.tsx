import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Sidebar from '../Sidebar';
import Header from '../Header';
import RoleBanner from './RoleBanner';
import LearningsModal from '../modals/LearningsModal';
import ReportBugDrawer from '../ReportBugDrawer';
import BugDetailModal from '../BugDetailModal';
import EditBugModal from '../EditBugModal';
import ReopenBugModal from '../ReopenBugModal';
import { ChangeStatusModal, ReassignBugModal } from '../ActionModals';

/**
 * Authenticated application shell.
 * Wraps every protected route with Sidebar, Header, role banner, and all modal overlays.
 * Redirects to /login when no user session exists.
 */
export default function AppShell() {
  const {
    currentUser,
    authChecked,
    handleLogout,
    handleSwitchUser,
    handleAddNewBug,
    handleUpdateBug,
    handleConfirmStatus,
    handleConfirmReopen,
    handleConfirmReassign,
    searchQuery,
    setSearchQuery,
    setIsLearningsOpen,
    isReportDrawerOpen,
    setIsReportDrawerOpen,
    selectedBugId,
    setSelectedBugId,
    editBugId,
    setEditBugId,
    reopenBugId,
    setReopenBugId,
    statusChangeBugId,
    setStatusChangeBugId,
    reassignBugId,
    setReassignBugId,
    activeDetailBug,
    activeEditBug,
    activeReopenBug,
    activeStatusChangeBug,
    activeReassignBug,
  } = useAppContext();

  const location = useLocation();

  // Rule 1: wait for the GET /session/me boot check to resolve before
  // deciding whether to redirect - otherwise a hard refresh with a still-valid
  // session cookie would flash the user to /login before the check completes.
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0d1226] flex items-center justify-center text-[#8e90a0] text-xs font-sans">
        Validating session...
      </div>
    );
  }

  // Guard: redirect unauthenticated users to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from:
      location.pathname}} replace/>;
     }


  return (
    <div className="min-h-screen bg-[#0d1226] text-[#dee1fd] flex font-sans select-none overflow-hidden">

      {/* Fixed Sidebar */}
      <Sidebar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLearnings={() => setIsLearningsOpen(true)}
      />

      {/* Main content area — offset by sidebar width */}
      <div className="flex-1 ml-[260px] h-screen overflow-y-auto flex flex-col pt-16">

        {/* Fixed top header */}
        <Header
          currentUser={currentUser}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onReportBugClick={() => setIsReportDrawerOpen(true)}
          onLogout={handleLogout}
          onSwitchUser={handleSwitchUser}
        />

        {/* Page content */}
        <main className="flex-1 p-6 space-y-6 overflow-visible max-w-7xl w-full mx-auto pb-16">

          {/* Role-based notification banner */}
          <RoleBanner />

          {/* Rendered page component via React Router <Outlet> */}
          <Outlet />

        </main>
      </div>

      {/* ── Modal & Drawer Overlays ── */}

      {/* Report New Bug drawer — tester only, hidden for developers via Header's role check */}
      <ReportBugDrawer
        isOpen={isReportDrawerOpen}
        onClose={() => setIsReportDrawerOpen(false)}
        onSave={handleAddNewBug}
        reporterName={currentUser.fullName}
        reporterTitle={currentUser.role}
        reporterAvatar={currentUser.avatar}
      />

      {/* Bug detail modal */}
      {selectedBugId && (
        <BugDetailModal
          bug={activeDetailBug}
          userRole={currentUser.role}
          onClose={() => setSelectedBugId(null)}
          onEdit={(id) => { setSelectedBugId(null); setEditBugId(id); }}
        />
      )}

      {/* Edit bug modal */}
      {editBugId && (
        <EditBugModal
          bug={activeEditBug}
          onClose={() => setEditBugId(null)}
          onUpdate={handleUpdateBug}
        />
      )}

      {/* Reopen confirmation modal */}
      {reopenBugId && (
        <ReopenBugModal
          bug={activeReopenBug}
          onClose={() => setReopenBugId(null)}
          onConfirmReopen={handleConfirmReopen}
        />
      )}

      {/* Change status modal */}
      {statusChangeBugId && (
        <ChangeStatusModal
          bug={activeStatusChangeBug}
          currentUser={currentUser}
          onClose={() => setStatusChangeBugId(null)}
          onConfirmStatus={handleConfirmStatus}
        />
      )}

      {/* Reassign owner modal */}
      {reassignBugId && (
        <ReassignBugModal
          bug={activeReassignBug}
          currentUser={currentUser}
          onClose={() => setReassignBugId(null)}
          onConfirmReassign={handleConfirmReassign}
        />
      )}

      {/* Learnings dialog */}
      <LearningsModal />

    </div>
  );
}

