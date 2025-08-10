import { useState, useEffect } from 'react';
import { testConnection as testBackendConnection } from '@/stores/slices/basicSlice';

export const useApiConnection = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await testBackendConnection();
      console.log('✅ Conexión con backend exitosa:', response);
      setIsConnected(true);
    } catch (err) {
      console.error('❌ Error conectando con backend:', err);
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return {
    isConnected,
    isLoading,
    error,
    testConnection,
  };
};
