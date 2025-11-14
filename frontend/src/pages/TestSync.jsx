import { useState } from 'react';
import { Play, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';

const TestSync = () => {
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);

  // Simular pedido de Uber
  const handleSimulateOrder = async () => {
    setSimulating(true);
    setResult(null);
    try {
      const response = await api.post('/uber/simulate-order');
      setResult({
        type: 'success',
        title: '✅ Pedido Simulado Creado',
        data: response.data.data
      });
      // Actualizar estado después de crear el pedido
      await loadSyncStatus();
    } catch (error) {
      setResult({
        type: 'error',
        title: '❌ Error al Simular Pedido',
        message: error.response?.data?.message || error.message
      });
    } finally {
      setSimulating(false);
    }
  };

  // Sincronizar a Loyverse
  const handleSync = async () => {
    setSyncing(true);
    setResult(null);
    try {
      const response = await api.post('/sync/manual');
      setResult({
        type: 'success',
        title: '✅ Sincronización Completada',
        data: response.data.data
      });
      await loadSyncStatus();
    } catch (error) {
      setResult({
        type: 'error',
        title: '❌ Error en Sincronización',
        message: error.response?.data?.message || error.message
      });
    } finally {
      setSyncing(false);
    }
  };

  // Cargar estado de sincronización
  const loadSyncStatus = async () => {
    setLoading(true);
    try {
      const response = await api.get('/sync/status');
      setSyncStatus(response.data.data);
    } catch (error) {
      console.error('Error cargando estado:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Prueba de Sincronización</h1>
          <p className="text-muted-foreground mt-2">
            Simula pedidos de Uber y sincronízalos con Loyverse
          </p>
        </div>

        {/* Estado de Sincronización */}
        {syncStatus && (
          <Card>
            <CardHeader>
              <CardTitle>Estado Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <div className="text-2xl font-bold text-yellow-600">
                    {syncStatus.orders.pending}
                  </div>
                  <div className="text-sm text-muted-foreground">Pendientes</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">
                    {syncStatus.orders.synced}
                  </div>
                  <div className="text-sm text-muted-foreground">Sincronizados</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <div className="text-2xl font-bold text-red-600">
                    {syncStatus.orders.error}
                  </div>
                  <div className="text-sm text-muted-foreground">Con Error</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <RefreshCw className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">
                    {syncStatus.orders.total}
                  </div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Acciones */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones de Prueba</CardTitle>
            <CardDescription>
              Sigue estos pasos para probar la sincronización completa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Button
                onClick={handleSimulateOrder}
                disabled={simulating}
                className="flex-1"
              >
                <Play className="mr-2 h-4 w-4" />
                {simulating ? 'Simulando...' : '1. Simular Pedido de Uber'}
              </Button>
              <Button
                onClick={handleSync}
                disabled={syncing}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {syncing ? 'Sincronizando...' : '2. Sincronizar a Loyverse'}
              </Button>
              <Button
                onClick={loadSyncStatus}
                disabled={loading}
                variant="ghost"
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {loading ? 'Cargando...' : 'Actualizar Estado'}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground space-y-2 p-4 bg-muted rounded-lg">
              <p><strong>Instrucciones:</strong></p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click en "Simular Pedido de Uber" para crear un pedido de prueba</li>
                <li>Click en "Sincronizar a Loyverse" para enviar el pedido a Loyverse</li>
                <li>Verifica en tu panel de Loyverse que el pedido se haya registrado</li>
                <li>Usa "Actualizar Estado" para ver los cambios en tiempo real</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        {result && (
          <Card className={result.type === 'success' ? 'border-green-500' : 'border-red-500'}>
            <CardHeader>
              <CardTitle>{result.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {result.message && (
                <p className="text-sm text-muted-foreground mb-4">{result.message}</p>
              )}
              {result.data && (
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default TestSync;
