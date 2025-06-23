import { useState } from 'react'

export const NewOrderFlow = () => {
  const [orderType, setOrderType] = useState('')
  const [selectedTable, setSelectedTable] = useState('')
  const [orderItems, setOrderItems] = useState([])
  const [menuItems] = useState([])

  const addToOrder = (item) => {
    const existingItem = orderItems.find(orderItem => orderItem.id === item.id)
    if (existingItem) {
      setOrderItems(orderItems.map(orderItem =>
        orderItem.id === item.id
          ? { ...orderItem, quantity: orderItem.quantity + 1 }
          : orderItem
      ))
    } else {
      setOrderItems([...orderItems, { ...item, quantity: 1 }])
    }
  }

  const removeFromOrder = (itemId) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId, quantity) => {
    if (quantity === 0) {
      removeFromOrder(itemId)
    } else {
      setOrderItems(orderItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ))
    }
  }

  const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  if (!orderType) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">New Order</h1>
        <h2 className="text-xl font-semibold mb-4">Select Order Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-xl mx-auto">
          {[
            { type: 'dine-in', label: 'Dine-in' },
            { type: 'takeaway', label: 'Takeaway' },
            { type: 'delivery', label: 'Delivery' }
          ].map(opt => (
            <button
              key={opt.type}
              onClick={() => setOrderType(opt.type)}
              className="bg-white rounded-lg shadow p-8 flex flex-col items-center justify-center text-xl font-semibold border-2 border-transparent hover:border-blue-500 transition"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">New Order</h1>
      <div className="mb-4">
        <span className="inline-block px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold text-sm">
          Order Type: {orderType.charAt(0).toUpperCase() + orderType.slice(1)}
        </span>
        <button
          className="ml-4 text-blue-500 underline text-sm"
          onClick={() => setOrderType('')}
        >
          Change
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Menu Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Menu</h2>
          <div className="space-y-3">
            {menuItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.category}</p>
                  <p className="font-bold text-green-600">₹{item.price}</p>
                </div>
                <button
                  onClick={() => addToOrder(item)}
                  className="btn-primary"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Table</label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select Table</option>
              <option value="1">Table 1</option>
              <option value="2">Table 2</option>
              <option value="3">Table 3</option>
            </select>
          </div>
          <div className="space-y-3 mb-6">
            {orderItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-600">₹{item.price} each</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 bg-gray-200 rounded text-center"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 bg-gray-200 rounded text-center"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromOrder(item.id)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <button
              disabled={!selectedTable || orderItems.length === 0}
              className="w-full mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}