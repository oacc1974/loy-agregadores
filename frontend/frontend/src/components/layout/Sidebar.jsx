import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  FileText, 
  Settings,
  User
} from 'lucide-react';
import { cn } from '../../utils/cn';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Package, label: 'Agregadores', path: '/aggregators' },
  { icon: ShoppingBag, label: 'Órdenes', path: '/orders' },
  { icon: FileText, label: 'Logs', path: '/logs' },
  { icon: User, label: 'Perfil', path: '/profile' },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 border-r bg-white">
      <div className="flex h-full flex-col">
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
