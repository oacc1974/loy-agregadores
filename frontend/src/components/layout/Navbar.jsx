import { Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary">Loy-Agregadores</div>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img
                src={user?.picture || '/default-avatar.png'}
                alt={user?.name}
                className="h-8 w-8 rounded-full"
              />
              <span className="text-sm font-medium">{user?.name}</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
