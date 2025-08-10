import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-yacht.jpg";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VerifyEmailSuccess = () => {
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
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-elegant p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">¡Email verificado!</h1>
            <p className="text-muted-foreground mb-6">
              Tu cuenta ha sido activada correctamente. Ya puedes iniciar sesión para comenzar tu aventura en NavBoat.
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

export default VerifyEmailSuccess;
