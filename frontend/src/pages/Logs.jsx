import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import syncService from '../services/sync.service';
import { SYNC_STATUS_LABELS } from '../utils/constants';

const Logs = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const response = await syncService.getLogs({ limit: 50 });
      setLogs(response.data);
    } catch (error) {
      console.error('Error cargando logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'partial':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'secondary';
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Logs de Sincronización</h1>
          <Button onClick={loadLogs}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>

        {logs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No hay logs para mostrar</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <Card key={log._id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Badge variant={getStatusBadgeVariant(log.status)}>
                          {SYNC_STATUS_LABELS[log.status]}
                        </Badge>
                        <span className="text-sm font-medium">
                          {log.syncType.toUpperCase()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {log.aggregatorType.toUpperCase()}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Procesados:</span>{' '}
                          <span className="font-medium">{log.itemsProcessed}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Exitosos:</span>{' '}
                          <span className="font-medium text-green-600">
                            {log.itemsSuccess}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fallidos:</span>{' '}
                          <span className="font-medium text-red-600">{log.itemsFailed}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duración:</span>{' '}
                          <span className="font-medium">
                            {(log.details.duration / 1000).toFixed(2)}s
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString('es-ES')}
                      </div>

                      {log.details.errors && log.details.errors.length > 0 && (
                        <div className="mt-3 rounded-md bg-red-50 p-3">
                          <p className="text-sm font-medium text-red-800">Errores:</p>
                          <ul className="mt-2 space-y-1 text-sm text-red-700">
                            {log.details.errors.map((error, index) => (
                              <li key={index}>
                                • {error.itemId}: {error.error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Logs;
