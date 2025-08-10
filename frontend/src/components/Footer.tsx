import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Anchor, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export const Footer = () => {
  const footerSections = [
    {
      title: "Empresa",
      links: [
        { name: "Sobre Nosotros", href: "#" },
        { name: "Carreras", href: "#" },
        { name: "Prensa", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Sostenibilidad", href: "#" }
      ]
    },
    {
      title: "Servicios",
      links: [
        { name: "Alquiler de Barcos", href: "#" },
        { name: "Alquiler de Yates", href: "#" },
        { name: "Con Capitán", href: "#" },
        { name: "Sin Capitán", href: "#" },
        { name: "Experiencias", href: "#" }
      ]
    },
    {
      title: "Destinos",
      links: [
        { name: "Mediterráneo", href: "#" },
        { name: "Caribe", href: "#" },
        { name: "Baleares", href: "#" },
        { name: "Canarias", href: "#" },
        { name: "Costa Brava", href: "#" }
      ]
    },
    {
      title: "Soporte",
      links: [
        { name: "Centro de Ayuda", href: "#" },
        { name: "Contacto", href: "#" },
        { name: "Términos de Uso", href: "#" },
        { name: "Política de Privacidad", href: "#" },
        { name: "Cancelaciones", href: "#" }
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "YouTube" }
  ];

  return (
    <footer className="bg-foreground text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-ocean">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Navega hacia Ofertas Exclusivas
            </h3>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Suscríbete a nuestro newsletter y recibe las mejores ofertas, destinos únicos 
              y consejos náuticos directamente en tu email.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Tu email aquí..."
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
              />
              <Button variant="hero" className="bg-white text-primary hover:bg-white/90">
                Suscribirse
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Anchor className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">NavBoat</h1>
                <p className="text-sm text-white/80">Tu aventura náutica</p>
              </div>
            </div>
            <p className="text-white/80 leading-relaxed">
              La plataforma líder en alquiler de embarcaciones. Más de 50,000 barcos 
              en todo el mundo te esperan para vivir experiencias náuticas inolvidables.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/80">
                <Phone size={18} className="text-primary" />
                <span>+34 900 123 456</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <Mail size={18} className="text-primary" />
                <span>info@navboat.com</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <MapPin size={18} className="text-primary" />
                <span>Barcelona, España</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 bg-white/10 rounded-lg hover:bg-primary hover:scale-110 transition-all duration-300"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h4 className="text-lg font-semibold text-white">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-white/80 hover:text-primary transition-colors duration-300"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white/80 text-sm">
              © 2024 NavBoat. Todos los derechos reservados.
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-white/80 hover:text-primary transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="text-white/80 hover:text-primary transition-colors">
                Términos de Servicio
              </a>
              <a href="#" className="text-white/80 hover:text-primary transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};