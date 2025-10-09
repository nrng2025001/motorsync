import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth, type UserRole } from './AuthContext';

/**
 * Team member interface with performance stats
 */
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department: string;
  reportsTo?: string; // Manager's ID
  joinDate: string;
  status: 'active' | 'inactive' | 'on_leave';
  performance: {
    enquiriesHandled: number;
    quotationsCreated: number;
    bookingsManaged: number;
    conversionRate: number;
    avgResponseTime: string; // in hours
    customerRating: number; // out of 5
    thisMonthSales: number;
    lastMonthSales: number;
    targetAchievement: number; // percentage
  };
  contactInfo: {
    phone?: string;
    extension?: string;
    location?: string;
  };
}

/**
 * Team hierarchy interface
 */
export interface TeamHierarchy {
  managerId: string;
  teamMembers: TeamMember[];
  totalTeamSize: number;
  teamPerformance: {
    totalSales: number;
    avgConversionRate: number;
    totalEnquiries: number;
    totalQuotations: number;
    totalBookings: number;
  };
}

/**
 * Team context interface
 */
interface TeamContextType {
  teamMembers: TeamMember[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getTeamHierarchy: (managerId: string) => TeamHierarchy | null;
  getDirectReports: (managerId: string) => TeamMember[];
  getTeamMember: (memberId: string) => TeamMember | null;
  updateMemberPerformance: (memberId: string, performance: Partial<TeamMember['performance']>) => void;
}

/**
 * Default empty team data
 */
const getEmptyTeamData = (): TeamMember[] => [];

/**
 * Placeholder API function for team data
 * TODO: Implement actual team API
 */
const fetchTeamFromAPI = async (): Promise<TeamMember[]> => {
  // This is a placeholder - in a real app, this would call the actual API
  // For now, return empty array to show the empty state
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([]);
    }, 1000);
  });
};

/**
 * Mock team data with realistic hierarchy - KEEPING FOR REFERENCE
 * This will be removed once the actual API is implemented
 */
const mockTeamData: TeamMember[] = [
  // General Manager
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'gm@motorsync.com',
        role: 'GENERAL_MANAGER',
    department: 'Management',
    joinDate: '2020-01-15',
    status: 'active',
    performance: {
      enquiriesHandled: 0, // GMs don't handle direct enquiries
      quotationsCreated: 0,
      bookingsManaged: 0,
      conversionRate: 75, // Team average
      avgResponseTime: '1.2h',
      customerRating: 4.8,
      thisMonthSales: 1245000,
      lastMonthSales: 1098000,
      targetAchievement: 95,
    },
    contactInfo: {
      phone: '+1 (555) 001-0001',
      extension: '1001',
      location: 'Executive Office',
    },
  },
  
  // Sales Managers (Report to GM)
  {
    id: '2',
    name: 'Mike Chen',
    email: 'sm@motorsync.com',
        role: 'SALES_MANAGER',
    department: 'Sales',
    reportsTo: '1',
    joinDate: '2021-03-10',
    status: 'active',
    performance: {
      enquiriesHandled: 45,
      quotationsCreated: 28,
      bookingsManaged: 15,
      conversionRate: 72,
      avgResponseTime: '1.8h',
      customerRating: 4.6,
      thisMonthSales: 687000,
      lastMonthSales: 598000,
      targetAchievement: 92,
    },
    contactInfo: {
      phone: '+1 (555) 001-0002',
      extension: '1002',
      location: 'Sales Floor - West Wing',
    },
  },
  
  {
    id: '3',
    name: 'Jennifer Davis',
    email: 'sm2@motorsync.com',
        role: 'SALES_MANAGER',
    department: 'Sales',
    reportsTo: '1',
    joinDate: '2021-06-20',
    status: 'active',
    performance: {
      enquiriesHandled: 52,
      quotationsCreated: 34,
      bookingsManaged: 18,
      conversionRate: 78,
      avgResponseTime: '1.5h',
      customerRating: 4.7,
      thisMonthSales: 745000,
      lastMonthSales: 678000,
      targetAchievement: 98,
    },
    contactInfo: {
      phone: '+1 (555) 001-0003',
      extension: '1003',
      location: 'Sales Floor - East Wing',
    },
  },

  // Team Leads (Report to Sales Managers)
  {
    id: '4',
    name: 'Emma Wilson',
    email: 'tl@motorsync.com',
        role: 'TEAM_LEAD',
    department: 'Sales',
    reportsTo: '2', // Reports to Mike Chen
    joinDate: '2022-01-15',
    status: 'active',
    performance: {
      enquiriesHandled: 78,
      quotationsCreated: 45,
      bookingsManaged: 32,
      conversionRate: 68,
      avgResponseTime: '2.1h',
      customerRating: 4.5,
      thisMonthSales: 398000,
      lastMonthSales: 342000,
      targetAchievement: 89,
    },
    contactInfo: {
      phone: '+1 (555) 001-0004',
      extension: '1004',
      location: 'Sales Floor - Section A',
    },
  },

  {
    id: '5',
    name: 'Robert Martinez',
    email: 'tl2@motorsync.com',
        role: 'TEAM_LEAD',
    department: 'Sales',
    reportsTo: '2', // Reports to Mike Chen
    joinDate: '2022-04-10',
    status: 'active',
    performance: {
      enquiriesHandled: 65,
      quotationsCreated: 38,
      bookingsManaged: 28,
      conversionRate: 71,
      avgResponseTime: '1.9h',
      customerRating: 4.4,
      thisMonthSales: 356000,
      lastMonthSales: 298000,
      targetAchievement: 85,
    },
    contactInfo: {
      phone: '+1 (555) 001-0005',
      extension: '1005',
      location: 'Sales Floor - Section B',
    },
  },

  {
    id: '6',
    name: 'Lisa Thompson',
    email: 'tl3@motorsync.com',
        role: 'TEAM_LEAD',
    department: 'Sales',
    reportsTo: '3', // Reports to Jennifer Davis
    joinDate: '2022-02-28',
    status: 'active',
    performance: {
      enquiriesHandled: 82,
      quotationsCreated: 48,
      bookingsManaged: 35,
      conversionRate: 74,
      avgResponseTime: '1.7h',
      customerRating: 4.6,
      thisMonthSales: 425000,
      lastMonthSales: 378000,
      targetAchievement: 94,
    },
    contactInfo: {
      phone: '+1 (555) 001-0006',
      extension: '1006',
      location: 'Sales Floor - Section C',
    },
  },

  {
    id: '7',
    name: 'David Kim',
    email: 'tl4@motorsync.com',
        role: 'TEAM_LEAD',
    department: 'Sales',
    reportsTo: '3', // Reports to Jennifer Davis
    joinDate: '2022-08-15',
    status: 'active',
    performance: {
      enquiriesHandled: 71,
      quotationsCreated: 41,
      bookingsManaged: 29,
      conversionRate: 69,
      avgResponseTime: '2.0h',
      customerRating: 4.3,
      thisMonthSales: 378000,
      lastMonthSales: 334000,
      targetAchievement: 87,
    },
    contactInfo: {
      phone: '+1 (555) 001-0007',
      extension: '1007',
      location: 'Sales Floor - Section D',
    },
  },

  // Customer Advisors (Report to Team Leads)
  {
    id: '8',
    name: 'James Rodriguez',
    email: 'ca@motorsync.com',
        role: 'CUSTOMER_ADVISOR',
    department: 'Customer Service',
    reportsTo: '4', // Reports to Emma Wilson
    joinDate: '2023-01-20',
    status: 'active',
    performance: {
      enquiriesHandled: 45,
      quotationsCreated: 23,
      bookingsManaged: 18,
      conversionRate: 65,
      avgResponseTime: '2.4h',
      customerRating: 4.4,
      thisMonthSales: 145000,
      lastMonthSales: 128000,
      targetAchievement: 82,
    },
    contactInfo: {
      phone: '+1 (555) 001-0008',
      extension: '1008',
      location: 'Customer Service - Desk 1',
    },
  },

  {
    id: '9',
    name: 'Ashley Brown',
    email: 'ca2@motorsync.com',
        role: 'CUSTOMER_ADVISOR',
    department: 'Customer Service',
    reportsTo: '4', // Reports to Emma Wilson
    joinDate: '2023-02-15',
    status: 'active',
    performance: {
      enquiriesHandled: 38,
      quotationsCreated: 19,
      bookingsManaged: 15,
      conversionRate: 62,
      avgResponseTime: '2.6h',
      customerRating: 4.2,
      thisMonthSales: 128000,
      lastMonthSales: 115000,
      targetAchievement: 78,
    },
    contactInfo: {
      phone: '+1 (555) 001-0009',
      extension: '1009',
      location: 'Customer Service - Desk 2',
    },
  },

  {
    id: '10',
    name: 'Michael Taylor',
    email: 'ca3@motorsync.com',
        role: 'CUSTOMER_ADVISOR',
    department: 'Customer Service',
    reportsTo: '4', // Reports to Emma Wilson
    joinDate: '2023-03-10',
    status: 'active',
    performance: {
      enquiriesHandled: 42,
      quotationsCreated: 21,
      bookingsManaged: 16,
      conversionRate: 67,
      avgResponseTime: '2.3h',
      customerRating: 4.5,
      thisMonthSales: 156000,
      lastMonthSales: 142000,
      targetAchievement: 85,
    },
    contactInfo: {
      phone: '+1 (555) 001-0010',
      extension: '1010',
      location: 'Customer Service - Desk 3',
    },
  },

  {
    id: '11',
    name: 'Rachel Green',
    email: 'ca4@motorsync.com',
        role: 'CUSTOMER_ADVISOR',
    department: 'Customer Service',
    reportsTo: '4', // Reports to Emma Wilson
    joinDate: '2023-04-05',
    status: 'active',
    performance: {
      enquiriesHandled: 36,
      quotationsCreated: 18,
      bookingsManaged: 14,
      conversionRate: 63,
      avgResponseTime: '2.5h',
      customerRating: 4.3,
      thisMonthSales: 134000,
      lastMonthSales: 119000,
      targetAchievement: 79,
    },
    contactInfo: {
      phone: '+1 (555) 001-0011',
      extension: '1011',
      location: 'Customer Service - Desk 4',
    },
  },

  // More Customer Advisors under other Team Leads
  {
    id: '12',
    name: 'Kevin Wilson',
    email: 'ca5@motorsync.com',
        role: 'CUSTOMER_ADVISOR',
    department: 'Customer Service',
    reportsTo: '5', // Reports to Robert Martinez
    joinDate: '2023-01-30',
    status: 'active',
    performance: {
      enquiriesHandled: 41,
      quotationsCreated: 20,
      bookingsManaged: 17,
      conversionRate: 66,
      avgResponseTime: '2.2h',
      customerRating: 4.4,
      thisMonthSales: 148000,
      lastMonthSales: 135000,
      targetAchievement: 83,
    },
    contactInfo: {
      phone: '+1 (555) 001-0012',
      extension: '1012',
      location: 'Customer Service - Desk 5',
    },
  },

  {
    id: '13',
    name: 'Amanda Clark',
    email: 'ca6@motorsync.com',
        role: 'CUSTOMER_ADVISOR',
    department: 'Customer Service',
    reportsTo: '5', // Reports to Robert Martinez
    joinDate: '2023-05-12',
    status: 'active',
    performance: {
      enquiriesHandled: 33,
      quotationsCreated: 16,
      bookingsManaged: 12,
      conversionRate: 61,
      avgResponseTime: '2.7h',
      customerRating: 4.1,
      thisMonthSales: 118000,
      lastMonthSales: 105000,
      targetAchievement: 76,
    },
    contactInfo: {
      phone: '+1 (555) 001-0013',
      extension: '1013',
      location: 'Customer Service - Desk 6',
    },
  },

  // Additional team members for other leads...
  {
    id: '14',
    name: 'Daniel Lopez',
    email: 'ca7@motorsync.com',
        role: 'CUSTOMER_ADVISOR',
    department: 'Customer Service',
    reportsTo: '6', // Reports to Lisa Thompson
    joinDate: '2023-03-20',
    status: 'active',
    performance: {
      enquiriesHandled: 47,
      quotationsCreated: 24,
      bookingsManaged: 19,
      conversionRate: 69,
      avgResponseTime: '2.1h',
      customerRating: 4.5,
      thisMonthSales: 167000,
      lastMonthSales: 152000,
      targetAchievement: 88,
    },
    contactInfo: {
      phone: '+1 (555) 001-0014',
      extension: '1014',
      location: 'Customer Service - Desk 7',
    },
  },

  {
    id: '15',
    name: 'Sophia Wang',
    email: 'ca8@motorsync.com',
        role: 'CUSTOMER_ADVISOR',
    department: 'Customer Service',
    reportsTo: '7', // Reports to David Kim
    joinDate: '2023-06-01',
    status: 'active',
    performance: {
      enquiriesHandled: 39,
      quotationsCreated: 19,
      bookingsManaged: 15,
      conversionRate: 64,
      avgResponseTime: '2.4h',
      customerRating: 4.3,
      thisMonthSales: 139000,
      lastMonthSales: 124000,
      targetAchievement: 81,
    },
    contactInfo: {
      phone: '+1 (555) 001-0015',
      extension: '1015',
      location: 'Customer Service - Desk 8',
    },
  },
];

// Create context
const TeamContext = createContext<TeamContextType | undefined>(undefined);

/**
 * Team Provider component
 */
export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch team data from API
   */
  const fetchTeamData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchTeamFromAPI();
      setTeamMembers(data);
    } catch (err: any) {
      console.error('Error fetching team data:', err);
      setError(err.message || 'Failed to load team data');
      setTeamMembers(getEmptyTeamData());
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load team data on mount
   */
  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  /**
   * Get team hierarchy for a manager
   */
  const getTeamHierarchy = (managerId: string): TeamHierarchy | null => {
    const directReports = teamMembers.filter(member => member.reportsTo === managerId);
    
    if (directReports.length === 0) {
      return null;
    }

    // Calculate team performance
    const teamPerformance = directReports.reduce(
      (acc, member) => ({
        totalSales: acc.totalSales + member.performance.thisMonthSales,
        avgConversionRate: acc.avgConversionRate + member.performance.conversionRate,
        totalEnquiries: acc.totalEnquiries + member.performance.enquiriesHandled,
        totalQuotations: acc.totalQuotations + member.performance.quotationsCreated,
        totalBookings: acc.totalBookings + member.performance.bookingsManaged,
      }),
      { totalSales: 0, avgConversionRate: 0, totalEnquiries: 0, totalQuotations: 0, totalBookings: 0 }
    );

    // Average the conversion rate
    teamPerformance.avgConversionRate = teamPerformance.avgConversionRate / directReports.length;

    return {
      managerId,
      teamMembers: directReports,
      totalTeamSize: directReports.length,
      teamPerformance,
    };
  };

  /**
   * Get direct reports for a manager
   */
  const getDirectReports = (managerId: string): TeamMember[] => {
    return teamMembers.filter(member => member.reportsTo === managerId);
  };

  /**
   * Get specific team member
   */
  const getTeamMember = (memberId: string): TeamMember | null => {
    return teamMembers.find(member => member.id === memberId) || null;
  };

  /**
   * Update member performance (mock function)
   */
  const updateMemberPerformance = (
    memberId: string, 
    performance: Partial<TeamMember['performance']>
  ) => {
    // In a real app, this would make an API call
    console.log(`Updating performance for member ${memberId}:`, performance);
  };

  const contextValue: TeamContextType = {
    teamMembers,
    getTeamHierarchy,
    getDirectReports,
    getTeamMember,
    updateMemberPerformance,
    loading,
    error,
    refetch: fetchTeamData,
  };

  return (
    <TeamContext.Provider value={contextValue}>
      {children}
    </TeamContext.Provider>
  );
}

/**
 * Hook to use team context
 */
export function useTeam(): TeamContextType {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}

/**
 * Helper function to check if user can manage teams
 */
export function canManageTeam(userRole: UserRole): boolean {
  return ['general_manager', 'sales_manager', 'team_lead'].includes(userRole);
}

/**
 * Helper function to get team size for a manager
 */
export function getTeamSize(managerId: string, teamMembers: TeamMember[]): number {
  return teamMembers.filter(member => member.reportsTo === managerId).length;
}

/**
 * Helper function to get role hierarchy level
 */
export function getRoleLevel(role: UserRole): number {
  switch (role) {
    case 'GENERAL_MANAGER': return 4;
    case 'SALES_MANAGER': return 3;
    case 'TEAM_LEAD': return 2;
    case 'CUSTOMER_ADVISOR': return 1;
    default: return 0;
  }
}
