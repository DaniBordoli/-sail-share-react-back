import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, UserCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "@/stores/slices/basicSlice";
import { useToast } from "@/hooks/use-toast";
import type { UserData, RegisterData, RegistrationStep2Data } from "@/types/api";

const RegisterStep2 = () => {
  const [dniFile, setDniFile] = useState<File | null>(null);
  const [titles, setTitles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    dniOrLicense: "",
    experienceDeclaration: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step1Data, setStep1Data] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    
    const storedStep1Data = localStorage.getItem('registrationStep1Data');
    if (storedStep1Data) {
      setStep1Data(JSON.parse(storedStep1Data));
    } else {
    
      navigate('/register');
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDniFile(e.target.files[0]);
    }
  };

  const handleTitlesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setTitles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!step1Data) {
        toast({ title: 'Datos incompletos', description: 'No se encontraron datos del primer paso.', variant: 'destructive' });
        navigate('/register');
        return;
      }

    
      const completeUserData: UserData = {
        firstName: step1Data.firstName,
        lastName: step1Data.lastName,
        email: step1Data.email,
        phone: step1Data.phone,
        password: step1Data.password,
        dniOrLicense: formData.dniOrLicense,
        experienceDeclaration: formData.experienceDeclaration
      };

      const response = await createUser(completeUserData);
      
      if (response.success) {
        localStorage.removeItem('registrationStep1Data');
        navigate('/register-email-sent');
      } else {
        toast({ title: 'No se pudo completar el registro', description: response.message || 'Intenta nuevamente.', variant: 'destructive' });
      }
      
    } catch (error) {
      console.error("Error completando registro:", error);
      toast({ title: 'Error de red', description: 'Intenta nuevamente.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <div className="pt-24 pb-16">
        <div className="max-w-md mx-auto px-4">
          <Card className="shadow-elegant border-0">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-gradient-ocean rounded-full">
                  <UserCheck className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Verificación y Experiencia</CardTitle>
                <p className="text-muted-foreground mt-2">
                  Completa tu perfil para navegar con NavBoat
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
            
                <div className="space-y-2">
                  <Label htmlFor="dniOrLicense">DNI o Licencia de Navegación</Label>
                  <Input 
                    id="dniOrLicense" 
                    type="text" 
                    value={formData.dniOrLicense}
                    onChange={handleInputChange}
                    placeholder="Número de documento o licencia" 
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <Input id="dniFile" type="file" accept="image/*,.pdf" onChange={handleDniChange} className="w-full" />
                    {dniFile && (
                      <span className="text-xs text-muted-foreground truncate max-w-[120px]">{dniFile.name}</span>
                    )}
                  </div>
                </div>

           
                <div className="space-y-2">
                  <Label htmlFor="experienceDeclaration">Declaración de experiencia</Label>
                  <Textarea
                    id="experienceDeclaration"
                    placeholder="Describe tu experiencia náutica, años navegando, tipos de embarcaciones, etc."
                    value={formData.experienceDeclaration}
                    onChange={handleInputChange}
                    className="min-h-[100px]"
                  />
                </div>

           
                <div className="space-y-2">
                  <Label htmlFor="titles">Títulos, grados o referencias</Label>
                  <Input id="titles" type="file" multiple accept="image/*,.pdf" onChange={handleTitlesChange} />
                  {titles.length > 0 && (
                    <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                      {titles.map((file, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <FileText className="h-4 w-4" /> {file.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-ocean hover:opacity-90 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? "Completando registro..." : "Continuar"}
                </Button>
              </form>
              <div className="relative">
                <Separator />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterStep2;
