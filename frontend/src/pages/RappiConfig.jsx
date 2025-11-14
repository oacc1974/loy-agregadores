import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, TestTube } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import rappiService from '../services/rappi.service';

const RappiConfig = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [config, setConfig] = useState({
    storeId: '',
    apiKey: '',
    secretKey: '',
    settings: {
      autoSync: false,
      syncInterval: 5,
      syncOrders: true,
      syncMenu: false,
      syncInventory: false,
    },
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await rappiService.getConfig();
      if (response.data) {
        setConfig({
          storeId: response.data.credentials.storeId,
          apiKey: response.data.credentials.apiKey,
          secretKey: '', // No mostrar el secret
          settings: response.data.settings,
        });
      }
    } catch (error) {
      console.log('No hay configuración previa');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await rappiService.configure(config);
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error guardando configuración:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const response = await rappiService.testConnection();
      if (response.success) {
        alert('✅ Conexión exitosa con Rappi');
      } else {
        alert('❌ Error: ' + response.message);
      }
    } catch (error) {
      console.error('Error probando conexión:', error);
      alert('❌ Error al probar la conexión');
    } finally {
      setTesting(false);
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
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/aggregators')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Configuración de Rappi</h1>
        </div>

        {/* Credenciales */}
        <Card>
          <CardHeader>
            <CardTitle>Credenciales de API</CardTitle>
            <CardDescription>
              Configura las credenciales de tu cuenta de Rappi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Store ID</label>
              <Input
                value={config.storeId}
                onChange={(e) => setConfig({ ...config, storeId: e.target.value })}
                placeholder="ID de tu tienda en Rappi"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">API Key</label>
              <Input
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="API Key de Rappi"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Secret Key</label>
              <Input
                type="password"
                value={config.secretKey}
                onChange={(e) => setConfig({ ...config, secretKey: e.target.value })}
                placeholder="Secret Key de Rappi"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Deja en blanco para mantener el valor actual
              </p>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleTestConnection} disabled={testing} variant="outline">
                <TestTube className="mr-2 h-4 w-4" />
                {testing ? 'Probando...' : 'Probar Conexión'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Sincronización */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Sincronización</CardTitle>
            <CardDescription>
              Configura cómo y cuándo sincronizar datos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Sincronización Automática</label>
                <p className="text-xs text-muted-foreground">
                  Sincronizar automáticamente en intervalos
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.settings.autoSync}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    settings: { ...config.settings, autoSync: e.target.checked },
                  })
                }
                className="h-4 w-4"
              />
            </div>

            {config.settings.autoSync && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Intervalo de Sincronización (minutos)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={config.settings.syncInterval}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      settings: {
                        ...config.settings,
                        syncInterval: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Sincronizar Órdenes</label>
                <input
                  type="checkbox"
                  checked={config.settings.syncOrders}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      settings: { ...config.settings, syncOrders: e.target.checked },
                    })
                  }
                  className="h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Sincronizar Menú</label>
                <input
                  type="checkbox"
                  checked={config.settings.syncMenu}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      settings: { ...config.settings, syncMenu: e.target.checked },
                    })
                  }
                  className="h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Sincronizar Inventario</label>
                <input
                  type="checkbox"
                  checked={config.settings.syncInventory}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      settings: { ...config.settings, syncInventory: e.target.checked },
                    })
                  }
                  className="h-4 w-4"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => navigate('/aggregators')}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default RappiConfig;
