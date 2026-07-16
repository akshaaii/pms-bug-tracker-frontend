// ============================================================================
// API client for the Spring Boot backend.
//
// IMPORTANT: every fetch call below includes `credentials: 'include'`.
// This is what makes the browser send the JSESSIONID cookie set by
// /demo-auth/login on every subsequent request - without this, the
// backend's SessionService will treat every call as logged-out, since
// it reads identity from the session, never from the request body.
// ============================================================================

import { Bug, BugStatus, Project, ProjectModule, Developer, PageInfo } from './types';

// Rule 19: never hardcode the base URL - read from the environment, with a
// sane local-dev fallback.
export const BASE_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080/bug_tracker/api';

// A structured API error carrying the backend's errorCode alongside the
// human-readable message, so callers can branch on errorCode (see rule 11's
// error-code table) instead of parsing message strings.
export class ApiError extends Error {
  status: number;
  errorCode: string | undefined;
  constructor(message: string, status: number, errorCode?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = errorCode;
  }
}

// Registered by AppContext on mount. Called any time any request comes back
// 401 UNAUTHORIZED, so the whole app can react in one place (clear local
// state, redirect to /login) rather than every call site handling it.
let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  unauthorizedHandler = fn;
}

// Registered by AppContext so 429s can be surfaced consistently without
// every call site needing to know about rate limiting.
let rateLimitHandler: (() => void) | null = null;
export function setRateLimitHandler(fn: (() => void) | null) {
  rateLimitHandler = fn;
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message = json?.message || `Request failed with status ${res.status}`;
    const errorCode = json?.errorCode;

    if (res.status === 401 || errorCode === 'UNAUTHORIZED') {
      unauthorizedHandler?.();
    }
    if (res.status === 429 || errorCode === 'RATE_LIMIT_EXCEEDED') {
      rateLimitHandler?.();
    }

    throw new ApiError(message, res.status, errorCode);
  }

  return json;
}

// ---------------------------------------------------------------------------
// DEMO AUTH (temporary - see DemoAuthController.java on the backend)
// ---------------------------------------------------------------------------
export async function demoLogin(username: string, password: string) {
  const json = await apiFetch('/demo-auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return json.data as { employeeId: string; fullName: string; role: string };
}

export async function demoLogout() {
  await apiFetch('/demo-auth/logout', { method: 'POST' });
}

// ---------------------------------------------------------------------------
// BUGS
// ---------------------------------------------------------------------------

export interface BugListResult {
  bugs: Bug[];
  page: PageInfo;
}

// Rule 12: backend returns a Spring Page<T> object. We surface both the rows
// (content) and the pagination metadata so the UI can render real
// "Page X of Y" / "Showing Z results" controls instead of fabricating them.
// Rule 24: developer role filtering (assignedTo) is entirely enforced
// server-side - we never send assignedTo as a filter param for developers.
export async function fetchBugs(
  filters: Record<string, string | undefined> = {},
  page = 0,
  size = 10
): Promise<BugListResult> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  params.append('page', String(page));
  params.append('size', String(size));

  const json = await apiFetch(`/bugs?${params.toString()}`);
  const pageData = json.data || {};
  return {
    bugs: (pageData.content || []).map(mapBugFromApi),
    page: {
      totalElements: pageData.totalElements ?? 0,
      totalPages: pageData.totalPages ?? 1,
      number: pageData.number ?? 0,
      size: pageData.size ?? size,
      first: pageData.first ?? true,
      last: pageData.last ?? true,
    },
  };
}

export async function fetchBugDetail(bugId: string): Promise<Bug> {
  const json = await apiFetch(`/bugs/${bugId}`);
  return mapBugFromApi(json.data);
}

// Rule 21/22/23: reportedBy, bugId, createdDate, updatedDate are all
// auto-assigned by the backend - we never send them on create.
export async function createBug(bug: {
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
}): Promise<Bug> {
  const json = await apiFetch('/bugs', {
    method: 'POST',
    body: JSON.stringify({
      projectId: bug.projectId,
      moduleId: bug.moduleId,
      title: bug.title,
      severity: bug.severity,
      priority: bug.priority,
      environment: bug.environment,
      description: bug.description,
      expectedOutput: bug.expectedOutput,
      actualResult: bug.actualResult,
      assignedToId: bug.assignedToId || undefined,
    }),
  });
  return mapBugFromApi(json.data);
}

// Rule 6: versionNum is always sent, and read back off the response, so the
// caller can keep retrying with a fresh version after a 409 CONCURRENT_EDIT_CONFLICT.
export async function updateBug(
  bugId: string,
  updates: {
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
): Promise<Bug> {
  const json = await apiFetch(`/bugs/${bugId}`, {
    method: 'PUT',
    body: JSON.stringify({
      moduleId: updates.moduleId,
      title: updates.title,
      severity: updates.severity,
      priority: updates.priority,
      status: updates.status,
      environment: updates.environment,
      description: updates.description,
      expectedOutput: updates.expectedOutput,
      actualResult: updates.actualResult,
      assignedToId: updates.assignedToId || undefined,
      versionNum: updates.versionNum,
    }),
  });
  return mapBugFromApi(json.data);
}

export async function updateBugStatus(bugId: string, status: BugStatus, comment: string): Promise<Bug> {
  const json = await apiFetch(`/bugs/${bugId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, comment }),
  });
  return mapBugFromApi(json.data);
}

export async function reopenBug(
  bugId: string,
  reopenReason: string,
  comment: string,
  screenshotUrl?: string
): Promise<Bug> {
  const json = await apiFetch(`/bugs/${bugId}/reopen`, {
    method: 'PATCH',
    body: JSON.stringify({ reopenReason, comment, screenshotUrl }),
  });
  return mapBugFromApi(json.data);
}

export async function reassignBug(bugId: string, newAssigneeId: string, comment?: string): Promise<Bug> {
  const json = await apiFetch(`/bugs/${bugId}/reassign`, {
    method: 'PATCH',
    body: JSON.stringify({ newAssigneeId, comment: comment || undefined }),
  });
  return mapBugFromApi(json.data);
}

export async function addComment(bugId: string, content: string) {
  const json = await apiFetch(`/bugs/${bugId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  return json.data;
}

// Rule 10: JPG/PNG/PDF only, max 5MB - validated client-side before ever
// calling the API, so an obviously-invalid file never leaves the browser.
export const ALLOWED_SCREENSHOT_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
export const ALLOWED_SCREENSHOT_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];
export const MAX_SCREENSHOT_SIZE_BYTES = 5 * 1024 * 1024;

export function validateScreenshotFile(file: File): string | null {
  const name = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_SCREENSHOT_EXTENSIONS.some(ext => name.endsWith(ext));
  if (!hasAllowedExtension) {
    return 'Only JPG, PNG, PDF allowed';
  }
  if (file.size > MAX_SCREENSHOT_SIZE_BYTES) {
    return 'File must be under 5MB';
  }
  return null;
}

export async function uploadScreenshot(bugId: string, file: File) {
  const validationError = validateScreenshotFile(file);
  if (validationError) {
    throw new ApiError(validationError, 400, 'INVALID_FILE_TYPE');
  }

  const formData = new FormData();
  formData.append('file', file);

  // NOTE: no Content-Type header set manually - the browser sets the
  // multipart boundary automatically. Setting it ourselves would break the
  // upload (rule 10).
  const res = await fetch(`${BASE_URL}/bugs/${bugId}/screenshots`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 || json?.errorCode === 'UNAUTHORIZED') {
      unauthorizedHandler?.();
    }
    throw new ApiError(json?.message || 'Screenshot upload failed', res.status, json?.errorCode);
  }
  return json.data as { screenshotId: string; fileName: string; fileUrl: string; fileSizeKb: number; uploadedAt: string };
}

// ---------------------------------------------------------------------------
// DROPDOWNS
// ---------------------------------------------------------------------------
export async function fetchProjects(): Promise<Project[]> {
  const json = await apiFetch('/projects');
  return json.data as Project[];
}

export async function fetchModules(projectId: string): Promise<ProjectModule[]> {
  const json = await apiFetch(`/projects/${projectId}/modules`);
  return json.data as ProjectModule[];
}

export async function fetchDevelopers(): Promise<Developer[]> {
  const json = await apiFetch('/resources/developers');
  return json.data as Developer[];
}

export async function fetchCurrentSessionUser() {
  const json = await apiFetch('/session/me');
  return json.data as { employeeId: string; fullName: string; role: string };
}

// ---------------------------------------------------------------------------
// Mapping helper: backend field names -> the shape the UI expects
// ---------------------------------------------------------------------------
function mapBugFromApi(row: any): Bug {
  return {
    id: row.bugId,
    projectId: row.projectId,
    module: row.moduleId, // always the moduleId - resolved to a display name in AppContext
    title: row.title,
    severity: row.severity,
    priority: row.priority,
    status: row.status,
    reportedBy: row.reportedBy,
    reportedByTitle: '',
    reportedByAvatar: '',
    assignedTo: row.assignedTo,
    assignedToTitle: '',
    assignedToAvatar: '',
    environment: row.environment,
    description: row.description,
    expectedOutput: row.expectedOutput,
    actualResult: row.actualResult,
    createdDate: row.createdDate,
    updatedDate: row.updatedDate,
    archived: false,
    artifacts: (row.screenshots || []).map((s: any) => s.fileUrl),
    comments: (row.comments || []).map((c: any) => ({
      id: c.commentId,
      authorName: c.authorName,
      authorAvatar: '',
      authorRole: c.authorRole,
      content: c.content,
      timestamp: c.createdAt,
    })),
    activityTimeline: (row.activityTimeline || []).map((a: any) => ({
      id: a.activityId,
      type: a.activityType,
      user: a.performedBy,
      message: a.message,
      timestamp: a.createdAt,
    })),
    versionNum: row.versionNum,
  };
}
