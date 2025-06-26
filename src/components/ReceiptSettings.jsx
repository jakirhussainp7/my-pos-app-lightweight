import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

export const ReceiptSettings = () => {
  const [form, setForm] = useState({
    header: '',
    address: '',
    footer: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    const { data } = await supabase.from('settings').select('*').in('key', ['receipt_header', 'receipt_address', 'receipt_footer'])
    if (data) {
      setForm({
        header: data.find(s => s.key === 'receipt_header')?.value || '',
        address: data.find(s => s.key === 'receipt_address')?.value || '',
        footer: data.find(s => s.key === 'receipt_footer')?.value || ''
      })
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    // Upsert each setting
    await supabase.from('settings').upsert([
      { key: 'receipt_header', value: form.header },
      { key: 'receipt_address', value: form.address },
      { key: 'receipt_footer', value: form.footer }
    ], { onConflict: ['key'] })
    setMessage('Settings saved!')
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Receipt Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Header (Restaurant Name)</label>
          <input
            type="text"
            name="header"
            value={form.header}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="e.g. My Restaurant"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="e.g. 123 Main St, City, ZIP"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Footer</label>
          <input
            type="text"
            name="footer"
            value={form.footer}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="e.g. Thank you for your visit!"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
        {message && <div className="text-green-600 mt-2">{message}</div>}
      </form>
    </div>
  )
} 