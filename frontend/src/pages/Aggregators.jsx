import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Settings, Trash2, Power, Package } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import aggregatorService from '../services/aggregator.service';
import { AGGREGATOR_NAMES, AGGREGATOR_COLORS } from '../utils/constants';

const Aggregators = () => {
  const [loading, setLoading] = useState(true);
  const [aggregators, setAggregators] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadAggregators();
  }, []);

  const loadAggregators = async () => {
    try {
      const response = await aggregatorService.getAll();
      setAggregators(response.data);
    } catch (error) {
      console.error('Error cargando agregadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAggregator = async (type) => {
    try {
      await aggregatorService.add({
        aggregatorType: type,
        name: AGGREGATOR_NAMES[type],
      });
      await loadAggregators();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error agregando agregador:', error);
      alert('Error al agregar agregador');
    }
  };

  const handleToggle = async (id) => {
    try {
      await aggregatorService.toggle(id);
      await loadAggregators();
    } catch (error) {
      console.error('Error cambiando estado:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este agregador?')) return;

    try {
      await aggregatorService.delete(id);
      await loadAggregators();
    } catch (error) {
      console.error('Error eliminando agregador:', error);
    }
  };

  const handleConfigure = (aggregator) => {
    if (aggregator.aggregatorType === 'uber') {
      navigate('/aggregators/uber');
    } else if (aggregator.aggregatorType === 'rappi') {
      navigate('/aggregators/rappi');
    } else if (aggregator.aggregatorType === 'pedidosya') {
      navigate('/aggregators/pedidosya');
    }
  };

  const availableAggregators = ['uber', 'rappi', 'pedidosya'].filter(
    (type) => !aggregators.find((a) => a.aggregatorType === type)
  );

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
          <h1 className="text-3xl font-bold">Agregadores</h1>
          {availableAggregators.length > 0 && (
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Agregador
            </Button>
          )}
        </div>

        {aggregators.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No hay agregadores configurados</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Comienza agregando tu primer agregador de delivery
              </p>
              <Button onClick={() => setShowAddModal(true)} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Agregador
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {aggregators.map((aggregator) => (
              <Card key={aggregator._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{aggregator.name}</CardTitle>
                    <Badge variant={aggregator.isActive ? 'success' : 'secondary'}>
                      {aggregator.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div
                      className={`flex h-20 items-center justify-center rounded-lg ${
                        AGGREGATOR_COLORS[aggregator.aggregatorType]
                      } text-white`}
                    >
                      <span className="text-2xl font-bold">
                        {AGGREGATOR_NAMES[aggregator.aggregatorType]}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleConfigure(aggregator)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Configurar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(aggregator._id)}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(aggregator._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Agregar Agregador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableAggregators.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleAddAggregator(type)}
                      className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-accent"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{AGGREGATOR_NAMES[type]}</span>
                        <Plus className="h-5 w-5" />
                      </div>
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancelar
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Aggregators;
