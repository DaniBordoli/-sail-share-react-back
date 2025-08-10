import { useApiConnection } from '@/hooks/use-api-connection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const ApiConnectionTest = () => {
  const { isConnected, isLoading, error, testConnection } = useApiConnection();

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (isConnected) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = () => {
    if (isLoading) return <Badge variant="secondary">Conectando...</Badge>;
    if (isConnected) return <Badge variant="default" className="bg-green-500">Conectado</Badge>;
    return <Badge variant="destructive">Desconectado</Badge>;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Estado de Conexión API
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Backend:</span>
          {getStatusBadge()}
        </div>
        
        <div className="text-sm text-muted-foreground">
          <strong>URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:5000'}
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        <Button 
          onClick={testConnection} 
          disabled={isLoading}
          variant="outline" 
          size="sm" 
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Probar Conexión
        </Button>
      </CardContent>
    </Card>
  );
};
