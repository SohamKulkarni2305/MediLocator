import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { DrugItem, PharmacyKYC, PharmacistCase, OrderTrackingState, OrangeBookEntry } from '../types';
import type { PrescriptionRecord } from '../context/PrescriptionContext';

export const useDrugs = (query?: string, inStock?: boolean) => {
  return useQuery({
    queryKey: ['drugs', query, inStock],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (inStock !== undefined) params.append('inStock', inStock.toString());
      
      const { data } = await apiClient.get<{ data: DrugItem[] }>('/drugs', { params });
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOrangeBook = () => {
  return useQuery({
    queryKey: ['orange-book'],
    queryFn: async () => {
      const { data } = await apiClient.get<OrangeBookEntry[]>('/drugs/orange-book');
      return data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const usePharmacies = () => {
  return useQuery({
    queryKey: ['pharmacies'],
    queryFn: async () => {
      const { data } = await apiClient.get<PharmacyKYC[]>('/pharmacies');
      return data;
    },
  });
};

export const usePharmacistCases = () => {
  return useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const { data } = await apiClient.get<PharmacistCase[]>('/cases');
      return data;
    },
  });
};

export const usePrescriptions = () => {
  return useQuery({
    queryKey: ['prescriptions'],
    queryFn: async () => {
      const { data } = await apiClient.get<PrescriptionRecord[]>('/prescriptions');
      return data;
    },
  });
};

export const useOrderTracking = (orderId: string | null) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: async () => {
      const { data } = await apiClient.get<OrderTrackingState>(`/orders/${orderId}`);
      return data;
    },
    enabled: !!orderId,
    refetchInterval: 10000, // Poll every 10s for live tracking
  });
};

export const useComplianceTrends = () => {
  return useQuery({
    queryKey: ['compliance-trends'],
    queryFn: async () => {
      const { data } = await apiClient.get('/compliance/trends');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
