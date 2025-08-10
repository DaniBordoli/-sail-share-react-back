import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-yacht.jpg";
import { AlertTriangle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useMemo } from "react";
import { resendVerificationEmail } from "@/stores/slices/basicSlice";
import { useToast } from "@/hooks/use-toast";

const VerifyEmailError = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const params = new URLSearchParams(location.search);
  const reasonFromQuery = useMemo(() => params.get("reason") || "No se pudo verificar el email.", [location.search]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast({ title: "Falta el email", description: "Ingresa tu email para reenviar la verificación.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await resendVerificationEmail(email);
      if (res.success) {
        toast({ title: "Email reenviado", description: res.message || "Revisa tu bandeja de entrada." });
      } else {
        toast({ title: "No se pudo reenviar", description: res.message || "Intenta nuevamente.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error de red", description: "Intenta nuevamente en unos segundos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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
              <div className="p-3 rounded-full bg-yellow-100">
                <AlertTriangle className="h-8 w-8 text-yellow-700" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">No se pudo verificar tu email</h1>
            <p className="text-muted-foreground">{reasonFromQuery}</p>

            <div className="grid gap-3 max-w-md mx-auto text-left">
              <label className="text-sm">Reenviar verificación</label>
              <Input placeholder="tuemail@dominio.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <div className="flex gap-3 justify-center">
                <Button onClick={handleResend} disabled={loading} variant="outline">
                  {loading ? 'Enviando…' : 'Reenviar email'}
                </Button>
                <Button onClick={() => navigate('/login')} className="bg-gradient-ocean hover:opacity-90">
                  Ir a Iniciar Sesión
                </Button>
              </div>
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

export default VerifyEmailError;
