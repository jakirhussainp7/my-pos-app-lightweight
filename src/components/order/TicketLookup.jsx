import { useState } from 'react'
import { ticketService } from '../../services/ticketService'

export const TicketLookup = () => {
  const [ticketNumber, setTicketNumber] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!ticketNumber.trim()) return

    setLoading(true)
    setError('')
    setOrder(null)

    try {
      const orderData = await ticketService.getOrderByTicketNumber(ticketNumber.trim())
      setOrder(orderData)
    } catch (error) {
      console.error('Error searching for ticket:', error)
      setError('Ticket not found. Please check the ticket number and try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateReceipt = async () => {
    try {
      const receipt = await ticketService.generateReceipt(ticketNumber)
      // Open receipt in new window for printing
      const receiptWindow = window.open('', '_blank')
      receiptWindow.document.write(generateReceiptHTML(receipt))
      receiptWindow.document.close()
      receiptWindow.print()
    } catch (error) {
      console.error('Error generating receipt:', error)
      alert('Error generating receipt. Please try again.')
    }
  }

  const generateReceiptHTML = (receipt) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${receipt.ticketNumber}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              max-width: 400px; 
              margin: 0 auto; 
              padding: 20px;
              line-height: 1.4;
            }
            .header { text-align: center; margin-bottom: 20px; }
            .ticket-number { 
              font-size: 24px; 
              font-weight: bold; 
              border: 2px solid #000; 
              padding: 10px; 
              margin: 10px 0; 
            }
            .item { 
              display: flex; 
              justify-content: space-between; 
              margin: 5px 0; 
            }
            .total { 
              border-top: 2px solid #000; 
              margin-top: 10px; 
              padding-top: 10px; 
              font-weight: bold; 
              font-size: 18px;
            }
            .footer { 
              text-align: center; 
              margin-top: 20px; 
              font-size: 12px; 
            }
            @media print {
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>POS SYSTEM</h2>
            <div class="ticket-number">TICKET: ${receipt.ticketNumber}</div>
            <p>Order Type: ${receipt.orderType.toUpperCase()}</p>
            ${receipt.table !== 'N/A' ? `<p>Table: ${receipt.table}</p>` : ''}
            <p>Date: ${new Date(receipt.createdAt).toLocaleDateString()}</p>
            <p>Time: ${new Date(receipt.createdAt).toLocaleTimeString()}</p>
          </div>
          
          <div class="items">
            <div style="border-bottom: 1px solid #000; margin-bottom: 10px; padding-bottom: 5px;">
              <strong>ITEMS:</strong>
            </div>
            ${receipt.items.map(item => `
              <div class="item">
                <span>${item.quantity}x ${item.name}</span>
                <span>₹${item.totalPrice.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="total">
            <div style="display: flex; justify-content: space-between;">
              <span>TOTAL:</span>
              <span>₹${receipt.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Status: ${receipt.status.toUpperCase()}</p>
            <p>Payment: ${receipt.paymentStatus.toUpperCase()}</p>
            <p>Thank you for your order!</p>
          </div>
        </body>
      </html>
    `
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-100'
      case 'preparing': return 'text-yellow-600 bg-yellow-100'
      case 'ready': return 'text-green-600 bg-green-100'
      case 'served': return 'text-blue-600 bg-blue-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-100'
      case 'paid': return 'text-green-600 bg-green-100'
      case 'refunded': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Ticket Lookup</h1>
      
      <div className="max-w-2xl mx-auto">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter Ticket Number
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  placeholder="e.g., TKT0001"
                  className="flex-1 p-3 border border-gray-300 rounded text-lg font-mono"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !ticketNumber.trim()}
                  className="px-6 py-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">Order Details</h2>
                <p className="text-3xl font-mono font-bold text-blue-600 mt-2">
                  {order.ticket_number}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.toUpperCase()}
                </span>
                <div className="mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                    {order.payment_status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Order Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Order ID:</span> #{order.id}</p>
                  <p><span className="font-medium">Type:</span> {order.order_type}</p>
                  {order.tables && (
                    <p><span className="font-medium">Table:</span> {order.tables.table_number}</p>
                  )}
                  <p><span className="font-medium">Created:</span> {new Date(order.created_at).toLocaleString()}</p>
                  <p><span className="font-medium">Updated:</span> {new Date(order.updated_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Payment Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Status:</span> {order.payment_status}</p>
                  <p><span className="font-medium">Total Amount:</span> ₹{order.total_amount.toFixed(2)}</p>
                  {order.payments && order.payments.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Payments:</p>
                      {order.payments.map((payment, index) => (
                        <p key={index} className="ml-2">
                          ₹{payment.amount.toFixed(2)} via {payment.payment_method}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Order Items</h3>
              <div className="space-y-2">
                {order.order_items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{item.menu_items.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × ₹{item.unit_price.toFixed(2)}
                      </p>
                      {item.notes && (
                        <p className="text-sm text-gray-500 italic">Note: {item.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{item.total_price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span>₹{order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={generateReceipt}
                className="btn-primary"
              >
                Print Receipt
              </button>
              <button
                onClick={() => {
                  setOrder(null)
                  setTicketNumber('')
                  setError('')
                }}
                className="btn-secondary"
              >
                New Search
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}