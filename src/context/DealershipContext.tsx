import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, handleApiCall } from '../api/client';
import { DealershipAPI } from '../api/dealerships';
import { useAuth } from './AuthContext';

export interface Dealership {
  id: string;
  name: string;
  code: string;
  type: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  brands?: string[];
}

interface DealershipContextType {
  dealership: Dealership | null;
  loading: boolean;
  refreshDealership: () => Promise<void>;
}

const DealershipContext = createContext<DealershipContextType | undefined>(undefined);

interface DealershipProviderProps {
  children: ReactNode;
}

const isLikelyUuid = (id?: string | null) =>
  !!id &&
  typeof id === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

export const DealershipProvider: React.FC<DealershipProviderProps> = ({ children }) => {
  const { state } = useAuth();
  const [dealership, setDealership] = useState<Dealership | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (state.user?.dealership) {
      setDealership(state.user.dealership as any);
      setLoading(false);
    } else if (state.user?.dealershipId) {
      fetchDealership(state.user.dealershipId);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.user?.dealershipId, state.user?.dealership]);

  const fetchDealership = async (dealershipId: string) => {
    try {
      setLoading(true);

      const dealershipCode =
        (state.user?.dealership as any)?.code || (state.user as any)?.dealershipCode || null;

      if (!isLikelyUuid(dealershipId) && dealershipCode) {
        try {
          const response = await DealershipAPI.getAllDealerships({
            search: dealershipCode,
            limit: 100,
            includeCount: false,
          });
          let candidates = response?.data?.dealerships || [];
          if (!candidates.length) {
            const fallback = await DealershipAPI.getAllDealerships({
              limit: 200,
              includeCount: false,
            });
            candidates = fallback?.data?.dealerships || [];
          }

          const normalizedCode = dealershipCode.toLowerCase();
          const match =
            candidates.find((d) => d.code?.toLowerCase() === normalizedCode) ||
            candidates.find((d) => d.code?.toLowerCase().includes(normalizedCode));

          if (match) {
            setDealership(match as any);
            return;
          }
        } catch (resolverError) {
          console.warn('⚠️ Failed to resolve dealership via code lookup:', resolverError);
        }
      }

      const response = await handleApiCall(() =>
        apiClient.get<any>('/dealerships', { params: { id: dealershipId } })
      );
      const found = ((response as any)?.dealerships || (response as any)?.data || []).find((d: any) => d.id === dealershipId) || null;
      setDealership(found);
    } catch (error) {
      console.error('Failed to load dealership:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshDealership = async () => {
    if (state.user?.dealershipId) {
      await fetchDealership(state.user.dealershipId);
    }
  };

  return (
    <DealershipContext.Provider value={{ dealership, loading, refreshDealership }}>
      {children}
    </DealershipContext.Provider>
  );
};

export const useDealership = (): DealershipContextType => {
  const ctx = useContext(DealershipContext);
  if (!ctx) throw new Error('useDealership must be used within a DealershipProvider');
  return ctx;
};


