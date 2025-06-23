import { useState } from 'react'

export const OpenTickets = () => {
  const [tickets] = useState([])

  const getStatusColor = (status) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-500'
      case 'ready': return 'bg-green-500'
      case 'served': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Open Tickets</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Table {ticket.table}</h3>
                <p className="text-sm text-gray-600">Order #{ticket.id}</p>
                <p className="text-sm text-gray-600">{ticket.time}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(ticket.status)}`}>
                {ticket.status}
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
                {ticket.status === 'preparing' && (
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">
                    Mark Ready
                  </button>
                )}
                {ticket.status === 'ready' && (
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
                    Mark Served
                  </button>
                )}
                <button className="w-full btn-secondary">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {tickets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No open tickets</p>
        </div>
      )}
    </div>
  )
}