import { useState, useEffect } from 'react'
import { ticketService } from '../../services/ticketService'
import { thermalPrinterService } from '../../services/thermalPrinterService'

export const PaymentScreen = () => {
  const [ticketNumber, setTicketNumber] = useState('')
  const [order, setOrder] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amountPaid, setAmountPaid] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [error, setError] = useState('')
  const [settledTicketData, setSettledTicketData] = useState(null)

  const orderTotal = order?.total_amount || 0
  const change = amountPaid ? Math.max(0, parseFloat(amountPaid) - orderTotal) : 0

  const handleTicketLookup = async (e) => {
    e.preventDefault()
    if (!ticketNumber.trim()) return

    setLoading(true)
    setError('')
    setOrder(null)

    try {
      const orderData = await ticketService.getOrderByTicketNumber(ticketNumber.trim())
      
      if (orderData.payment_status === 'paid') {
        setError('This order has already been paid.')
        return
      }
      
      setOrder(orderData)
      setAmountPaid(orderData.total_amount.toString())
    } catch (error) {
      console.error('Error looking up ticket:', error)
      setError('Ticket not found. Please check the ticket number and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!order) return

    setLoading(true)
    try {
      const paymentData = {
        amount: orderTotal,
        method: paymentMethod
      }

      const result = await ticketService.processPayment(ticketNumber, paymentData)
      setSettledTicketData(result)
      setPaymentSuccess(true)
    } catch (error) {
      console.error('Error processing payment:', error)
      setError('Error processing payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateThermalReceipt = async () => {
    try {
      // Use settled ticket data if available, otherwise generate fresh
      let html
      if (settledTicketData && settledTicketData.thermalData) {
        html = settledTicketData.html || 
               thermalPrinterService.generateThermalHTML(settledTicketData.receiptData, settledTicketData.thermalData)
      } else {
        const thermalReceipt = await ticketService.generateThermalReceipt(ticketNumber)
        html = thermalReceipt.html
      }
      
      const receiptWindow = window.open('', '_blank')
      receiptWindow.document.write(html)
      receiptWindow.document.close()
      
      // Automatically trigger print dialog
      receiptWindow.focus()
      setTimeout(() => {
        receiptWindow.print()
      }, 500)
    } catch (error) {
      console.error('Error generating thermal receipt:', error)
      alert('Error generating thermal receipt. Please try again.')
    }
  }

  const generateRegularReceipt = async () => {
    try {
      const receipt = await ticketService.generateReceipt(ticketNumber)
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
            <p>Payment Method: ${paymentMethod.toUpperCase()}</p>
            <p>Status: PAID</p>
            <p>Thank you for your order!</p>
          </div>
        </body>
      </html>
    `
  }

  const startNewPayment = () => {
    setTicketNumber('')
    setOrder(null)
    setPaymentMethod('cash')
    setAmountPaid('')
    setPaymentSuccess(false)
    setError('')
    setSettledTicketData(null)
  }

  if (paymentSuccess) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="text-lg font-bold text-gray-800">Ticket Number</p>
              <p className="text-2xl font-bold text-blue-600">{ticketNumber}</p>
            </div>
            <p className="text-xl font-semibold">Amount Paid: ₹{orderTotal.toFixed(2)}</p>
            <p className="text-lg">Method: {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}</p>
            {paymentMethod === 'cash' && change > 0 && (
              <p className="text-lg font-semibold text-blue-600 mt-2">
                Change: ₹{change.toFixed(2)}
              </p>
            )}
          </div>
          <div className="space-y-3">
            <button
              onClick={generateThermalReceipt}
              className="w-full btn-primary text-lg py-3"
            >
              🖨️ Print Thermal Receipt (80mm)
            </button>
            <button
              onClick={generateRegularReceipt}
              className="w-full btn-secondary"
            >
              📄 Print Regular Receipt
            </button>
            <button
              onClick={startNewPayment}
              className="w-full btn-secondary"
            >
              💳 New Payment
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Payment Processing</h1>
      
      <div className="max-w-md mx-auto space-y-6">
        {/* Ticket Lookup */}
        {!order && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Enter Ticket Number</h2>
            <form onSubmit={handleTicketLookup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ticket Number
                </label>
                <input
                  type="text"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  placeholder="e.g., TKT0001"
                  className="w-full p-3 border border-gray-300 rounded text-lg font-mono"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !ticketNumber.trim()}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Looking up...' : 'Lookup Order'}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Order Summary & Payment */}
        {order && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Order Summary</h2>
              <div className="bg-gray-100 rounded p-3 mb-4">
                <p className="font-mono font-bold text-lg">{order.ticket_number}</p>
                <p className="text-sm text-gray-600">
                  {order.order_type} • {order.tables ? `Table ${order.tables.table_number}` : 'No table'}
                </p>
              </div>

              <div className="space-y-2 mb-4">
                {order.order_items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.quantity}× {item.menu_items.name}</span>
                    <span>₹{item.total_price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="text-center border-t pt-4">
                <h3 className="text-2xl font-bold">Order Total</h3>
                <p className="text-4xl font-bold text-green-600">₹{orderTotal.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Payment Method</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  Cash
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  Credit/Debit Card
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="mobile"
                    checked={paymentMethod === 'mobile'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  Mobile Payment
                </label>
              </div>
            </div>
            
            {paymentMethod === 'cash' && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Amount Paid</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded text-lg"
                  placeholder="0.00"
                  step="0.01"
                  min={orderTotal}
                />
                {change > 0 && (
                  <p className="mt-2 text-lg">
                    Change: <span className="font-bold text-blue-600">₹{change.toFixed(2)}</span>
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handlePayment}
                disabled={loading || (paymentMethod === 'cash' && (!amountPaid || parseFloat(amountPaid) < orderTotal))}
                className="w-full btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Process Payment'}
              </button>
              
              <button
                onClick={() => setOrder(null)}
                className="w-full btn-secondary"
              >
                Change Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}