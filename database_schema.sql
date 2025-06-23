-- POS System Database Schema

-- Tables
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS ticket_sequences CASCADE;

-- Ticket sequence management table for generating sequential ticket numbers
CREATE TABLE IF NOT EXISTS ticket_sequences (
  id SERIAL PRIMARY KEY,
  current_number INTEGER NOT NULL DEFAULT 0,
  prefix VARCHAR(10) DEFAULT 'TKT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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