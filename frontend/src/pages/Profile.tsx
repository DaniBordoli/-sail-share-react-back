import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Star, Calendar, Phone, Mail, Edit, Settings, Heart, Ship } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { updateUserAuthorized } from "@/stores/slices/basicSlice";
import { useCurrentUser } from "@/hooks/use-current-user";

const Profile = () => {
  const { user, loading, error, refetch } = useCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  const userProfile = {
    name: user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email : "Usuario",
    email: user?.email ?? "—",
    phone: user?.phone ?? "—",
    location: "—",
    memberSince: "—",
    avatar: user?.avatar || "/placeholder.svg",
    rating: 4.8,
    reviews: 47,
    completedRentals: 23,
    favoriteBoats: 8,
    ownedBoats: 2,
  };

  const recentActivity = [
    {
      id: 1,
      type: "rental",
      title: "Alquiler completado",
      description: "Velero Oceanis 46.1 en Mallorca",
      date: "15 Dic 2024",
      status: "completado"
    },
    {
      id: 2,
      type: "review",
      title: "Nueva reseña recibida",
      description: "⭐⭐⭐⭐⭐ Excelente inquilino",
      date: "12 Dic 2024",
      status: "nuevo"
    },
    {
      id: 3,
      type: "favorite",
      title: "Barco añadido a favoritos",
      description: "Catamarán Lagoon 42 en Valencia",
      date: "10 Dic 2024",
      status: "nuevo"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Cargando perfil...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <div className="text-xl font-semibold">Inicia sesión para ver tu perfil</div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <Button asChild>
            <a href="/login">Ir a Iniciar sesión</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Profile Hero Section */}
      <div className="pt-20 pb-8 bg-gradient-ocean">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
              <AvatarFallback className="text-2xl font-bold bg-white text-primary">
                {userProfile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {userProfile.name}
                </h1>
                <div className="flex items-center gap-4 text-white/90">
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{userProfile.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>Miembro desde {userProfile.memberSince}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                  <Star className="fill-yellow-400 text-yellow-400" size={20} />
                  <span className="text-white font-semibold">{userProfile.rating}</span>
                  <span className="text-white/80">({userProfile.reviews} reseñas)</span>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Usuario Verificado
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="gap-2"
                onClick={() => {
                  if (user) {
                    setForm({
                      firstName: (user.firstName ?? ""),
                      lastName: (user.lastName ?? ""),
                      phone: (user.phone ?? ""),
                    });
                  }
                  setIsEditing((v) => !v);
                }}
              >
                <Edit size={16} />
                {isEditing ? "Cancelar" : "Editar Perfil"}
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Settings size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Stats Cards */}
          <div className="lg:col-span-2 space-y-6">
            {isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle>Editar Perfil</CardTitle>
                </CardHeader>
                <CardContent>
                  {formError && (
                    <div className="mb-3 text-sm text-red-600">{formError}</div>
                  )}
                  <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setFormError(null);
                      if (!user?._id) return;
                      try {
                        setSaving(true);
                        await updateUserAuthorized(user._id, {
                          firstName: form.firstName,
                          lastName: form.lastName,
                          phone: form.phone,
                        });
                        await refetch();
                        setIsEditing(false);
                      } catch (err) {
                        setFormError(err instanceof Error ? err.message : "Error actualizando el perfil");
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    <div>
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input
                        id="firstName"
                        value={form.firstName}
                        onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input
                        id="lastName"
                        value={form.lastName}
                        onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                        placeholder="Tu apellido"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="Ej: +34 600 000 000"
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-2 justify-end mt-2">
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={saving}>
                        {saving ? "Guardando..." : "Guardar Cambios"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {userProfile.completedRentals}
                  </div>
                  <p className="text-sm text-muted-foreground">Alquileres</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {userProfile.favoriteBoats}
                  </div>
                  <p className="text-sm text-muted-foreground">Favoritos</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {userProfile.ownedBoats}
                  </div>
                  <p className="text-sm text-muted-foreground">Mis Barcos</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {userProfile.reviews}
                  </div>
                  <p className="text-sm text-muted-foreground">Reseñas</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship size={20} />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id}>
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {activity.type === 'rental' && <Ship size={16} className="text-blue-500" />}
                        {activity.type === 'review' && <Star size={16} className="text-yellow-500" />}
                        {activity.type === 'favorite' && <Heart size={16} className="text-red-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{activity.title}</h4>
                          <span className="text-sm text-muted-foreground">{activity.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                    </div>
                    {index < recentActivity.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-muted-foreground" />
                  <span className="text-sm">{userProfile.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-muted-foreground" />
                  <span className="text-sm">{userProfile.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-muted-foreground" />
                  <span className="text-sm">{userProfile.location}</span>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Preferencias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notificaciones por email</span>
                  <Badge variant="secondary">Activado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Perfil público</span>
                  <Badge variant="secondary">Activado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mostrar teléfono</span>
                  <Badge variant="outline">Desactivado</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Heart size={16} />
                  Ver Favoritos
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Ship size={16} />
                  Mis Barcos
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Star size={16} />
                  Mis Reseñas
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

export default Profile;