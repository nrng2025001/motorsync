/**
 * Permission Utilities
 * Helper functions for role-based access control
 */

import { UserRole } from '../context/AuthContext';

/**
 * Check if user can manage dealership settings
 */
export const canManageDealership = (role: UserRole): boolean => {
  return ['ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER'].includes(role);
};

/**
 * Check if user can view catalog
 */
export const canViewCatalog = (role: UserRole): boolean => {
  // All authenticated users can view catalog
  return true;
};

/**
 * Check if user can edit catalog
 */
export const canEditCatalog = (role: UserRole): boolean => {
  return ['ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER'].includes(role);
};

/**
 * Check if user can delete catalog entries
 */
export const canDeleteCatalog = (role: UserRole): boolean => {
  return ['ADMIN', 'GENERAL_MANAGER'].includes(role);
};

/**
 * Check if user can create dealerships
 */
export const canCreateDealership = (role: UserRole): boolean => {
  return role === 'ADMIN';
};

/**
 * Check if user can view all dealerships
 */
export const canViewAllDealerships = (role: UserRole): boolean => {
  return role === 'ADMIN';
};

/**
 * Check if user can assign users to dealerships
 */
export const canAssignUserToDealership = (role: UserRole): boolean => {
  return role === 'ADMIN';
};

/**
 * Check if user can activate/deactivate dealerships
 */
export const canToggleDealershipStatus = (role: UserRole): boolean => {
  return role === 'ADMIN';
};

/**
 * Check if user can manage bookings
 */
export const canManageBookings = (role: UserRole): boolean => {
  return ['ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER', 'TEAM_LEAD'].includes(role);
};

/**
 * Check if user can export data
 */
export const canExportData = (role: UserRole): boolean => {
  return ['ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER'].includes(role);
};

/**
 * Get permission level for role (higher number = more permissions)
 */
export const getPermissionLevel = (role: UserRole): number => {
  const levels: Record<UserRole, number> = {
    ADMIN: 1,
    GENERAL_MANAGER: 2,
    SALES_MANAGER: 3,
    TEAM_LEAD: 4,
    CUSTOMER_ADVISOR: 5,
  };
  return levels[role];
};

/**
 * Check if user has higher or equal permission level than required role
 */
export const hasPermissionLevel = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return getPermissionLevel(userRole) <= getPermissionLevel(requiredRole);
};



