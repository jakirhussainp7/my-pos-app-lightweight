import { Routes, Route } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Dashboard } from './Dashboard'
import { TableManagement } from '../order/TableManagement'
import { NewOrderFlow } from '../order/NewOrderFlow'
import { OpenTickets } from '../order/OpenTickets'
import { Reservations } from '../Reservations'
import { CustomerManagement } from '../CustomerManagement'
import { Reports } from '../reports/Reports'
import { BackOffice } from '../admin/BackOffice'
import { Settings } from '../Settings'
import { useIdle } from '../../hooks/useIdle'
import { useAuth } from '../../contexts/AuthContext'

export const MainApp = () => {
  const { isIdle } = useIdle(90000) // 90 seconds
  const { logout } = useAuth()

  // Auto-logout on idle
  if (isIdle) {
    logout()
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tables" element={<TableManagement />} />
          <Route path="/new-order" element={<NewOrderFlow />} />
          <Route path="/open-tickets" element={<OpenTickets />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/backoffice" element={<BackOffice />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}