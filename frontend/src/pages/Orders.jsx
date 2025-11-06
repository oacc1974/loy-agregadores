import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import syncService from '../services/sync.service';
import { ORDER_STATUS_LABELS } from '../utils/constants';

const Orders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await syncService.getOrders(params);
      setOrders(response.data);
    } catch (error) {
      console.error('Error cargando órdenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (orderId) => {
    try {
      await syncService.retryOrder(orderId);
      await loadOrders();
      alert('Orden reenviada para sincronización');
    } catch (error) {
      console.error('Error reintentando orden:', error);
      alert('Error al reintentar la orden');
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'synced':
        return 'success';
      case 'pending':
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
          <h1 className="text-3xl font-bold">Órdenes</h1>
          <Button onClick={loadOrders}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Todas
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pendientes
          </Button>
          <Button
            variant={filter === 'synced' ? 'default' : 'outline'}
            onClick={() => setFilter('synced')}
          >
            Sincronizadas
          </Button>
          <Button
            variant={filter === 'error' ? 'default' : 'outline'}
            onClick={() => setFilter('error')}
          >
            Con Error
          </Button>
        </div>

        {/* Lista de órdenes */}
        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No hay órdenes para mostrar</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold">
                          Orden #{order.orderData.orderNumber}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {order.aggregatorType.toUpperCase()}
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Cliente:</span>{' '}
                          {order.orderData.customer.name}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total:</span> $
                          {order.orderData.total.toFixed(2)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fecha:</span>{' '}
                          {new Date(order.orderData.orderTime).toLocaleString('es-ES')}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Items:</span>{' '}
                          {order.orderData.items.length}
                        </div>
                      </div>

                      {order.status === 'synced' && order.loyverseReceiptId && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">Recibo Loyverse:</span>{' '}
                          <span className="font-medium">{order.loyverseReceiptId}</span>
                        </div>
                      )}

                      {order.status === 'error' && order.errorMessage && (
                        <div className="mt-2 rounded-md bg-red-50 p-3 text-sm text-red-800">
                          <strong>Error:</strong> {order.errorMessage}
                        </div>
                      )}
                    </div>

                    {order.status === 'error' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRetry(order._id)}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reintentar
                      </Button>
                    )}
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

export default Orders;
