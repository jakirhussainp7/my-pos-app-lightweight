import { useState } from 'react'

export const PaymentScreen = () => {
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amountPaid, setAmountPaid] = useState('')
  
  const orderTotal = 0 // This would come from props or context
  const change = amountPaid ? Math.max(0, parseFloat(amountPaid) - orderTotal) : 0

  const handlePayment = () => {
    // Process payment logic here
    alert('Payment processed successfully!')
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Payment</h1>
      
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Order Total</h2>
          <p className="text-4xl font-bold text-green-600">₹{orderTotal.toFixed(2)}</p>
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
            />
            {change > 0 && (
              <p className="mt-2 text-lg">
                Change: <span className="font-bold text-blue-600">₹{change.toFixed(2)}</span>
              </p>
            )}
          </div>
        )}
        
        <button
          onClick={handlePayment}
          disabled={paymentMethod === 'cash' && (!amountPaid || parseFloat(amountPaid) < orderTotal)}
          className="w-full btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Process Payment
        </button>
      </div>
    </div>
  )
}