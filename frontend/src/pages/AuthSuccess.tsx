import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const provider = searchParams.get('provider') || 'google'; 
    
    console.log('AuthSuccess - Token recibido:', token);
    console.log('AuthSuccess - Proveedor:', provider);
    console.log('AuthSuccess - window.opener existe:', !!window.opener);
    
    if (token) {
   
      if (window.opener) {
        console.log('Enviando mensaje al popup padre...');
        
        
        const messageType = provider === 'facebook' ? 'FACEBOOK_AUTH_SUCCESS' : 'GOOGLE_AUTH_SUCCESS';
        
        window.opener.postMessage({
          type: messageType,
          token: token,
          provider: provider
        }, window.location.origin);
        
        console.log('Cerrando popup...');
    
        window.close();
      } else {
        console.log('No hay window.opener, usando fallback...');
    
        localStorage.setItem('authToken', token);
        window.location.href = '/';
      }
    } else {
      console.log('No hay token disponible');
   
      if (window.opener) {
        window.close();
      } else {
        window.location.href = '/login';
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Procesando autenticación...</h2>
        <p className="text-muted-foreground">Esta ventana se cerrará automáticamente.</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
