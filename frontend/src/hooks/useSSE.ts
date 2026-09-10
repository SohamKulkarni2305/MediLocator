import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePrescription } from '../context/PrescriptionContext';

export const useSSE = (enabled: boolean = true) => {
  const queryClient = useQueryClient();
  const { addVerificationToast } = usePrescription(); // Still use context just for toast triggering

  useEffect(() => {
    if (!enabled) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // Use a custom implementation instead of standard EventSource to pass Authorization header
    // Standard EventSource doesn't support custom headers easily, so we use fetch API
    const abortController = new AbortController();
    
    const connectSSE = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/events`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: abortController.signal
        });

        if (!response.body) return;
        
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const lines = value.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));
                
                // Handle different event types
                if (data.type === 'PRESCRIPTION_UPDATED') {
                  // Invalidate queries so TanStack refetches
                  queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
                  queryClient.invalidateQueries({ queryKey: ['cases'] });
                  
                  // Trigger toast if it's an approval/rejection
                  if (data.status === 'approved' || data.status === 'rejected') {
                    addVerificationToast({
                      rxId: data.rxId,
                      rxNumber: data.rxNumber,
                      doctorName: data.doctorName,
                      clinicName: data.clinicName,
                      type: data.status,
                      title: data.status === 'approved' ? 'Prescription Verification Approved' : 'Prescription Verification Rejected',
                      message: data.message,
                      medicinesSummary: data.medicinesSummary,
                      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST'
                    });
                  }
                }
              } catch (e) {
                console.error('Error parsing SSE data', e);
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('SSE connection error:', err);
          // Reconnect logic would go here
          setTimeout(connectSSE, 5000);
        }
      }
    };

    connectSSE();

    return () => {
      abortController.abort();
    };
  }, [enabled, queryClient, addVerificationToast]);
};
