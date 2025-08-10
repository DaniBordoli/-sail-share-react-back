import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import heroImage from "@/assets/hero-yacht.jpg";

const VerifyEmailHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>("Verificando tu email...");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    const run = async () => {
      if (!token) {
        navigate(`/verify-email/error?reason=${encodeURIComponent('Token faltante en la URL')}`);
        return;
      }
      try {
        const base = import.meta.env.VITE_API_URL || (window as any).API_BASE_URL;
        const res = await fetch(`${base}/api/users/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (res.ok && data.success) {
          navigate("/verify-email/success", { replace: true });
        } else {
          const reason = data.message || 'Token inválido o expirado';
          navigate(`/verify-email/error?reason=${encodeURIComponent(reason)}`, { replace: true });
        }
      } catch (e) {
        navigate(`/verify-email/error?reason=${encodeURIComponent('Error de red verificando el email')}`);
      }
    };

    run();
  }, [location.search, navigate]);

  return (
    <div className="relative min-h-screen isolate">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none select-none"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-hero opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      </div>

      <div className="relative z-50 pointer-events-auto">
        <Header />
      </div>

      <div className="pt-24 pb-16 relative z-10">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-elegant p-8 text-center">
            <p className="text-muted-foreground">{message}</p>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default VerifyEmailHandler;
