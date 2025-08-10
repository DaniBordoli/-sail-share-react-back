import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Anchor, MapPin, Calendar, Heart } from "lucide-react";
import { useState } from "react";

interface Boat {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  capacity: number;
  length: string;
  type: string;
  image: string;
  features: string[];
  isNew?: boolean;
  discount?: number;
}

const featuredBoats: Boat[] = [
  {
    id: 1,
    name: "Princess V65",
    location: "Ibiza, España",
    price: 2400,
    rating: 4.9,
    reviews: 127,
    capacity: 12,
    length: "20m",
    type: "Yate de lujo",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
    features: ["Capitán incluido", "Aire acondicionado", "Wifi", "Cocina completa"],
    isNew: true
  },
  {
    id: 2,
    name: "Oceanis 46.1",
    location: "Palma de Mallorca",
    price: 450,
    rating: 4.8,
    reviews: 89,
    capacity: 8,
    length: "14.6m",
    type: "Velero",
    image: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&h=600&fit=crop",
    features: ["Sin licencia", "Velas nuevas", "GPS", "Nevera"],
    discount: 15
  },
  {
    id: 3,
    name: "Azimut 55",
    location: "Costa Brava",
    price: 1800,
    rating: 4.9,
    reviews: 203,
    capacity: 10,
    length: "17m",
    type: "Yate deportivo",
    image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&h=600&fit=crop",
    features: ["Jet ski incluido", "Patrón profesional", "Bar", "Solarium"]
  },
  {
    id: 4,
    name: "Lagoon 450",
    location: "Canarias",
    price: 890,
    rating: 4.7,
    reviews: 156,
    capacity: 12,
    length: "13.96m",
    type: "Catamarán",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    features: ["Estable", "Amplios espacios", "Ducha exterior", "Snorkel"]
  }
];

export const FeaturedBoats = () => {
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (boatId: number) => {
    setFavorites(prev => 
      prev.includes(boatId) 
        ? prev.filter(id => id !== boatId)
        : [...prev, boatId]
    );
  };

  return (
    <section className="py-20 bg-gradient-sky">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-primary mb-4">
            <Anchor size={24} />
            <span className="text-sm font-semibold uppercase tracking-wider">Destacados</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Embarcaciones Populares
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubre nuestra selección de barcos más reservados y mejor valorados por nuestros clientes
          </p>
        </div>

        {/* Boats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredBoats.map((boat) => (
            <Card key={boat.id} variant="ocean" className="group overflow-hidden">
              {/* Image Container */}
              <div className="relative overflow-hidden">
                <img
                  src={boat.image}
                  alt={boat.name}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {boat.isNew && (
                    <Badge variant="default" className="bg-success text-success-foreground">
                      Nuevo
                    </Badge>
                  )}
                  {boat.discount && (
                    <Badge variant="destructive">
                      -{boat.discount}%
                    </Badge>
                  )}
                </div>

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(boat.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300"
                >
                  <Heart 
                    size={20} 
                    className={`transition-colors duration-300 ${
                      favorites.includes(boat.id) ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </button>

                {/* Rating */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-white text-sm font-medium">{boat.rating}</span>
                  <span className="text-white/80 text-sm">({boat.reviews})</span>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {boat.name}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin size={14} />
                      {boat.location}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {boat.type}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Boat Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{boat.capacity}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Anchor size={14} />
                    <span>{boat.length}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  <div className="flex flex-wrap gap-1">
                    {boat.features.slice(0, 2).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                        {feature}
                      </Badge>
                    ))}
                    {boat.features.length > 2 && (
                      <Badge variant="secondary" className="text-xs px-2 py-1">
                        +{boat.features.length - 2} más
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      €{boat.price.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">por día</div>
                  </div>
                  <Button variant="ocean" size="sm" className="shrink-0">
                    Ver Detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="hover:bg-primary hover:text-primary-foreground">
            Ver Todas las Embarcaciones
          </Button>
        </div>
      </div>
    </section>
  );
};