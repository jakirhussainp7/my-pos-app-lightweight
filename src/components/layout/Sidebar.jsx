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

// Add new icons for payment and search
const PaymentIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

export const Sidebar = () => {
  const location = useLocation()
  const { logout, user } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Tables', href: '/tables', icon: TableIcon },
    { name: 'New Order', href: '/new-order', icon: PlusIcon },
    { name: 'Open Tickets', href: '/open-tickets', icon: TicketIcon },
    { name: 'Payment', href: '/payment', icon: PaymentIcon },
    { name: 'Ticket Lookup', href: '/ticket-lookup', icon: SearchIcon },
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
          className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
        >
          <LogoutIcon className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}