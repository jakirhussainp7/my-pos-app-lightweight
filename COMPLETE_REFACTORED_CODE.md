# 🚀 Complete Refactored POS System Code

## 📁 File Structure to Create

```
my-pos-app/
├── package.json
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── database_schema.sql
├── README.md
├── public/
│   └── vite.svg
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── config/
    │   └── supabase.js
    ├── contexts/
    │   └── AuthContext.jsx
    ├── hooks/
    │   └── useIdle.js
    └── components/
        ├── AppRouter.jsx
        ├── auth/
        │   └── PinLoginScreen.jsx
        ├── layout/
        │   ├── Dashboard.jsx
        │   ├── MainApp.jsx
        │   └── Sidebar.jsx
        ├── order/
        │   ├── NewOrderFlow.jsx
        │   ├── TableManagement.jsx
        │   ├── OrderCreation.jsx
        │   ├── OpenTickets.jsx
        │   └── PaymentScreen.jsx
        ├── common/
        │   ├── Icons.jsx
        │   └── Modal.jsx
        ├── admin/
        │   └── BackOffice.jsx
        ├── reports/
        │   └── Reports.jsx
        ├── Reservations.jsx
        ├── CustomerManagement.jsx
        └── Settings.jsx
```

---

## 📄 All File Contents

### 📦 package.json
```json
{
  "name": "my-pos-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "@supabase/supabase-js": "^2.39.3"
  },
  "devDependencies": {
    "@eslint/js": "^9.13.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.13.0",
    "eslint-plugin-react": "^7.37.2",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.14",
    "globals": "^15.11.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15",
    "vite": "^5.4.10"
  }
}
```

### 🌐 index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>POS System</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### ⚙️ vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### 🎨 tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 📝 postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 🔍 eslint.config.js
```javascript
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
```

### 🗄️ database_schema.sql
```sql
-- POS System Database Schema

-- Tables
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

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  table_id INTEGER REFERENCES tables(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),
  total_amount DECIMAL(10,2) DEFAULT 0,
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
```

---

## 🔧 Source Code Files

### 🚀 src/main.jsx
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### 🎯 src/App.jsx (Main Entry - 9 lines!)
```jsx
import { AuthProvider } from './contexts/AuthContext'
import { AppRouter } from './components/AppRouter'

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App
```

### 🎨 src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

@layer components {
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors;
  }
  
  .btn-secondary {
    @apply bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors;
  }
  
  .btn-danger {
    @apply bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}
```

### ⚙️ src/config/supabase.js
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mzcezzzuzvvwxfszaalp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16Y2V6enp1enZ2d3hmc3phYWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NzU3NzIsImV4cCI6MjA1MDQ1MTc3Mn0.zrTt6vBhsn7iWaFqNvnT5fPO3_5R1P8c2VvHjrF9VJ4'

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### 🔐 src/contexts/AuthContext.jsx
```jsx
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const savedAuth = localStorage.getItem('pos_auth')
    if (savedAuth) {
      const authData = JSON.parse(savedAuth)
      setIsAuthenticated(true)
      setUser(authData.user)
    }
    setLoading(false)
  }, [])

  const login = (pin) => {
    // Simple PIN authentication - replace with real auth
    const validPins = {
      '1234': { id: 1, name: 'Manager', role: 'manager' },
      '5678': { id: 2, name: 'Staff', role: 'staff' }
    }

    if (validPins[pin]) {
      const userData = validPins[pin]
      setIsAuthenticated(true)
      setUser(userData)
      localStorage.setItem('pos_auth', JSON.stringify({ user: userData }))
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('pos_auth')
  }

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

### ⏱️ src/hooks/useIdle.js
```javascript
import { useState, useEffect, useCallback } from 'react'

export const useIdle = (timeout = 300000) => { // 5 minutes default
  const [isIdle, setIsIdle] = useState(false)

  const resetTimer = useCallback(() => {
    setIsIdle(false)
  }, [])

  useEffect(() => {
    let timeoutId

    const resetTimeout = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => setIsIdle(true), timeout)
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, true)
    })

    resetTimeout()

    return () => {
      clearTimeout(timeoutId)
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout, true)
      })
    }
  }, [timeout])

  return { isIdle, resetTimer }
}
```

### 🧭 src/components/AppRouter.jsx
```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PinLoginScreen } from './auth/PinLoginScreen'
import { MainApp } from './layout/MainApp'

export const AppRouter = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/*" 
          element={isAuthenticated ? <MainApp /> : <PinLoginScreen />} 
        />
      </Routes>
    </Router>
  )
}
```

### 🔐 src/components/auth/PinLoginScreen.jsx
```jsx
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export const PinLoginScreen = () => {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (login(pin)) {
      setError('')
    } else {
      setError('Invalid PIN')
      setPin('')
    }
  }

  const handlePinClick = (digit) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit)
    }
  }

  const handleClear = () => {
    setPin('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center mb-6">POS System</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Enter PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-center text-2xl"
              maxLength="4"
              placeholder="• • • •"
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm mb-4 text-center">{error}</div>
          )}

          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '✓'].map((btn) => (
              <button
                key={btn}
                type={btn === '✓' ? 'submit' : 'button'}
                onClick={() => {
                  if (btn === 'C') handleClear()
                  else if (btn !== '✓') handlePinClick(btn.toString())
                }}
                className={`p-4 text-xl font-bold rounded ${
                  btn === '✓' 
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : btn === 'C'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {btn}
              </button>
            ))}
          </div>

          <div className="text-xs text-gray-500 text-center">
            Demo PINs: 1234 (Manager) or 5678 (Staff)
          </div>
        </form>
      </div>
    </div>
  )
}
```

### 🏗️ src/components/layout/MainApp.jsx
```jsx
import { Routes, Route } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Dashboard } from './Dashboard'
import { TableManagement } from '../order/TableManagement'
import { NewOrderFlow } from '../order/NewOrderFlow'
import { OpenTickets } from '../order/OpenTickets'
import { Reservations } from '../Reservations'
import { CustomerManagement } from '../CustomerManagement'
import { Reports } from '../reports/Reports'
import { BackOffice } from '../admin/BackOffice'
import { Settings } from '../Settings'

export const MainApp = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tables" element={<TableManagement />} />
          <Route path="/new-order" element={<NewOrderFlow />} />
          <Route path="/open-tickets" element={<OpenTickets />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/backoffice" element={<BackOffice />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}
```

### 📊 src/components/layout/Dashboard.jsx
```jsx
export const Dashboard = () => {
  const stats = [
    { title: 'Today\'s Sales', value: '$1,234.56', color: 'bg-green-500' },
    { title: 'Open Orders', value: '12', color: 'bg-blue-500' },
    { title: 'Available Tables', value: '8', color: 'bg-yellow-500' },
    { title: 'Total Customers', value: '45', color: 'bg-purple-500' }
  ]

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className={`w-12 h-12 ${stat.color} rounded-lg mb-4`}></div>
            <h3 className="text-gray-500 text-sm">{stat.title}</h3>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(order => (
              <div key={order} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">Table {order}</p>
                  <p className="text-sm text-gray-500">Order #{100 + order}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${(Math.random() * 100 + 20).toFixed(2)}</p>
                  <p className="text-sm text-green-600">Completed</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Popular Items</h2>
          <div className="space-y-3">
            {['Grilled Chicken', 'Beef Steak', 'Spring Rolls', 'Chocolate Cake', 'Coffee'].map((item, index) => (
              <div key={item} className="flex justify-between items-center py-2 border-b">
                <p className="font-medium">{item}</p>
                <p className="text-sm text-gray-500">{25 - index * 3} orders</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 🧭 src/components/layout/Sidebar.jsx
```jsx
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  HomeIcon, 
  TableIcon, 
  PlusIcon, 
  TicketIcon, 
  CalendarIcon, 
  UsersIcon, 
  ChartIcon, 
  SettingsIcon, 
  LogoutIcon,
  AdminIcon
} from '../common/Icons'

export const Sidebar = () => {
  const location = useLocation()
  const { logout, user } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Tables', href: '/tables', icon: TableIcon },
    { name: 'New Order', href: '/new-order', icon: PlusIcon },
    { name: 'Open Tickets', href: '/open-tickets', icon: TicketIcon },
    { name: 'Reservations', href: '/reservations', icon: CalendarIcon },
    { name: 'Customers', href: '/customers', icon: UsersIcon },
    { name: 'Reports', href: '/reports', icon: ChartIcon },
    ...(user?.role === 'manager' ? [{ name: 'Back Office', href: '/backoffice', icon: AdminIcon }] : []),
    { name: 'Settings', href: '/settings', icon: SettingsIcon }
  ]

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4">
        <h1 className="text-xl font-bold">POS System</h1>
        <p className="text-sm text-gray-300">Welcome, {user?.name}</p>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4">
        <button
          onClick={logout}
          className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
        >
          <LogoutIcon className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}
```

---

## 📱 Component Files (Continued in next section...)

This is getting quite long! Would you like me to continue with the remaining component files, or would you prefer a different approach to get this code? I can:

1. **Continue with all remaining files** in the next response
2. **Create a ZIP file approach** using a different method
3. **Provide a setup script** that creates all files at once
4. **Focus on the most critical files** first

What would work best for you?