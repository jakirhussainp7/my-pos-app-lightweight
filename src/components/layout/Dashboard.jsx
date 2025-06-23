import { useState, useEffect } from 'react'
import { ticketService } from '../../services/ticketService'
import { supabase } from '../../config/supabase'

export const Dashboard = () => {
  const [stats, setStats] = useState([
    { title: 'Today\'s Sales', value: '₹0.00', color: 'bg-green-500' },
    { title: 'Open Orders', value: '0', color: 'bg-blue-500' },
    { title: 'Available Tables', value: '0', color: 'bg-yellow-500' },
    { title: 'Total Orders Today', value: '0', color: 'bg-purple-500' }
  ])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get today's date range
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

      // Fetch all orders for today
      const { data: todayOrders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          tables (table_number),
          order_items (
            *,
            menu_items (name)
          )
        `)
        .gte('created_at', startOfDay.toISOString())
        .lt('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      // Get open orders count
      const openOrders = todayOrders.filter(order => 
        ['pending', 'preparing', 'ready'].includes(order.status)
      ).length

      // Calculate today's sales (paid orders only)
      const todaysSales = todayOrders
        .filter(order => order.payment_status === 'paid')
        .reduce((total, order) => total + parseFloat(order.total_amount), 0)

      // Get available tables count
      const { data: availableTables, error: tablesError } = await supabase
        .from('tables')
        .select('*')
        .eq('status', 'available')

      if (tablesError) throw tablesError

      // Update stats
      setStats([
        { 
          title: 'Today\'s Sales', 
          value: `₹${todaysSales.toFixed(2)}`, 
          color: 'bg-green-500' 
        },
        { 
          title: 'Open Orders', 
          value: openOrders.toString(), 
          color: 'bg-blue-500' 
        },
        { 
          title: 'Available Tables', 
          value: availableTables.length.toString(), 
          color: 'bg-yellow-500' 
        },
        { 
          title: 'Total Orders Today', 
          value: todayOrders.length.toString(), 
          color: 'bg-purple-500' 
        }
      ])

      // Set recent orders (last 5)
      const formattedOrders = todayOrders.slice(0, 5).map(order => ({
        id: order.id,
        ticketNumber: order.ticket_number,
        table: order.tables?.table_number || 'N/A',
        orderType: order.order_type,
        total: order.total_amount,
        status: order.status,
        paymentStatus: order.payment_status,
        time: new Date(order.created_at).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      }))

      setRecentOrders(formattedOrders)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status, paymentStatus) => {
    if (paymentStatus === 'paid') return 'text-green-600'
    
    switch (status) {
      case 'pending': return 'text-orange-600'
      case 'preparing': return 'text-yellow-600'
      case 'ready': return 'text-blue-600'
      case 'served': return 'text-green-600'
      case 'cancelled': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusText = (status, paymentStatus) => {
    if (paymentStatus === 'paid' && status === 'served') return 'Completed'
    if (paymentStatus === 'paid') return 'Paid'
    
    switch (status) {
      case 'pending': return 'Pending'
      case 'preparing': return 'Preparing'
      case 'ready': return 'Ready'
      case 'served': return 'Served'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={loadDashboardData}
          className="btn-secondary"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className={`w-12 h-12 ${stat.color} rounded-lg mb-4`}></div>
            <h3 className="text-gray-500 text-sm">{stat.title}</h3>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">
                      {order.orderType === 'dine-in' ? `Table ${order.table}` : order.orderType}
                    </p>
                    <p className="text-sm text-gray-500 font-mono">#{order.ticketNumber}</p>
                    <p className="text-xs text-gray-400">{order.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{order.total.toFixed(2)}</p>
                    <p className={`text-sm ${getStatusColor(order.status, order.paymentStatus)}`}>
                      {getStatusText(order.status, order.paymentStatus)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No orders today</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/new-order"
              className="block w-full p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Create New Order</p>
                  <p className="text-sm text-gray-600">Start a new customer order</p>
                </div>
              </div>
            </a>

            <a
              href="/payment"
              className="block w-full p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Process Payment</p>
                  <p className="text-sm text-gray-600">Handle order payments</p>
                </div>
              </div>
            </a>

            <a
              href="/ticket-lookup"
              className="block w-full p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Ticket Lookup</p>
                  <p className="text-sm text-gray-600">Search orders by ticket number</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}