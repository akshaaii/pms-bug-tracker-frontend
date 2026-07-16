import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  demoLogin,
  demoLogout,
  fetchBugs,
  fetchBugDetail,
  createBug as apiCreateBug,
  updateBug as apiUpdateBug,
  updateBugStatus as apiUpdateBugStatus,
  reopenBug as apiReopenBug,
  reassignBug as apiReassignBug,
  uploadScreenshot as apiUploadScreenshot,
  fetchProjects,
  fetchModules,
  fetchDevelopers,
  fetchCurrentSessionUser,
  setUnauthorizedHandler,
  setRateLimitHandler,
} from '../api';
import { Bug, User, BugStatus, FilterState, Role, Project, ProjectModule, Developer, PageInfo } from '../types';
import { USERS } from '../data';

// ─── Context Shape ─────────────────────────────────────────────────────────────

interface AppContextValue {
  // Auth
  currentUser: User | null;
  authChecked: boolean; // true once the initial GET /session/me check has resolved
  handleLogin: (username: string, password: string) => Promise<string | null>;
  handleLogout: () => void;
  handleSwitchUser: (username: string) => Promise<void>;

  // Bug data
  bugs: Bug[];
  isLoadingBugs: boolean;
  isLoadingBugDetail: boolean;
  pageInfo: PageInfo;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  refetchBugs: () => void;
  handleAddNewBug: (payload: CreateBugPayload) => Promise<Bug>;
  handleUpdateBug: (bugId: string, payload: UpdateBugPayload) => Promise<Bug>;
  handleConfirmStatus: (bugId: string, newStatus: BugStatus, comment: string) => Promise<void>;
  handleConfirmReopen: (bugId: string, reason: string, comment: string, screenshotFile?: File | null) => Promise<void>;
  handleConfirmReassign: (bugId: string, newAssigneeId: string, comment?: string) => Promise<void>;

  // Search & Filters (server-side - every change triggers a refetch)
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;

  // Dashboard-style aggregate counts (derived from the currently loaded page only)
  activeBugsCount: number;
  criticalBugsCount: number;
  resolvedTodayCount: number;
  pendingReviewCount: number;

  // Dropdown/lookup data - fetched from the backend, never hardcoded
  projects: Project[];
  developers: Developer[];
  getModulesForProject: (projectId: string) => Promise<ProjectModule[]>;
  resolveModuleName: (projectId: string | undefined, moduleId: string) => string;
  resolveEmployeeName: (employeeId: string | undefined | null) => string;

  // Filter option arrays (project list comes from the API; the rest are
  // fixed backend-enforced enums or derived from lookups)
  projectOptions: string[];
  moduleOptions: { moduleId: string; moduleName: string }[];
  statusOptions: string[];
  priorityOptions: string[];
  severityOptions: string[];
  assigneeOptions: Developer[];

  // Modal / overlay state
  selectedBugId: string | null;
  setSelectedBugId: React.Dispatch<React.SetStateAction<string | null>>;
  editBugId: string | null;
  setEditBugId: React.Dispatch<React.SetStateAction<string | null>>;
  reopenBugId: string | null;
  setReopenBugId: React.Dispatch<React.SetStateAction<string | null>>;
  statusChangeBugId: string | null;
  setStatusChangeBugId: React.Dispatch<React.SetStateAction<string | null>>;
  reassignBugId: string | null;
  setReassignBugId: React.Dispatch<React.SetStateAction<string | null>>;
  isReportDrawerOpen: boolean;
  setIsReportDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLearningsOpen: boolean;
  setIsLearningsOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Active bug references (derived from IDs above)
  activeDetailBug: Bug | null;
  activeEditBug: Bug | null;
  activeReopenBug: Bug | null;
  activeStatusChangeBug: Bug | null;
  activeReassignBug: Bug | null;
}

export interface CreateBugPayload {
  projectId: string;
  moduleId: string;
  title: string;
  severity: string;
  priority: string;
  environment: string;
  description: string;
  expectedOutput?: string;
  actualResult: string;
  assignedToId?: string;
  screenshotFile?: File | null;
}

export interface UpdateBugPayload {
  moduleId: string;
  title: string;
  severity: string;
  priority: string;
  status: string;
  environment: string;
  description: string;
  expectedOutput?: string;
  actualResult: string;
  assignedToId?: string | null;
  versionNum?: number;
}

const EMPTY_PAGE: PageInfo = { totalElements: 0, totalPages: 1, number: 0, size: 10, first: true, last: true };

// ─── Context & Provider ────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Data state
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [isLoadingBugs, setIsLoadingBugs] = useState(false);
  const [isLoadingBugDetail, setIsLoadingBugDetail] = useState(false);
  const [pageInfo, setPageInfo] = useState<PageInfo>(EMPTY_PAGE);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Lookup/dropdown data
  const [projects, setProjects] = useState<Project[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [modulesByProject, setModulesByProject] = useState<Record<string, ProjectModule[]>>({});

  // Search & filter state
  const [searchQuery, setSearchQueryState] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    projectId: 'All Projects',
    module: 'All Modules',
    status: 'All Statuses',
    priority: 'All Priorities',
    severity: 'All Severities',
    assignedTo: 'All Users',
  });

  // Modal state
  const [selectedBugId, setSelectedBugId] = useState<string | null>(null);
  const [editBugId, setEditBugId] = useState<string | null>(null);
  const [reopenBugId, setReopenBugId] = useState<string | null>(null);
  const [statusChangeBugId, setStatusChangeBugId] = useState<string | null>(null);
  const [reassignBugId, setReassignBugId] = useState<string | null>(null);
  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState(false);
  const [isLearningsOpen, setIsLearningsOpen] = useState(false);

  // Rule 12: GET /bugs returns a lightweight summary per row (no description,
  // environment, comments, screenshots, expectedOutput/actualResult, or
  // versionNum). Whenever a modal that needs the full record opens, fetch
  // GET /bugs/{bugId} and merge the full detail into local state so Edit/View
  // always have accurate data - especially versionNum for optimistic locking.
  useEffect(() => {
    const idToLoad = selectedBugId || editBugId;
    if (!idToLoad) return;
    setIsLoadingBugDetail(true);
    fetchBugDetail(idToLoad)
      .then(full => {
        setBugs(prev => prev.map(b => (b.id === full.id ? { ...b, ...full } : b)));
      })
      .catch(() => { /* 401 handled globally; other errors leave the summary row in place */ })
      .finally(() => setIsLoadingBugDetail(false));
  }, [selectedBugId, editBugId]);

  // ─── Session boot check ─────────────────────────────────────────────────────
  // Rule 1: on app boot, validate the session against the backend before
  // rendering anything protected. localStorage is only used to remember the
  // demo-login username (for the avatar lookup) - it is NEVER trusted as
  // proof of an active session by itself.
  useEffect(() => {
    (async () => {
      try {
        const sessionUser = await fetchCurrentSessionUser();
        const savedRaw = localStorage.getItem('pms_user_session');
        let username = '';
        try { username = savedRaw ? JSON.parse(savedRaw).username : ''; } catch { /* ignore */ }
        setCurrentUser({
          username,
          employeeId: sessionUser.employeeId,
          fullName: sessionUser.fullName,
          role: sessionUser.role as Role,
          avatar: USERS[username]?.avatar || '',
        });
      } catch {
        // Session is invalid/expired/backend restarted - clear everything
        // and let AppShell's guard redirect to /login.
        localStorage.removeItem('pms_user_session');
        setCurrentUser(null);
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  // Rule 1: any API call returning 401 anywhere in the app triggers an
  // immediate auto-logout, registered once here so every call site benefits.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setCurrentUser(null);
      setBugs([]);
      localStorage.removeItem('pms_user_session');
    });
    // Rule 20: surface rate-limit hits without automatic retries.
    setRateLimitHandler(() => {
      // eslint-disable-next-line no-alert
      alert('Too many requests, please slow down.');
    });
    return () => {
      setUnauthorizedHandler(null);
      setRateLimitHandler(null);
    };
  }, []);

  // ─── Lookup data (projects / developers) ───────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    fetchProjects().then(setProjects).catch(() => setProjects([]));
    fetchDevelopers().then(setDevelopers).catch(() => setDevelopers([]));
  }, [currentUser]);

  const getModulesForProject = useCallback(async (projectId: string): Promise<ProjectModule[]> => {
    if (!projectId) return [];
    if (modulesByProject[projectId]) return modulesByProject[projectId];
    const mods = await fetchModules(projectId);
    setModulesByProject(prev => ({ ...prev, [projectId]: mods }));
    return mods;
  }, [modulesByProject]);

  // Best-effort: pre-warm the module cache for every project once we know
  // the project list, so table/detail views can resolve moduleId -> name
  // without an extra round trip per row.
  useEffect(() => {
    projects.forEach(p => {
      if (!modulesByProject[p.projectId]) {
        fetchModules(p.projectId)
          .then(mods => setModulesByProject(prev => ({ ...prev, [p.projectId]: mods })))
          .catch(() => { /* ignore - resolveModuleName falls back to the raw id */ });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  const resolveModuleName = useCallback((projectId: string | undefined, moduleId: string): string => {
    if (!moduleId) return '';
    if (projectId && modulesByProject[projectId]) {
      const found = modulesByProject[projectId].find(m => m.moduleId === moduleId);
      if (found) return found.moduleName;
    }
    // Fall back to scanning every cached project's modules (covers cases
    // where the caller doesn't know the projectId up front).
    for (const mods of Object.values(modulesByProject)) {
      const found = mods.find(m => m.moduleId === moduleId);
      if (found) return found.moduleName;
    }
    return moduleId;
  }, [modulesByProject]);

  // Best-effort employeeId -> fullName resolution. The backend only exposes
  // a developers lookup (GET /resources/developers) plus the current
  // session user - there is no "list all testers" endpoint, so a tester
  // other than the one currently logged in falls back to showing the raw
  // employeeId rather than guessing a name.
  const resolveEmployeeName = useCallback((employeeId: string | undefined | null): string => {
    if (!employeeId) return '';
    if (currentUser && currentUser.employeeId === employeeId) return currentUser.fullName;
    const dev = developers.find(d => d.employeeId === employeeId);
    if (dev) return dev.fullName;
    return employeeId;
  }, [currentUser, developers]);

  // ─── Bug list fetch (server-side filtering + pagination) ──────────────────
  const buildFilterParams = useCallback((): Record<string, string | undefined> => {
    const params: Record<string, string | undefined> = {
      search: searchQuery.trim() || undefined,
      projectId: filters.projectId !== 'All Projects' ? filters.projectId : undefined,
      moduleId: filters.module !== 'All Modules' ? filters.module : undefined,
      status: filters.status !== 'All Statuses' ? filters.status : undefined,
      priority: filters.priority !== 'All Priorities' ? filters.priority : undefined,
      severity: filters.severity !== 'All Severities' ? filters.severity : undefined,
    };
    // Rule 24: never send assignedTo as a filter for developers - the
    // backend force-filters their results server-side regardless.
    if (currentUser?.role !== 'Sr. Developer' && filters.assignedTo !== 'All Users') {
      params.assignedTo = filters.assignedTo;
    }
    return params;
  }, [searchQuery, filters, currentUser]);

  const loadBugs = useCallback(() => {
    if (!currentUser) return;
    setIsLoadingBugs(true);
    fetchBugs(buildFilterParams(), page, pageSize)
      .then(result => {
        setBugs(result.bugs);
        setPageInfo(result.page);
      })
      .catch(() => {
        // A 401 here is already handled globally (auto-logout). Any other
        // error just leaves the previous list in place rather than nuking
        // the UI silently.
      })
      .finally(() => setIsLoadingBugs(false));
  }, [currentUser, buildFilterParams, page, pageSize]);

  useEffect(() => {
    loadBugs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, page, pageSize, filters, searchQuery]);

  // Reset to page 0 whenever filters/search change so the user doesn't get
  // stranded on an out-of-range page.
  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchQuery]);

  const setSearchQuery = (q: string) => setSearchQueryState(q);

  // ─── Auth handlers ─────────────────────────────────────────────────────────

  const handleLogin = async (username: string, password: string): Promise<string | null> => {
    try {
      const result = await demoLogin(username.trim(), password.trim());
      const uname = username.toLowerCase().trim();
      const localAvatar = USERS[uname]?.avatar || '';
      const user: User = {
        username: uname,
        employeeId: result.employeeId,
        fullName: result.fullName,
        role: result.role as Role,
        avatar: localAvatar,
      };
      setCurrentUser(user);
      // Only the username is persisted (purely so the avatar can be looked
      // up again after a page refresh) - the actual session lives in the
      // JSESSIONID cookie, not in localStorage.
      localStorage.setItem('pms_user_session', JSON.stringify({ username: uname }));
      return null;
    } catch (err: any) {
      return err.message || 'Invalid username or password.';
    }
  };

  const handleLogout = () => {
    demoLogout().catch(() => { /* best effort - log out locally regardless */ });
    setCurrentUser(null);
    setBugs([]);
    localStorage.removeItem('pms_user_session');
  };

  const handleSwitchUser = async (username: string) => {
    const error = await handleLogin(username, username);
    if (error) {
      console.error('Quick login failed:', error);
    }
  };

  // ─── Bug mutations ──────────────────────────────────────────────────────────
  // These intentionally do NOT alert()/swallow errors themselves - they
  // throw, so the calling form/modal can keep its own loading + error state
  // (disable-until-response, re-enable-on-error - rules 7 & 8) and show the
  // backend's exact message (rule 11).

  const handleAddNewBug = async (payload: CreateBugPayload): Promise<Bug> => {
    const created = await apiCreateBug({
      projectId: payload.projectId,
      moduleId: payload.moduleId,
      title: payload.title,
      severity: payload.severity,
      priority: payload.priority,
      environment: payload.environment,
      description: payload.description,
      expectedOutput: payload.expectedOutput,
      actualResult: payload.actualResult,
      assignedToId: payload.assignedToId,
    });

    let finalBug = created;
    if (payload.screenshotFile) {
      try {
        await apiUploadScreenshot(created.id, payload.screenshotFile);
        finalBug = await fetchBugDetail(created.id);
      } catch (uploadErr) {
        // Bug was created successfully even if the screenshot upload
        // failed - surface the bug either way and let the caller decide
        // whether to also show the upload error.
      }
    }

    setPage(0);
    loadBugs();
    return finalBug;
  };

  const handleUpdateBug = async (bugId: string, payload: UpdateBugPayload): Promise<Bug> => {
    const updated = await apiUpdateBug(bugId, payload);
    setBugs(prev => prev.map(b => (b.id === updated.id ? updated : b)));
    return updated;
  };

  const handleConfirmStatus = async (bugId: string, newStatus: BugStatus, comment: string): Promise<void> => {
    const updated = await apiUpdateBugStatus(bugId, newStatus, comment);
    setBugs(prev => prev.map(b => (b.id === bugId ? updated : b)));
  };

  const handleConfirmReopen = async (
    bugId: string,
    reason: string,
    comment: string,
    screenshotFile?: File | null
  ): Promise<void> => {
    let screenshotUrl: string | undefined;
    if (screenshotFile) {
      const uploaded = await apiUploadScreenshot(bugId, screenshotFile);
      screenshotUrl = uploaded.fileUrl;
    }
    const updated = await apiReopenBug(bugId, reason, comment, screenshotUrl);
    setBugs(prev => prev.map(b => (b.id === bugId ? updated : b)));
  };

  const handleConfirmReassign = async (bugId: string, newAssigneeId: string, comment?: string): Promise<void> => {
    const updated = await apiReassignBug(bugId, newAssigneeId, comment);
    setBugs(prev => prev.map(b => (b.id === bugId ? updated : b)));
  };

  // ─── Derived values ────────────────────────────────────────────────────────
  // These are derived only from the current page of results (the backend is
  // the source of truth for filtering/pagination now), so they should be
  // read as "on this page", not global totals.

  const projectOptions = projects.map(p => p.projectId);
  const moduleOptions = (
    filters.projectId !== 'All Projects'
      ? modulesByProject[filters.projectId] || []
      : Object.values(modulesByProject).flat()
  ).map(m => ({ moduleId: m.moduleId, moduleName: m.moduleName }));
  const statusOptions: string[] = [
    'OPEN', 'ASSIGNED', 'IN PROGRESS', 'READY FOR TESTING', 'TESTING',
    'RESOLVED', 'CLOSED', 'REOPENED', 'DEFERRED', 'REJECTED/INVALID', 'DUPLICATE/ALREADY FIXED',
  ];
  const priorityOptions = ['HIGH', 'MEDIUM', 'LOW'];
  const severityOptions = ['CRITICAL', 'MAJOR', 'MINOR', 'TRIVIAL'];
  const assigneeOptions = developers;

  const activeBugsCount = bugs.filter(b => !b.archived && b.status !== 'CLOSED').length;
  const criticalBugsCount = bugs.filter(b => !b.archived && b.severity === 'CRITICAL' && b.status !== 'CLOSED').length;
  const resolvedTodayCount = bugs.filter(b => !b.archived && (b.status === 'RESOLVED' || b.status === 'CLOSED')).length;
  const pendingReviewCount = bugs.filter(b => !b.archived && (b.status === 'TESTING' || b.status === 'IN PROGRESS')).length;

  const activeDetailBug = bugs.find(b => b.id === selectedBugId) ?? null;
  const activeEditBug = bugs.find(b => b.id === editBugId) ?? null;
  const activeReopenBug = bugs.find(b => b.id === reopenBugId) ?? null;
  const activeStatusChangeBug = bugs.find(b => b.id === statusChangeBugId) ?? null;
  const activeReassignBug = bugs.find(b => b.id === reassignBugId) ?? null;

  // ─── Context value ─────────────────────────────────────────────────────────

  const value: AppContextValue = {
    currentUser,
    authChecked,
    handleLogin,
    handleLogout,
    handleSwitchUser,
    bugs,
    isLoadingBugs,
    isLoadingBugDetail,
    pageInfo,
    page,
    setPage,
    pageSize,
    setPageSize: (size: number) => { setPageSize(size); setPage(0); },
    refetchBugs: loadBugs,
    handleAddNewBug,
    handleUpdateBug,
    handleConfirmStatus,
    handleConfirmReopen,
    handleConfirmReassign,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    activeBugsCount,
    criticalBugsCount,
    resolvedTodayCount,
    pendingReviewCount,
    projects,
    developers,
    getModulesForProject,
    resolveModuleName,
    resolveEmployeeName,
    projectOptions,
    moduleOptions,
    statusOptions,
    priorityOptions,
    severityOptions,
    assigneeOptions,
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
    isReportDrawerOpen,
    setIsReportDrawerOpen,
    isLearningsOpen,
    setIsLearningsOpen,
    activeDetailBug,
    activeEditBug,
    activeReopenBug,
    activeStatusChangeBug,
    activeReassignBug,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
