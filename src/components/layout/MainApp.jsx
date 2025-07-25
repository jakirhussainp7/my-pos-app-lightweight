import { Routes, Route } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Dashboard } from './Dashboard'
import { TableManagement } from '../order/TableManagement'
import { NewOrderFlow } from '../order/NewOrderFlow'
import { OpenTickets } from '../order/OpenTickets'
import { PaymentScreen } from '../order/PaymentScreen'
import { TicketLookup } from '../order/TicketLookup'
import { Reservations } from '../Reservations'
import { CustomerManagement } from '../CustomerManagement'
import { Reports } from '../reports/Reports'
import { SettledTicketsReport } from '../reports/SettledTicketsReport'
import { BackOffice } from '../admin/BackOffice'
import { Settings } from '../Settings'
import { useIdle } from '../../hooks/useIdle'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect } from 'react'
import { MenuManagement } from '../MenuManagement'
import { ReceiptSettings } from '../ReceiptSettings'

export const MainApp = () => {
  const { isIdle } = useIdle(90000) // 90 seconds
  const { logout } = useAuth()

  // Auto-logout on idle (fix: use useEffect)
  useEffect(() => {
    if (isIdle) {
      logout()
    }
  }, [isIdle, logout])

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tables" element={<TableManagement />} />
          <Route path="/menu" element={<MenuManagement />} />
          <Route path="/receipt-settings" element={<ReceiptSettings />} />
          <Route path="/new-order" element={<NewOrderFlow />} />
          <Route path="/open-tickets" element={<OpenTickets />} />
          <Route path="/payment" element={<PaymentScreen />} />
          <Route path="/ticket-lookup" element={<TicketLookup />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/settled-tickets" element={<SettledTicketsReport />} />
          <Route path="/backoffice" element={<BackOffice />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}