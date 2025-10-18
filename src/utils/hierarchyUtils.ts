import { UserRole } from '../context/AuthContext';

/**
 * Role hierarchy levels (lower number = higher authority)
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 1,
  GENERAL_MANAGER: 2,
  SALES_MANAGER: 3,
  TEAM_LEAD: 4,
  CUSTOMER_ADVISOR: 5,
};

/**
 * Check if a role can manage another role
 */
export function canManageRole(managerRole: UserRole, subordinateRole: UserRole): boolean {
  return ROLE_HIERARCHY[managerRole] < ROLE_HIERARCHY[subordinateRole];
}

/**
 * Get all roles that a manager can manage
 */
export function getManageableRoles(managerRole: UserRole): UserRole[] {
  const managerLevel = ROLE_HIERARCHY[managerRole];
  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level > managerLevel)
    .map(([role, _]) => role as UserRole);
}

/**
 * Check if a user can see data from another user based on hierarchy
 */
export function canSeeUserData(viewerRole: UserRole, dataOwnerRole: UserRole): boolean {
  // Same level or higher can see data
  return ROLE_HIERARCHY[viewerRole] <= ROLE_HIERARCHY[dataOwnerRole];
}

/**
 * Get role display name with hierarchy indicator
 */
export function getRoleDisplayNameWithHierarchy(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    ADMIN: 'Administrator',
    GENERAL_MANAGER: 'General Manager',
    SALES_MANAGER: 'Sales Manager',
    TEAM_LEAD: 'Team Lead',
    CUSTOMER_ADVISOR: 'Customer Advisor',
  };
  
  const level = ROLE_HIERARCHY[role];
  const indicator = level <= 2 ? '👑' : level <= 3 ? '⭐' : level <= 4 ? '🔹' : '👤';
  
  return `${indicator} ${roleNames[role]}`;
}

/**
 * Check if user can add remarks at their role level
 */
export function canAddRemarksAtLevel(userRole: UserRole, remarksType: string): boolean {
  const rolePermissions: Record<UserRole, string[]> = {
    ADMIN: ['advisorRemarks', 'teamLeadRemarks', 'salesManagerRemarks', 'generalManagerRemarks', 'adminRemarks'],
    GENERAL_MANAGER: ['advisorRemarks', 'teamLeadRemarks', 'salesManagerRemarks', 'generalManagerRemarks'],
    SALES_MANAGER: ['advisorRemarks', 'teamLeadRemarks', 'salesManagerRemarks'],
    TEAM_LEAD: ['advisorRemarks', 'teamLeadRemarks'],
    CUSTOMER_ADVISOR: ['advisorRemarks'],
  };
  
  return rolePermissions[userRole]?.includes(remarksType) || false;
}

/**
 * Get all remarks types a user can view
 */
export function getViewableRemarksTypes(userRole: UserRole): string[] {
  const rolePermissions: Record<UserRole, string[]> = {
    ADMIN: ['advisorRemarks', 'teamLeadRemarks', 'salesManagerRemarks', 'generalManagerRemarks', 'adminRemarks'],
    GENERAL_MANAGER: ['advisorRemarks', 'teamLeadRemarks', 'salesManagerRemarks', 'generalManagerRemarks'],
    SALES_MANAGER: ['advisorRemarks', 'teamLeadRemarks', 'salesManagerRemarks'],
    TEAM_LEAD: ['advisorRemarks', 'teamLeadRemarks'],
    CUSTOMER_ADVISOR: ['advisorRemarks'],
  };
  
  return rolePermissions[userRole] || [];
}

/**
 * Check if user can edit data created by another user
 */
export function canEditUserData(editorRole: UserRole, dataCreatorRole: UserRole): boolean {
  // Can edit if you're higher in hierarchy or same level
  return ROLE_HIERARCHY[editorRole] <= ROLE_HIERARCHY[dataCreatorRole];
}

/**
 * Get filter options for data based on user role
 */
export function getDataFilterOptions(userRole: UserRole): {
  canSeeAll: boolean;
  canSeeTeam: boolean;
  canSeeOwn: boolean;
  manageableRoles: UserRole[];
} {
  return {
    canSeeAll: userRole === 'ADMIN' || userRole === 'GENERAL_MANAGER',
    canSeeTeam: ['GENERAL_MANAGER', 'SALES_MANAGER', 'TEAM_LEAD'].includes(userRole),
    canSeeOwn: true, // Everyone can see their own data
    manageableRoles: getManageableRoles(userRole),
  };
}

/**
 * Get subordinates based on role hierarchy
 * This simulates the reporting structure based on role levels
 */
export function getSubordinateRoles(managerRole: UserRole): UserRole[] {
  const managerLevel = ROLE_HIERARCHY[managerRole];
  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level > managerLevel)
    .map(([role, _]) => role as UserRole);
}

/**
 * Check if a user can see data from a specific user based on reporting relationship
 * This would need to be enhanced with actual user data to check real reporting relationships
 */
export function canSeeUserDataByHierarchy(viewerRole: UserRole, dataOwnerRole: UserRole, viewerUserId?: string, dataOwnerUserId?: string): boolean {
  // If same user, always can see
  if (viewerUserId && dataOwnerUserId && viewerUserId === dataOwnerUserId) {
    return true;
  }
  
  // Admin can see everything
  if (viewerRole === 'ADMIN') {
    return true;
  }
  
  // General Manager can see everything in their dealership
  if (viewerRole === 'GENERAL_MANAGER') {
    return true;
  }
  
  // Sales Manager can see Team Leads and Customer Advisors
  if (viewerRole === 'SALES_MANAGER') {
    return ['TEAM_LEAD', 'CUSTOMER_ADVISOR'].includes(dataOwnerRole);
  }
  
  // Team Lead can see Customer Advisors
  if (viewerRole === 'TEAM_LEAD') {
    return dataOwnerRole === 'CUSTOMER_ADVISOR';
  }
  
  // Customer Advisor can only see their own data
  if (viewerRole === 'CUSTOMER_ADVISOR') {
    return viewerUserId === dataOwnerUserId;
  }
  
  return false;
}

/**
 * Get user IDs that the current user can see data for
 * This is a simplified version - in a real app, this would query the database
 */
export function getVisibleUserIds(userRole: UserRole, currentUserId: string, allUsers: any[] = []): string[] {
  if (userRole === 'ADMIN' || userRole === 'GENERAL_MANAGER') {
    // Can see all users in the dealership
    return allUsers.map(user => user.firebaseUid || user.id);
  }
  
  if (userRole === 'SALES_MANAGER') {
    // Can see Team Leads and Customer Advisors
    return allUsers
      .filter(user => ['TEAM_LEAD', 'CUSTOMER_ADVISOR'].includes(user.role?.name))
      .map(user => user.firebaseUid || user.id);
  }
  
  if (userRole === 'TEAM_LEAD') {
    // Can see Customer Advisors
    return allUsers
      .filter(user => user.role?.name === 'CUSTOMER_ADVISOR')
      .map(user => user.firebaseUid || user.id);
  }
  
  // Customer Advisor can only see their own data
  return [currentUserId];
}

/**
 * Filter bookings based on user hierarchy
 */
export function filterBookingsByHierarchy(bookings: any[], userRole: UserRole, currentUserId: string, allUsers: any[] = []): any[] {
  const visibleUserIds = getVisibleUserIds(userRole, currentUserId, allUsers);
  
  return bookings.filter(booking => {
    // Include bookings assigned to visible users
    if (booking.advisorId && visibleUserIds.includes(booking.advisorId)) {
      return true;
    }
    
    // Include bookings created by visible users
    if (booking.createdByUserId && visibleUserIds.includes(booking.createdByUserId)) {
      return true;
    }
    
    return false;
  });
}

/**
 * Filter enquiries based on user hierarchy
 */
export function filterEnquiriesByHierarchy(enquiries: any[], userRole: UserRole, currentUserId: string, allUsers: any[] = []): any[] {
  const visibleUserIds = getVisibleUserIds(userRole, currentUserId, allUsers);
  
  return enquiries.filter(enquiry => {
    // Include enquiries created by visible users
    if (enquiry.createdByUserId && visibleUserIds.includes(enquiry.createdByUserId)) {
      return true;
    }
    
    // Include enquiries assigned to visible users
    if (enquiry.assignedToUserId && visibleUserIds.includes(enquiry.assignedToUserId)) {
      return true;
    }
    
    return false;
  });
}
