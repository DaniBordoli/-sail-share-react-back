import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Ship, Upload, MapPin, Euro, Calendar, Users, Anchor, Wifi, Car, Utensils, Waves, CheckCircle } from "lucide-react";

const ListYourBoat = () => {
  const features = [
    { id: "wifi", name: "WiFi", icon: Wifi },
    { id: "parking", name: "Aparcamiento", icon: Car },
    { id: "kitchen", name: "Cocina", icon: Utensils },
    { id: "bathroom", name: "Baño", icon: Waves },
    { id: "anchor", name: "Ancla", icon: Anchor },
  ];

  const steps = [
    { number: 1, title: "Información Básica", description: "Detalles de tu embarcación" },
    { number: 2, title: "Ubicación", description: "Dónde se encuentra" },
    { number: 3, title: "Precios", description: "Tarifas y disponibilidad" },
    { number: 4, title: "Fotos", description: "Galería de imágenes" },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      {/* Hero Section */}
      <div className="pt-20 pb-16 bg-gradient-ocean">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/20 rounded-full">
              <Ship className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Alquila Tu Barco
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Convierte tu embarcación en una fuente de ingresos. Únete a miles de propietarios 
            que ya están ganando dinero con NavBoat.
          </p>
          <div className="flex items-center justify-center gap-8 text-white/90">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Registro gratuito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Seguro incluido</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Pagos seguros</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.number}
                  </div>
                  <div className="text-center mt-2">
                    <div className="font-medium text-sm">{step.title}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-px bg-gray-200 mx-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="boatName">Nombre del barco</Label>
                    <Input id="boatName" placeholder="Ej: Aventura Marina" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="boatType">Tipo de embarcación</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sailboat">Velero</SelectItem>
                        <SelectItem value="motorboat">Lancha motora</SelectItem>
                        <SelectItem value="catamaran">Catamarán</SelectItem>
                        <SelectItem value="yacht">Yate</SelectItem>
                        <SelectItem value="speedboat">Lancha rápida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="length">Eslora (metros)</Label>
                    <Input id="length" type="number" placeholder="12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacidad máxima</Label>
                    <Input id="capacity" type="number" placeholder="8" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Año de construcción</Label>
                    <Input id="year" type="number" placeholder="2020" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe tu barco, sus características especiales, equipamiento..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Equipamiento y servicios</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {features.map((feature) => (
                      <div key={feature.id} className="flex items-center space-x-2">
                        <Checkbox id={feature.id} />
                        <label
                          htmlFor={feature.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                        >
                          <feature.icon className="h-4 w-4" />
                          {feature.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="marina">Puerto/Marina</Label>
                    <Input id="marina" placeholder="Puerto Banús" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input id="city" placeholder="Marbella" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección completa</Label>
                  <Input id="address" placeholder="Puerto José Banús, 29660 Marbella, Málaga" />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Precios y Disponibilidad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priceHour">Precio por hora</Label>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input id="priceHour" type="number" placeholder="150" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priceDay">Precio por día</Label>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input id="priceDay" type="number" placeholder="800" className="pl-10" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minRental">Duración mínima de alquiler</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona duración mínima" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2h">2 horas</SelectItem>
                      <SelectItem value="4h">4 horas</SelectItem>
                      <SelectItem value="1d">1 día</SelectItem>
                      <SelectItem value="2d">2 días</SelectItem>
                      <SelectItem value="1w">1 semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Servicios adicionales</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="captain" />
                        <label htmlFor="captain" className="text-sm font-medium">
                          Capitán incluido
                        </label>
                      </div>
                      <Input type="number" placeholder="200" className="w-24" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="fuel" />
                        <label htmlFor="fuel" className="text-sm font-medium">
                          Combustible incluido
                        </label>
                      </div>
                      <Input type="number" placeholder="100" className="w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Fotos del Barco
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-lg font-medium text-gray-900 mb-2">
                    Arrastra y suelta tus fotos aquí
                  </div>
                  <div className="text-gray-500 mb-4">
                    o haz clic para seleccionar archivos
                  </div>
                  <Button variant="outline">Seleccionar Fotos</Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sube al menos 5 fotos de buena calidad. La primera será la foto principal.
                </p>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline">Guardar Borrador</Button>
              <Button className="bg-gradient-ocean">Continuar</Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Benefits Card */}
            <Card>
              <CardHeader>
                <CardTitle>¿Por qué elegir NavBoat?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Comisión competitiva</div>
                    <div className="text-sm text-muted-foreground">Solo 15% por reserva</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Seguro completo</div>
                    <div className="text-sm text-muted-foreground">Cobertura total incluida</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Soporte 24/7</div>
                    <div className="text-sm text-muted-foreground">Asistencia continua</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Pagos garantizados</div>
                    <div className="text-sm text-muted-foreground">Cobra en 24-48h</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Earnings Calculator */}
            <Card>
              <CardHeader>
                <CardTitle>Calculadora de Ingresos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Precio por día estimado</Label>
                  <div className="text-2xl font-bold text-primary">800€</div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Ingresos mensuales</span>
                    <span className="font-medium">6.800€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Comisión NavBoat (15%)</span>
                    <span className="font-medium">-1.020€</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tus ganancias netas</span>
                    <span className="text-primary">5.780€</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  *Estimación basada en 10 días de alquiler por mes
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>¿Necesitas ayuda?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Nuestro equipo está aquí para ayudarte en todo el proceso.
                </p>
                <Button variant="outline" className="w-full">
                  Contactar Soporte
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ListYourBoat;