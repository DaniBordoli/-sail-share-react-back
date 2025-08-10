import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';

export type CurrentUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  googleId?: string;
  facebookId?: string;
  isVerified?: boolean;
  avatar?: string;
};

export const useCurrentUser = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Token inválido/expirado
          localStorage.removeItem('authToken');
          setUser(null);
          setError('Sesión expirada o no autorizada');
        } else {
          const data = await res.json().catch(() => ({}));
          setError(data?.message || 'Error obteniendo usuario actual');
        }
        return;
      }

      const data = await res.json();
      setUser(data.user);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return { user, loading, error, refetch: fetchCurrentUser };
};
