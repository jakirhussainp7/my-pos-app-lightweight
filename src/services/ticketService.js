import { supabase } from '../config/supabase'

export const ticketService = {
  // Generate a new ticket number
  async generateTicketNumber() {
    try {
      const { data, error } = await supabase.rpc('generate_ticket_number')
      
      if (error) {
        console.error('Error generating ticket number:', error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Error in generateTicketNumber:', error)
      throw error
    }
  },

  // Create a new order with ticket number
  async createOrderWithTicket(orderData) {
    try {
      // Generate ticket number
      const ticketNumber = await this.generateTicketNumber()
      
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          ticket_number: ticketNumber,
          table_id: orderData.tableId,
          order_type: orderData.orderType || 'dine-in',
          total_amount: orderData.totalAmount,
          status: 'pending',
          payment_status: 'pending'
        }])
        .select()
        .single()
      
      if (orderError) {
        console.error('Error creating order:', orderError)
        throw orderError
      }

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        notes: item.notes || null
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Error creating order items:', itemsError)
        throw itemsError
      }

      return {
        order,
        ticketNumber,
        items: orderItems
      }
    } catch (error) {
      console.error('Error in createOrderWithTicket:', error)
      throw error
    }
  },

  // Get order by ticket number
  async getOrderByTicketNumber(ticketNumber) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          tables (
            table_number,
            capacity
          ),
          order_items (
            *,
            menu_items (
              name,
              price
            )
          ),
          payments (
            *
          )
        `)
        .eq('ticket_number', ticketNumber)
        .single()

      if (error) {
        console.error('Error fetching order by ticket number:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in getOrderByTicketNumber:', error)
      throw error
    }
  },

  // Get all orders with ticket numbers
  async getAllOrdersWithTickets(filters = {}) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          tables (
            table_number,
            capacity
          ),
          order_items (
            *,
            menu_items (
              name,
              price
            )
          )
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      
      if (filters.orderType) {
        query = query.eq('order_type', filters.orderType)
      }
      
      if (filters.paymentStatus) {
        query = query.eq('payment_status', filters.paymentStatus)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching orders:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in getAllOrdersWithTickets:', error)
      throw error
    }
  },

  // Update order status
  async updateOrderStatus(ticketNumber, status) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('ticket_number', ticketNumber)
        .select()
        .single()

      if (error) {
        console.error('Error updating order status:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updateOrderStatus:', error)
      throw error
    }
  },

  // Process payment for an order
  async processPayment(ticketNumber, paymentData) {
    try {
      // Get the order first
      const order = await this.getOrderByTicketNumber(ticketNumber)
      
      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert([{
          order_id: order.id,
          amount: paymentData.amount,
          payment_method: paymentData.method,
          status: 'completed'
        }])
        .select()
        .single()

      if (paymentError) {
        console.error('Error creating payment:', paymentError)
        throw paymentError
      }

      // Update order payment status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('ticket_number', ticketNumber)

      if (updateError) {
        console.error('Error updating order payment status:', updateError)
        throw updateError
      }

      return payment
    } catch (error) {
      console.error('Error in processPayment:', error)
      throw error
    }
  },

  // Generate receipt data
  async generateReceipt(ticketNumber) {
    try {
      const order = await this.getOrderByTicketNumber(ticketNumber)
      
      const receipt = {
        ticketNumber: order.ticket_number,
        orderId: order.id,
        orderType: order.order_type,
        table: order.tables?.table_number || 'N/A',
        status: order.status,
        paymentStatus: order.payment_status,
        items: order.order_items.map(item => ({
          name: item.menu_items.name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          notes: item.notes
        })),
        subtotal: order.total_amount,
        total: order.total_amount,
        createdAt: order.created_at,
        payments: order.payments || []
      }

      return receipt
    } catch (error) {
      console.error('Error in generateReceipt:', error)
      throw error
    }
  }
}