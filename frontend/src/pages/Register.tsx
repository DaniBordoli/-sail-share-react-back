import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Anchor, Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { RegisterData } from "@/types/api";
import { loginWithGoogle, loginWithFacebook } from "@/stores/slices/basicSlice";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-yacht.jpg";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    newsletter: false
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleCheckboxChange = (field: string) => (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validaciones básicas
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
        toast({ title: 'Campos incompletos', description: 'Completa todos los campos requeridos.', variant: 'destructive' });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({ title: 'Contraseñas distintas', description: 'Asegúrate de que coincidan.', variant: 'destructive' });
        return;
      }

      if (!formData.acceptTerms) {
        toast({ title: 'Falta aceptar términos', description: 'Debes aceptar los términos y condiciones.', variant: 'destructive' });
        return;
      }

      
      const step1Data = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        newsletter: formData.newsletter
      };

      localStorage.setItem('registrationStep1Data', JSON.stringify(step1Data));
      
    
      navigate("/register-step2");
      
    } catch (error) {
      console.error("Error en validación:", error);
      toast({ title: 'Error de validación', description: 'Inténtalo nuevamente.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
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
        <div className="absolute inset-0 bg-gradient-hero opacity-60 pointer-events-none"></div>
        <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
      </div>

      <div className="relative z-50 pointer-events-auto">
        <Header />
      </div>
      
      <div className="pt-24 pb-16 relative z-10">
        <div className="max-w-md mx-auto px-4">
          <Card className="shadow-elegant border-0">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-gradient-ocean rounded-full">
                  <Anchor className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
                <p className="text-muted-foreground mt-2">
                  Únete a la comunidad náutica de NavBoat
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="rounded-md border border-blue-300 bg-blue-50 text-blue-800 p-3 text-sm">
                <p>
                  Al registrarte con email, te enviaremos un <strong>correo de verificación</strong>. 
                  Debes <strong>verificar tu cuenta</strong> para poder iniciar sesión.
                </p>
              </div>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Carlos"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Rodríguez"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="carlos@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+34 666 777 888"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Mínimo 8 caracteres"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Repite tu contraseña"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="terms" 
                      className="mt-1" 
                      checked={formData.acceptTerms}
                      onCheckedChange={handleCheckboxChange("acceptTerms")}
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground leading-none">
                      Acepto los{" "}
                      <a href="#" className="text-primary hover:text-primary/80 font-medium">
                        términos y condiciones
                      </a>{" "}
                      y la{" "}
                      <a href="#" className="text-primary hover:text-primary/80 font-medium">
                        política de privacidad
                      </a>
                    </label>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="newsletter" 
                      className="mt-1" 
                      checked={formData.newsletter}
                      onCheckedChange={handleCheckboxChange("newsletter")}
                    />
                    <label htmlFor="newsletter" className="text-sm text-muted-foreground leading-none">
                      Quiero recibir ofertas especiales y noticias por email
                    </label>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-ocean hover:opacity-90 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                </Button>
              </form>
              
              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-muted-foreground text-sm">
                  o regístrate con
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={loginWithGoogle}
                  type="button"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="gap-2" onClick={loginWithFacebook} type="button">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>
              </div>
              
              <div className="text-center text-sm">
                <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
                <a href="/login" className="text-primary hover:text-primary/80 font-medium">
                  Inicia sesión aquí
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Register;