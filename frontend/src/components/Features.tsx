import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Clock, Anchor, Star, CreditCard, HeadphonesIcon } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Seguro Incluido",
    description: "Todas las reservas incluyen seguro completo para tu tranquilidad durante la navegación"
  },
  {
    icon: Clock,
    title: "Reserva Instantánea",
    description: "Confirma tu barco al instante. Sin esperas, sin complicaciones. Listo para navegar"
  },
  {
    icon: Anchor,
    title: "+50,000 Embarcaciones",
    description: "La mayor flota de barcos disponible en todo el mundo. Encuentra el perfecto para ti"
  },
  {
    icon: Star,
    title: "Capitanes Certificados",
    description: "Patrones profesionales con experiencia y certificaciones oficiales para tu seguridad"
  },
  {
    icon: CreditCard,
    title: "Pago Seguro",
    description: "Procesamiento de pagos encriptado y seguro. Cancela gratis hasta 24h antes"
  },
  {
    icon: HeadphonesIcon,
    title: "Soporte 24/7",
    description: "Asistencia inmediata durante tu experiencia. Estamos aquí cuando nos necesites"
  }
];

export const Features = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-primary mb-4">
            <Shield size={24} />
            <span className="text-sm font-semibold uppercase tracking-wider">¿Por qué NavBoat?</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Navega con Confianza
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Más de 180,000 clientes han confiado en nosotros para sus aventuras náuticas. 
            Descubre por qué somos líderes en alquiler de embarcaciones.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              variant="ocean"
              className="group hover:shadow-glow transition-all duration-500 hover:-translate-y-2"
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-ocean rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon size={32} className="text-white" />
                </div>
                <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-gradient-ocean rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold">50K+</div>
              <div className="text-white/80 text-sm">Embarcaciones</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold">2.5K+</div>
              <div className="text-white/80 text-sm">Destinos</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold">180K+</div>
              <div className="text-white/80 text-sm">Clientes Felices</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold">4.9★</div>
              <div className="text-white/80 text-sm">Valoración Media</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};