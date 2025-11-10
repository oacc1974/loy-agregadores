import { useAuth } from '../hooks/useAuth';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const Profile = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Perfil</h1>

        <Card>
          <CardHeader>
            <CardTitle>Información de Usuario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <img
                src={user?.picture || '/default-avatar.png'}
                alt={user?.name}
                className="h-20 w-20 rounded-full"
              />
              <div>
                <h2 className="text-xl font-semibold">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    ID de Usuario
                  </label>
                  <p className="mt-1">{user?._id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Rol</label>
                  <p className="mt-1 capitalize">{user?.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Fecha de Registro
                  </label>
                  <p className="mt-1">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('es-ES')
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
