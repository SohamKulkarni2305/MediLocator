import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { PrescriptionRecord } from '../context/PrescriptionContext';

export const useUploadPrescription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await apiClient.post<PrescriptionRecord>('/prescriptions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
};

export const useApprovePrescription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pharmacistName, pharmacistLicense }: { id: string; pharmacistName: string; pharmacistLicense: string }) => {
      const { data } = await apiClient.put(`/prescriptions/${id}/approve`, { pharmacistName, pharmacistLicense });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
};

export const useRejectPrescription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await apiClient.put(`/prescriptions/${id}/reject`, { reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
};

export const useCaseSignoff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, approved, rejectionReason, pharmacistName, pharmacistLicense }: { id: string; approved: boolean; rejectionReason?: string; pharmacistName: string; pharmacistLicense: string }) => {
      const { data } = await apiClient.put(`/cases/${id}/signoff`, { approved, rejectionReason, pharmacistName, pharmacistLicense });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
};

export const useApprovePharmacy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.put(`/pharmacies/${id}/approve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
    },
  });
};

export const useRejectPharmacy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await apiClient.put(`/pharmacies/${id}/reject`, { reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
    },
  });
};
