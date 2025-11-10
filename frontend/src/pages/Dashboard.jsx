import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import syncService from '../services/sync.service';
import aggregatorService from '../services/aggregator.service';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState(null);
  const [aggregators, setAggregators] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statusRes, aggregatorsRes] = await Promise.all([
        syncService.getStatus(),
        aggregatorService.getAll(),
      ]);

      setStats(statusRes.data);
      setAggregators(aggregatorsRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await syncService.manualSync();
      await loadData();
      alert('Sincronización completada exitosamente');
    } catch (error) {
      console.error('Error en sincronización:', error);
      alert('Error en la sincronización');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  const activeAggregators = aggregators.filter(a => a.isActive).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleManualSync} disabled={syncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Agregadores Activos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAggregators}</div>
              <p className="text-xs text-muted-foreground">
                de {aggregators.length} configurados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Órdenes Pendientes
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.orders?.pending || 0}</div>
              <p className="text-xs text-muted-foreground">
                esperando sincronización
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Órdenes Sincronizadas
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.orders?.synced || 0}</div>
              <p className="text-xs text-muted-foreground">
                exitosamente procesadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Órdenes con Error
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.orders?.error || 0}</div>
              <p className="text-xs text-muted-foreground">
                requieren atención
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Agregadores */}
        <Card>
          <CardHeader>
            <CardTitle>Agregadores Configurados</CardTitle>
          </CardHeader>
          <CardContent>
            {aggregators.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No tienes agregadores configurados
                </p>
                <Link to="/aggregators">
                  <Button>Configurar Agregadores</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {aggregators.map((aggregator) => (
                  <div
                    key={aggregator._id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <h3 className="font-semibold">{aggregator.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {aggregator.aggregatorType}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          aggregator.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {aggregator.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Última Sincronización */}
        {stats?.lastSync && (
          <Card>
            <CardHeader>
              <CardTitle>Última Sincronización</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fecha:</span>
                  <span className="text-sm font-medium">
                    {new Date(stats.lastSync.date).toLocaleString('es-ES')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Estado:</span>
                  <span
                    className={`text-sm font-medium ${
                      stats.lastSync.status === 'success'
                        ? 'text-green-600'
                        : stats.lastSync.status === 'error'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {stats.lastSync.status === 'success'
                      ? 'Exitosa'
                      : stats.lastSync.status === 'error'
                      ? 'Error'
                      : 'Parcial'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Items procesados:</span>
                  <span className="text-sm font-medium">
                    {stats.lastSync.itemsSuccess} / {stats.lastSync.itemsProcessed}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
