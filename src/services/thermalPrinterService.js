import { supabase } from '../config/supabase'

export const thermalPrinterService = {
  // Thermal printer constants for 80mm receipts
  PRINTER_WIDTH: 48, // Characters per line for 80mm thermal printers
  RECEIPT_WIDTH: 42, // Content width (leaving margin)
  
  /**
   * Format text for thermal printer with proper alignment
   */
  formatLine(left, right = '', width = this.RECEIPT_WIDTH) {
    if (!right) return left.padEnd(width).substring(0, width)
    
    const totalLength = left.length + right.length
    if (totalLength <= width) {
      const spaces = width - totalLength
      return left + ' '.repeat(spaces) + right
    }
    
    // If too long, truncate left text
    const maxLeft = width - right.length - 1
    return left.substring(0, maxLeft) + ' ' + right
  },

  /**
   * Center text within the specified width
   */
  centerText(text, width = this.RECEIPT_WIDTH) {
    if (text.length >= width) return text.substring(0, width)
    const spaces = Math.floor((width - text.length) / 2)
    return ' '.repeat(spaces) + text + ' '.repeat(width - spaces - text.length)
  },

  /**
   * Create a separator line
   */
  separator(char = '-', width = this.RECEIPT_WIDTH) {
    return char.repeat(width)
  },

  /**
   * Generate thermal receipt data optimized for 80mm printers
   */
  async generateThermalReceiptData(ticketNumber, receiptData) {
    try {
      const lines = []
      
      // Header
      lines.push('')
      lines.push(this.centerText('═══ RESTAURANT POS ═══'))
      lines.push(this.centerText('123 Restaurant Street'))
      lines.push(this.centerText('City, State 12345'))
      lines.push(this.centerText('Tel: (555) 123-4567'))
      lines.push('')
      lines.push(this.separator('='))
      lines.push('')
      
      // Ticket info
      lines.push(this.centerText(`TICKET: ${ticketNumber}`))
      lines.push('')
      lines.push(this.formatLine('Order Type:', receiptData.orderType.toUpperCase()))
      if (receiptData.table && receiptData.table !== 'N/A') {
        lines.push(this.formatLine('Table:', receiptData.table.toString()))
      }
      lines.push(this.formatLine('Date:', new Date(receiptData.createdAt).toLocaleDateString()))
      lines.push(this.formatLine('Time:', new Date(receiptData.createdAt).toLocaleTimeString()))
      lines.push('')
      lines.push(this.separator('-'))
      lines.push('')
      
      // Items header
      lines.push('QTY ITEM                     TOTAL')
      lines.push(this.separator('-'))
      
      // Items
      receiptData.items.forEach(item => {
        const qty = item.quantity.toString()
        const name = item.name.length > 20 ? item.name.substring(0, 17) + '...' : item.name
        const total = `₹${item.totalPrice.toFixed(2)}`
        
        lines.push(this.formatLine(`${qty}x  ${name}`, total))
        
        if (item.notes) {
          lines.push(`     Note: ${item.notes}`)
        }
      })
      
      lines.push('')
      lines.push(this.separator('-'))
      
      // Totals
      lines.push(this.formatLine('SUBTOTAL:', `₹${receiptData.subtotal.toFixed(2)}`))
      lines.push('')
      lines.push(this.separator('='))
      lines.push('')
      lines.push(this.formatLine('TOTAL:', `₹${receiptData.total.toFixed(2)}`))
      lines.push('')
      lines.push(this.separator('='))
      lines.push('')
      
      // Payment info
      if (receiptData.payments && receiptData.payments.length > 0) {
        const payment = receiptData.payments[0]
        lines.push(this.formatLine('Payment:', payment.payment_method.toUpperCase()))
        lines.push(this.formatLine('Amount Paid:', `₹${payment.amount.toFixed(2)}`))
        
        if (payment.payment_method === 'cash' && payment.amount > receiptData.total) {
          const change = payment.amount - receiptData.total
          lines.push(this.formatLine('Change:', `₹${change.toFixed(2)}`))
        }
        lines.push('')
      }
      
      // Footer
      lines.push(this.centerText('THANK YOU!'))
      lines.push(this.centerText('Please visit again'))
      lines.push('')
      lines.push(this.centerText(`Served by: ${receiptData.cashier || 'POS System'}`))
      lines.push('')
      lines.push(this.separator('-'))
      lines.push('')
      
      return {
        lines,
        metadata: {
          ticketNumber,
          printTime: new Date().toISOString(),
          printerWidth: this.PRINTER_WIDTH,
          contentWidth: this.RECEIPT_WIDTH
        }
      }
    } catch (error) {
      console.error('Error generating thermal receipt data:', error)
      throw error
    }
  },

  /**
   * Generate thermal-optimized HTML for printing
   */
  generateThermalHTML(receiptData, thermalData) {
    const lines = thermalData.lines
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Thermal Receipt - ${receiptData.ticketNumber}</title>
          <meta charset="UTF-8">
          <style>
            @page {
              size: 80mm auto;
              margin: 2mm 2mm 2mm 2mm;
            }
            
            body {
              font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
              font-size: 12px;
              line-height: 1.2;
              margin: 0;
              padding: 0;
              width: 76mm;
              background: white;
              color: black;
            }
            
            .receipt-container {
              width: 100%;
              padding: 2mm;
            }
            
            .receipt-line {
              white-space: pre;
              margin: 0;
              padding: 0;
              display: block;
            }
            
            .receipt-line.bold {
              font-weight: bold;
            }
            
            .receipt-line.center {
              text-align: center;
            }
            
            .receipt-line.large {
              font-size: 14px;
              font-weight: bold;
            }
            
            .receipt-line.xl {
              font-size: 16px;
              font-weight: bold;
            }
            
            @media print {
              body {
                width: 76mm;
              }
              
              .no-print {
                display: none !important;
              }
            }
            
            .print-button {
              background: #007bff;
              color: white;
              border: none;
              padding: 10px 20px;
              font-size: 14px;
              border-radius: 4px;
              cursor: pointer;
              margin: 10px 0;
            }
            
            .print-button:hover {
              background: #0056b3;
            }
          </style>
        </head>
        <body>
          <div class="no-print">
            <button class="print-button" onclick="window.print()">🖨️ Print Receipt</button>
            <button class="print-button" onclick="window.close()" style="background: #6c757d;">✕ Close</button>
          </div>
          
          <div class="receipt-container">
            ${lines.map((line, index) => {
              let classes = 'receipt-line'
              
              // Add special styling for certain lines
              if (line.includes('═══') || line.includes('TICKET:')) {
                classes += ' bold center'
              } else if (line.includes('RESTAURANT POS')) {
                classes += ' bold center xl'
              } else if (line.includes('TOTAL:') && line.includes('₹')) {
                classes += ' bold large'
              } else if (line.includes('THANK YOU')) {
                classes += ' bold center'
              }
              
              return `<div class="${classes}">${line}</div>`
            }).join('')}
          </div>
          
          <script>
            // Auto-print when loaded (optional)
            // window.onload = () => setTimeout(() => window.print(), 500);
          </script>
        </body>
      </html>
    `
  },

  /**
   * Save settled ticket to database with thermal receipt data
   */
  async saveSettledTicket(ticketNumber, paymentMethod, receiptData, thermalData, cashierId = null) {
    try {
      const { data, error } = await supabase.rpc('settle_ticket', {
        p_ticket_number: ticketNumber,
        p_payment_method: paymentMethod,
        p_cashier_id: cashierId,
        p_thermal_receipt_data: {
          receiptData,
          thermalData,
          savedAt: new Date().toISOString()
        }
      })

      if (error) {
        console.error('Error saving settled ticket:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in saveSettledTicket:', error)
      throw error
    }
  },

  /**
   * Update print count for a settled ticket
   */
  async updatePrintCount(ticketNumber) {
    try {
      const { data, error } = await supabase.rpc('increment_print_count', {
        ticket_num: ticketNumber
      })

      if (error) {
        console.error('Error updating print count:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updatePrintCount:', error)
      throw error
    }
  },

  /**
   * Get settled tickets for reporting
   */
  async getSettledTicketsReport(startDate = null, endDate = null, paymentMethod = null) {
    try {
      const { data, error } = await supabase.rpc('get_settled_tickets_report', {
        p_start_date: startDate,
        p_end_date: endDate,
        p_payment_method: paymentMethod
      })

      if (error) {
        console.error('Error fetching settled tickets report:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in getSettledTicketsReport:', error)
      throw error
    }
  },

  /**
   * Reprint a settled ticket
   */
  async reprintSettledTicket(ticketNumber) {
    try {
      // Get the settled ticket data
      const { data: settledTicket, error } = await supabase
        .from('settled_tickets')
        .select('*')
        .eq('ticket_number', ticketNumber)
        .single()

      if (error) {
        console.error('Error fetching settled ticket for reprint:', error)
        throw error
      }

      const thermalReceiptData = settledTicket.thermal_receipt_data
      
      if (!thermalReceiptData) {
        throw new Error('No thermal receipt data found for this ticket')
      }

      // Update print count
      await this.updatePrintCount(ticketNumber)

      // Generate HTML for reprinting
      const html = this.generateThermalHTML(
        thermalReceiptData.receiptData,
        thermalReceiptData.thermalData
      )

      return {
        html,
        settledTicket,
        isReprint: true
      }
    } catch (error) {
      console.error('Error in reprintSettledTicket:', error)
      throw error
    }
  }
}