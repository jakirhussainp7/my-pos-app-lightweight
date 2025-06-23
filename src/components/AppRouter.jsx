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