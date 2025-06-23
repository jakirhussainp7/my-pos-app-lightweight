import { useState, useEffect } from 'react'
import { ticketService } from '../../services/ticketService'

export const OpenTickets = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    try {
      setLoading(true)
      const data = await ticketService.getAllOrdersWithTickets({
        status: ['pending', 'preparing', 'ready'].join(',')
      })
      
      // Transform data for display
      const transformedTickets = data.map(order => ({
        id: order.id,
        ticketNumber: order.ticket_number,
        table: order.tables?.table_number || 'N/A',
        orderType: order.order_type,
        items: order.order_items.map(item => ({
          name: item.menu_items.name,
          quantity: item.quantity,
          price: item.unit_price
        })),
        total: order.total_amount,
        status: order.status,
        paymentStatus: order.payment_status,
        time: new Date(order.created_at).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      }))
      
      setTickets(transformedTickets)
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTicketStatus = async (ticketNumber, newStatus) => {
    try {
      setUpdating(ticketNumber)
      await ticketService.updateOrderStatus(ticketNumber, newStatus)
      await loadTickets() // Refresh the list
    } catch (error) {
      console.error('Error updating ticket status:', error)
      alert('Error updating ticket status. Please try again.')
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-500'
      case 'preparing': return 'bg-yellow-500'
      case 'ready': return 'bg-green-500'
      case 'served': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'preparing': return 'Preparing'
      case 'ready': return 'Ready'
      case 'served': return 'Served'
      default: return status
    }
  }

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'pending': return 'preparing'
      case 'preparing': return 'ready'
      case 'ready': return 'served'
      default: return null
    }
  }

  const getNextStatusText = (currentStatus) => {
    switch (currentStatus) {
      case 'pending': return 'Start Preparing'
      case 'preparing': return 'Mark Ready'
      case 'ready': return 'Mark Served'
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Open Tickets</h1>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading tickets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Open Tickets</h1>
        <button
          onClick={loadTickets}
          className="btn-secondary"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {ticket.orderType === 'dine-in' ? `Table ${ticket.table}` : ticket.orderType.charAt(0).toUpperCase() + ticket.orderType.slice(1)}
                </h3>
                <p className="text-sm text-gray-600 font-mono">#{ticket.ticketNumber}</p>
                <p className="text-sm text-gray-600">{ticket.time}</p>
                {ticket.paymentStatus === 'paid' && (
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded mt-1">
                    Paid
                  </span>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(ticket.status)}`}>
                {getStatusText(ticket.status)}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              {ticket.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.quantity}× {item.name}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>₹{ticket.total.toFixed(2)}</span>
              </div>
              
              <div className="mt-3 space-y-2">
                {getNextStatus(ticket.status) && (
                  <button 
                    onClick={() => updateTicketStatus(ticket.ticketNumber, getNextStatus(ticket.status))}
                    disabled={updating === ticket.ticketNumber}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded disabled:opacity-50"
                  >
                    {updating === ticket.ticketNumber ? 'Updating...' : getNextStatusText(ticket.status)}
                  </button>
                )}
                
                <button 
                  onClick={() => {
                    // TODO: Implement view details modal
                    alert(`Ticket Details: ${ticket.ticketNumber}`)
                  }}
                  className="w-full btn-secondary"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {tickets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎫</div>
          <p className="text-gray-500 text-lg">No open tickets</p>
          <p className="text-gray-400 text-sm mt-2">New orders will appear here</p>
        </div>
      )}
    </div>
  )
}