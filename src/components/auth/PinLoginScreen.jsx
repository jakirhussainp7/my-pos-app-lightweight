import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export const PinLoginScreen = () => {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  // Auto-login when 4 digits are entered
  useEffect(() => {
    const tryLogin = async () => {
      setLoading(true)
      const success = await login(pin)
      setLoading(false)
      if (!success) {
        setError('Invalid PIN')
        setPin('')
      } else {
        setError('')
      }
    }
    if (pin.length === 4) {
      tryLogin()
    }
  }, [pin, login])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const success = await login(pin)
    setLoading(false)
    if (!success) {
      setError('Invalid PIN')
      setPin('')
    } else {
      setError('')
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

          {loading && (
            <div className="text-center text-blue-500 mb-4">Logging in...</div>
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
        </form>
      </div>
    </div>
  )
}