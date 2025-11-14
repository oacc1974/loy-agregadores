import { useState, useEffect } from 'react';
import { Save, TestTube, CheckCircle, XCircle, Loader } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../services/api';

const LoyverseConfig = () => {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [config, setConfig] = useState({
    accessToken: '',
    storeId: '',
    posId: '',
    defaultTaxRate: 0,
    defaultPaymentType: 'CASH',
    employeeId: ''
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await api.get('/loyverse/config');
      if (response.data.data) {
        setConfig(response.data.data);
      }
    } catch (error) {
      // Si no existe configuración (404), no es un error, solo no hay config aún
      if (error.response?.status !== 404) {
        console.error('Error cargando configuración:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const response = await api.post('/loyverse/test-connection', {
        accessToken: config.accessToken,
        storeId: config.storeId
      });
      setTestResult({
        success: true,
        message: response.data.message,
        data: response.data.data
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        accessToken: config.accessToken,
        storeId: config.storeId,
        posId: config.posId,
        settings: {
          defaultTaxRate: parseFloat(config.defaultTaxRate) || 0,
          defaultPaymentType: config.defaultPaymentType,
          employeeId: config.employeeId
        }
      };
      await api.post('/loyverse/configure', payload);
      alert('✅ Configuración guardada exitosamente');
      await loadConfig(); // Recargar configuración
    } catch (error) {
      alert('❌ Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración de Loyverse</h1>
          <p className="text-muted-foreground mt-2">
            Configura tu conexión con Loyverse POS
          </p>
        </div>

        {/* Instrucciones */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">📚 Cómo Obtener tus Credenciales</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p><strong>1. Access Token:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Ve a: <a href="https://r.loyverse.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Loyverse Dashboard</a></li>
              <li>Click en tu nombre → <strong>Account Settings</strong></li>
              <li>Ve a <strong>API Tokens</strong></li>
              <li>Click en <strong>Create Token</strong></li>
              <li>Copia el token generado</li>
            </ul>
            <p className="mt-3"><strong>2. Store ID:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>En el Dashboard, ve a <strong>Stores</strong></li>
              <li>Copia el ID de tu tienda (aparece en la URL o en los detalles)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle>Credenciales de API</CardTitle>
            <CardDescription>
              Ingresa tus credenciales de Loyverse para conectar tu POS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Access Token <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                name="accessToken"
                value={config.accessToken}
                onChange={handleChange}
                placeholder="Tu Access Token de Loyverse"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Store ID <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="storeId"
                value={config.storeId}
                onChange={handleChange}
                placeholder="ID de tu tienda en Loyverse"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                POS ID (Opcional)
              </label>
              <Input
                type="text"
                name="posId"
                value={config.posId}
                onChange={handleChange}
                placeholder="ID del punto de venta específico"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración Adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Ventas</CardTitle>
            <CardDescription>
              Configuración por defecto para las ventas sincronizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tasa de Impuesto (%)
              </label>
              <Input
                type="number"
                name="defaultTaxRate"
                value={config.defaultTaxRate}
                onChange={handleChange}
                placeholder="0"
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo de Pago por Defecto
              </label>
              <select
                name="defaultPaymentType"
                value={config.defaultPaymentType}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="CASH">Efectivo</option>
                <option value="CARD">Tarjeta</option>
                <option value="ONLINE">Online</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Employee ID (Opcional)
              </label>
              <Input
                type="text"
                name="employeeId"
                value={config.employeeId}
                onChange={handleChange}
                placeholder="ID del empleado que registra las ventas"
              />
            </div>
          </CardContent>
        </Card>

        {/* Resultado de Prueba */}
        {testResult && (
          <Card className={testResult.success ? 'border-green-500' : 'border-red-500'}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                {testResult.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
                    {testResult.message}
                  </p>
                  {testResult.data && (
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones */}
        <div className="flex gap-4">
          <Button
            onClick={handleTestConnection}
            disabled={testing || !config.accessToken || !config.storeId}
            variant="outline"
            className="flex-1"
          >
            <TestTube className="mr-2 h-4 w-4" />
            {testing ? 'Probando...' : 'Probar Conexión'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !config.accessToken || !config.storeId}
            className="flex-1"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default LoyverseConfig;
