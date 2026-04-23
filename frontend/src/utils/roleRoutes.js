export const ROLES = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  KITCHEN_STAFF: 'KITCHEN_STAFF',
  WAITER: 'WAITER',
};

const routeByRole = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.CUSTOMER]: '/customer',
  [ROLES.KITCHEN_STAFF]: '/kitchen',
  [ROLES.WAITER]: '/waiter',
};

export function getDefaultRouteByRole(role) {
  return routeByRole[role] || '/';
}

export function normalizeRole(roleInput) {
  if (!roleInput) return null;
  return String(roleInput).toUpperCase().trim();
}
