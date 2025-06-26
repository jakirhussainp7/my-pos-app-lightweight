import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { ticketService } from '../../services/ticketService'

export const NewOrderFlow = () => {
  const [orderType, setOrderType] = useState('')
  const [selectedTable, setSelectedTable] = useState('')
  const [orderItems, setOrderItems] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    loadMenuItems()
    loadTables()
  }, [])

  const loadMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          menu_categories (
            name
          )
        `)
        .eq('active', true)

      if (error) throw error
      setMenuItems(data || [])
    } catch (error) {
      console.error('Error loading menu items:', error)
    }
  }

  const loadTables = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('status', 'available')

      if (error) throw error
      setTables(data || [])
    } catch (error) {
      console.error('Error loading tables:', error)
    }
  }

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

  const handlePlaceOrder = async () => {
    setFormError('')
    if (!orderType) {
      setFormError('Please select an order type.')
      return
    }
    if (!selectedTable) {
      setFormError('Please select a table.')
      return
    }
    if (orderItems.length === 0) {
      setFormError('Please add at least one item to the order.')
      return
    }
    setLoading(true)
    try {
      const orderData = {
        tableId: parseInt(selectedTable),
        orderType: orderType,
        totalAmount: total,
        items: orderItems.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        }))
      }
      const result = await ticketService.createOrderWithTicket(orderData)
      setOrderSuccess({
        ticketNumber: result.ticketNumber,
        orderId: result.order.id,
        total: total
      })
      setOrderItems([])
      setSelectedTable('')
      setOrderType('')
    } catch (error) {
      console.error('Error placing order:', error)
      setFormError('Error placing order. Please try again or contact admin.')
    } finally {
      setLoading(false)
    }
  }

  const startNewOrder = () => {
    setOrderSuccess(null)
    setOrderType('')
  }

  if (orderSuccess) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Order Placed Successfully!</h2>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="text-lg font-bold text-gray-800">Ticket Number</p>
              <p className="text-3xl font-bold text-blue-600">{orderSuccess.ticketNumber}</p>
            </div>
            <p className="text-gray-600 mb-2">Order ID: #{orderSuccess.orderId}</p>
            <p className="text-xl font-semibold">Total: ₹{orderSuccess.total.toFixed(2)}</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={startNewOrder}
              className="w-full btn-primary"
            >
              Create New Order
            </button>
            <button
              onClick={() => window.print()}
              className="w-full btn-secondary"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!orderType) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">New Order</h1>
        <h2 className="text-xl font-semibold mb-4">Select Order Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-xl mx-auto">
          {[
            { type: 'dine-in', label: 'Dine-in', icon: '🍽️' },
            { type: 'takeaway', label: 'Takeaway', icon: '🥡' },
            { type: 'delivery', label: 'Delivery', icon: '🚚' }
          ].map(opt => (
            <button
              key={opt.type}
              onClick={() => setOrderType(opt.type)}
              className="bg-white rounded-lg shadow p-8 flex flex-col items-center justify-center text-xl font-semibold border-2 border-transparent hover:border-blue-500 transition"
            >
              <div className="text-4xl mb-2">{opt.icon}</div>
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
      {formError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{formError}</div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Menu Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Menu</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.menu_categories?.name}</p>
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
          
          {orderType === 'dine-in' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Table</label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select Table</option>
                {tables.map(table => (
                  <option key={table.id} value={table.id}>
                    Table {table.table_number} (Capacity: {table.capacity})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
            {orderItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-600">₹{item.price} each</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 bg-gray-200 rounded text-center hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 bg-gray-200 rounded text-center hover:bg-gray-300"
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
              onClick={handlePlaceOrder}
              disabled={loading || (orderType === 'dine-in' && !selectedTable) || orderItems.length === 0}
              className="w-full mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}