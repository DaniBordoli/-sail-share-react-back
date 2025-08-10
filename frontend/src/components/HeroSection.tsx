import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Anchor, Users } from "lucide-react";
import heroImage from "@/assets/hero-yacht.jpg";

export const HeroSection = () => {
  const [searchData, setSearchData] = useState({
    location: "",
    startDate: "",
    endDate: "",
    boatType: "",
    guests: ""
  });

  const handleSearch = () => {
    console.log("Searching with:", searchData);
    // Here would go the search logic
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-hero opacity-60"></div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 text-white/30 float-animation">
        <Anchor size={60} />
      </div>
      <div className="absolute bottom-32 right-16 text-white/20 wave-animation">
        <Anchor size={40} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Navega tus
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent"> Sueños</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Descubre más de 50,000 barcos y yates disponibles para alquiler en todo el mundo. 
            Tu aventura perfecta te está esperando.
          </p>
          <div className="flex items-center justify-center gap-2 text-white/80 mb-8">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-xl">★★★★★</span>
              <span className="font-semibold">4.9/5</span>
            </div>
            <span className="text-white/60">•</span>
            <span>Basado en <strong>180,000+</strong> reseñas</span>
          </div>
        </div>

        {/* Search Card */}
        <Card variant="floating" className="max-w-5xl mx-auto backdrop-blur-lg bg-white/95 border-white/30">
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin size={16} />
                  Destino
                </label>
                <Input
                  placeholder="¿Dónde quieres navegar?"
                  value={searchData.location}
                  onChange={(e) => setSearchData({...searchData, location: e.target.value})}
                  className="border-muted focus:border-primary"
                />
              </div>

              {/* Check-in Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar size={16} />
                  Inicio
                </label>
                <Input
                  type="date"
                  value={searchData.startDate}
                  onChange={(e) => setSearchData({...searchData, startDate: e.target.value})}
                  className="border-muted focus:border-primary"
                />
              </div>

              {/* Check-out Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar size={16} />
                  Fin
                </label>
                <Input
                  type="date"
                  value={searchData.endDate}
                  onChange={(e) => setSearchData({...searchData, endDate: e.target.value})}
                  className="border-muted focus:border-primary"
                />
              </div>

              {/* Boat Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Tipo de embarcación
                </label>
                <Select value={searchData.boatType} onValueChange={(value) => setSearchData({...searchData, boatType: value})}>
                  <SelectTrigger className="border-muted focus:border-primary">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motor">Lancha</SelectItem>
                    <SelectItem value="sailboat">Velero</SelectItem>
                    <SelectItem value="yacht">Yate</SelectItem>
                    <SelectItem value="catamaran">Catamarán</SelectItem>
                    <SelectItem value="rib">Zodiac</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <Button 
                variant="search" 
                size="xl" 
                onClick={handleSearch}
                className="w-full"
              >
                Buscar
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-8 pt-6 border-t border-muted">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50,000+</div>
                <div className="text-sm text-muted-foreground">Embarcaciones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">2,500+</div>
                <div className="text-sm text-muted-foreground">Destinos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">180k+</div>
                <div className="text-sm text-muted-foreground">Clientes felices</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
