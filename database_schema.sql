-- POS System Database Schema

-- Tables
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS ticket_sequences CASCADE;
DROP TABLE IF EXISTS settled_tickets CASCADE;

-- Ticket sequence management table for generating sequential ticket numbers
CREATE TABLE IF NOT EXISTS ticket_sequences (
  id SERIAL PRIMARY KEY,
  current_number INTEGER NOT NULL DEFAULT 0,
  prefix VARCHAR(10) DEFAULT 'TKT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settled tickets tracking table for thermal printing and record keeping
CREATE TABLE IF NOT EXISTS settled_tickets (
  id SERIAL PRIMARY KEY,
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  order_id INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  settled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  thermal_receipt_data JSONB,
  receipt_printed BOOLEAN DEFAULT false,
  print_count INTEGER DEFAULT 0,
  cashier_id INTEGER,
  table_number INTEGER,
  order_type VARCHAR(20),
  customer_count INTEGER DEFAULT 1,
  notes TEXT
);

-- Insert initial ticket sequence
INSERT INTO ticket_sequences (current_number, prefix) VALUES (0, 'TKT')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS tables (
  id SERIAL PRIMARY KEY,
  table_number INTEGER UNIQUE NOT NULL,
  capacity INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu Categories
CREATE TABLE IF NOT EXISTS menu_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES menu_categories(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders with ticket number
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  table_id INTEGER REFERENCES tables(id),
  order_type VARCHAR(20) DEFAULT 'dine-in' CHECK (order_type IN ('dine-in', 'takeaway', 'delivery')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),
  total_amount DECIMAL(10,2) DEFAULT 0,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  menu_item_id INTEGER REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  notes TEXT
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'mobile')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  table_id INTEGER REFERENCES tables(id),
  customer_name VARCHAR(200) NOT NULL,
  customer_phone VARCHAR(20),
  party_size INTEGER NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  pin VARCHAR(10) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin user
INSERT INTO users (name, pin, role) VALUES ('admin', '1111', 'admin')
ON CONFLICT (pin) DO NOTHING;

-- Sample Data
INSERT INTO tables (table_number, capacity) VALUES
(1, 2), (2, 4), (3, 6), (4, 2), (5, 8);

INSERT INTO menu_categories (name, description) VALUES
('Appetizers', 'Start your meal with our delicious appetizers'),
('Main Courses', 'Hearty main dishes'),
('Desserts', 'Sweet endings to your meal'),
('Beverages', 'Hot and cold drinks');

INSERT INTO menu_items (category_id, name, description, price) VALUES
(1, 'Spring Rolls', 'Fresh vegetable spring rolls', 8.99),
(1, 'Garlic Bread', 'Toasted bread with garlic butter', 6.99),
(2, 'Grilled Chicken', 'Marinated grilled chicken breast', 18.99),
(2, 'Beef Steak', 'Premium beef steak cooked to perfection', 24.99),
(3, 'Chocolate Cake', 'Rich chocolate layer cake', 7.99),
(3, 'Ice Cream', 'Vanilla ice cream with toppings', 5.99),
(4, 'Coffee', 'Freshly brewed coffee', 3.99),
(4, 'Soft Drinks', 'Assorted soft drinks', 2.99);

-- Enable RLS if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settled_tickets ENABLE ROW LEVEL SECURITY;

-- Allow all users to select (read) for development
CREATE POLICY "Allow read for all"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all for ticket_sequences"
  ON ticket_sequences
  FOR ALL
  USING (true);

CREATE POLICY "Allow all for orders"
  ON orders
  FOR ALL
  USING (true);

CREATE POLICY "Allow all for order_items"
  ON order_items
  FOR ALL
  USING (true);

CREATE POLICY "Allow all for payments"
  ON payments
  FOR ALL
  USING (true);

CREATE POLICY "Allow all for settled_tickets"
  ON settled_tickets
  FOR ALL
  USING (true);

-- Function to generate next ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    ticket_prefix TEXT;
    padded_number TEXT;
BEGIN
    -- Get and update the current ticket sequence
    UPDATE ticket_sequences 
    SET current_number = current_number + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
    RETURNING current_number, prefix INTO next_number, ticket_prefix;
    
    -- Pad the number with zeros (e.g., 0001, 0002, etc.)
    padded_number := LPAD(next_number::TEXT, 4, '0');
    
    -- Return formatted ticket number
    RETURN ticket_prefix || padded_number;
END;
$$ LANGUAGE plpgsql;

-- Function to settle a ticket (called when payment is completed)
CREATE OR REPLACE FUNCTION settle_ticket(
    p_ticket_number TEXT,
    p_payment_method TEXT,
    p_cashier_id INTEGER DEFAULT NULL,
    p_thermal_receipt_data JSONB DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_order_record RECORD;
    v_settled_ticket_id INTEGER;
BEGIN
    -- Get order details
    SELECT o.*, t.table_number INTO v_order_record
    FROM orders o
    LEFT JOIN tables t ON o.table_id = t.id
    WHERE o.ticket_number = p_ticket_number
    AND o.payment_status = 'paid';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found or not paid for ticket number: %', p_ticket_number;
    END IF;
    
    -- Insert into settled_tickets
    INSERT INTO settled_tickets (
        ticket_number,
        order_id,
        total_amount,
        payment_method,
        thermal_receipt_data,
        cashier_id,
        table_number,
        order_type
    ) VALUES (
        p_ticket_number,
        v_order_record.id,
        v_order_record.total_amount,
        p_payment_method,
        p_thermal_receipt_data,
        p_cashier_id,
        v_order_record.table_number,
        v_order_record.order_type
    )
    RETURNING id INTO v_settled_ticket_id;
    
    RETURN v_settled_ticket_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get settled tickets for reporting
CREATE OR REPLACE FUNCTION get_settled_tickets_report(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_payment_method TEXT DEFAULT NULL
)
RETURNS TABLE (
    ticket_number TEXT,
    total_amount DECIMAL(10,2),
    payment_method TEXT,
    settled_at TIMESTAMP,
    table_number INTEGER,
    order_type TEXT,
    print_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        st.ticket_number,
        st.total_amount,
        st.payment_method,
        st.settled_at,
        st.table_number,
        st.order_type,
        st.print_count
    FROM settled_tickets st
    WHERE 
        (p_start_date IS NULL OR DATE(st.settled_at) >= p_start_date)
        AND (p_end_date IS NULL OR DATE(st.settled_at) <= p_end_date)
        AND (p_payment_method IS NULL OR st.payment_method = p_payment_method)
    ORDER BY st.settled_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to increment print count
CREATE OR REPLACE FUNCTION increment_print_count(ticket_num TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE settled_tickets 
    SET print_count = print_count + 1,
        receipt_printed = true
    WHERE ticket_number = ticket_num;
END;
$$ LANGUAGE plpgsql;

-- Add columns to orders table
ALTER TABLE orders ADD COLUMN order_type VARCHAR(20) DEFAULT 'dine-in';
ALTER TABLE orders ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';