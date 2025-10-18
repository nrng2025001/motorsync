import { UserRole } from '../context/AuthContext';

/**
 * Safely get user role from auth state
 * Throws error if role is missing instead of using hardcoded defaults
 */
export function getUserRole(user: any): UserRole {
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  if (!user.role) {
    throw new Error('User role not found. Please contact administrator to assign a role.');
  }
  
  if (!user.role.name) {
    throw new Error('User role name is missing. Please contact administrator.');
  }
  
  return user.role.name;
}

/**
 * Safely get user role with fallback for specific use cases
 * Only use this when you specifically need a fallback behavior
 */
export function getUserRoleWithFallback(user: any, fallbackRole: UserRole): UserRole {
  try {
    return getUserRole(user);
  } catch (error) {
    console.warn('Using fallback role due to missing role:', error);
    return fallbackRole;
  }
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: any, requiredRole: UserRole): boolean {
  try {
    const userRole = getUserRole(user);
    return userRole === requiredRole;
  } catch (error) {
    return false;
  }
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: any, requiredRoles: UserRole[]): boolean {
  try {
    const userRole = getUserRole(user);
    return requiredRoles.includes(userRole);
  } catch (error) {
    return false;
  }
}

/**
 * Get role display name safely
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    ADMIN: 'Administrator',
    GENERAL_MANAGER: 'General Manager',
    SALES_MANAGER: 'Sales Manager',
    TEAM_LEAD: 'Team Lead',
    CUSTOMER_ADVISOR: 'Customer Advisor',
  };
  return roleNames[role];
}
