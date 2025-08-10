import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Anchor, User, Heart, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { logout } from "@/stores/slices/basicSlice";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Buscar Barcos", href: "#" },
    { name: "Destinos", href: "#" },
    { name: "Alquila tu Barco", href: "/list-your-boat" },
    { name: "Ayuda", href: "#" }
  ];

  const [isAuth, setIsAuth] = useState<boolean>(false);

  useEffect(() => {
    const check = () => setIsAuth(!!localStorage.getItem('authToken'));
    check();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'authToken') check();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', check);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', check);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsAuth(false);
    // Navegar a inicio
    window.location.href = '/';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[60] bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Anchor className="h-8 w-8 text-white" />
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold tracking-tight">NavBoat</h1>
              <p className="text-xs text-white/80">Tu aventura náutica</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-white/90 hover:text-white text-sm font-medium transition-colors duration-300 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Heart size={18} />
            </Button>
            {isAuth ? (
              <>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" asChild>
                  <Link to="/profile">
                    <User size={18} />
                    Perfil
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={handleLogout}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" asChild>
                  <Link to="/login">Iniciar Sesión</Link>
                </Button>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/register">Registrarse</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden text-white hover:bg-white/20">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white/95 backdrop-blur-lg">
              <div className="flex flex-col space-y-6 pt-6">
                {/* Mobile Logo */}
                <div className="flex items-center gap-3 pb-6 border-b">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Anchor className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">NavBoat</h1>
                    <p className="text-xs text-muted-foreground">Tu aventura náutica</p>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex flex-col space-y-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-foreground hover:text-primary text-base font-medium transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                {/* Mobile Actions */}
                <div className="flex flex-col gap-3 pt-6 border-t">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Heart size={18} />
                    Favoritos
                  </Button>
                  {isAuth ? (
                    <>
                      <Button variant="outline" className="w-full justify-start gap-2" asChild onClick={() => setIsOpen(false)}>
                        <Link to="/profile">
                          <User size={18} />
                          Mi Perfil
                        </Link>
                      </Button>
                      <Button variant="ocean" className="w-full" onClick={() => { setIsOpen(false); handleLogout(); }}>
                        Cerrar sesión
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full justify-start gap-2" asChild onClick={() => setIsOpen(false)}>
                        <Link to="/login">
                          <User size={18} />
                          Iniciar Sesión
                        </Link>
                      </Button>
                      <Button variant="ocean" className="w-full" asChild onClick={() => setIsOpen(false)}>
                        <Link to="/register">Registrarse</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};