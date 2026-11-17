export const ADMIN_LOGOUT_PATH = 'admin.html';

let pendingLogoutPath: string | null = null;

export function setPendingLogoutPath(path: string) {
  pendingLogoutPath = path;
}

export function consumePendingLogoutPath() {
  const path = pendingLogoutPath ?? '/login';
  pendingLogoutPath = null;
  return path;
}
