import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-yacht.jpg";
import { MailCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RegisterEmailSent = () => {
  const navigate = useNavigate();

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
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-elegant p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-blue-100">
                <MailCheck className="h-8 w-8 text-blue-700" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">¡Revisa tu email!</h1>
            <p className="text-muted-foreground">
              Te enviamos un correo con un enlace para <strong>verificar tu cuenta</strong>. Si no lo ves, revisa la carpeta de spam o usa la opción de reenviar desde el login.
            </p>
            <div className="flex justify-center">
              <Button onClick={() => navigate('/login')} className="bg-gradient-ocean hover:opacity-90">
                Ir a Iniciar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default RegisterEmailSent;
