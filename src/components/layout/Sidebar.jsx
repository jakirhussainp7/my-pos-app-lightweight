import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  HomeIcon, 
  TableIcon, 
  PlusIcon, 
  TicketIcon, 
  CalendarIcon, 
  UsersIcon, 
  ChartIcon, 
  SettingsIcon, 
  LogoutIcon,
  AdminIcon
} from '../common/Icons'

export const Sidebar = () => {
  const location = useLocation()
  const { logout, user } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Tables', href: '/tables', icon: TableIcon },
    { name: 'New Order', href: '/new-order', icon: PlusIcon },
    { name: 'Open Tickets', href: '/open-tickets', icon: TicketIcon },
    { name: 'Reservations', href: '/reservations', icon: CalendarIcon },
    { name: 'Customers', href: '/customers', icon: UsersIcon },
    { name: 'Reports', href: '/reports', icon: ChartIcon },
    ...(user?.role === 'manager' ? [{ name: 'Back Office', href: '/backoffice', icon: AdminIcon }] : []),
    { name: 'Settings', href: '/settings', icon: SettingsIcon }
  ]

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4">
        <h1 className="text-xl font-bold">POS System</h1>
        <p className="text-sm text-gray-300">Welcome, {user?.name}</p>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4">
        <button
          onClick={logout}
          className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
        >
          <LogoutIcon className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}