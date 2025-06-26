import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'

export const TableManagement = () => {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ number: '', capacity: '', status: 'available' })
  const [formError, setFormError] = useState('')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('tables').select('*').order('table_number')
    if (!error) setTables(data)
    setLoading(false)
  }

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.number || !form.capacity) {
      setFormError('Table number and capacity are required.')
      return
    }
    setLoading(true)
    if (editingId) {
      // Update
      const { error } = await supabase.from('tables').update({
        table_number: form.number,
        capacity: form.capacity,
        status: form.status
      }).eq('id', editingId)
      if (error) setFormError('Error updating table.')
    } else {
      // Create
      const { error } = await supabase.from('tables').insert({
        table_number: form.number,
        capacity: form.capacity,
        status: form.status
      })
      if (error) setFormError('Error creating table.')
    }
    setForm({ number: '', capacity: '', status: 'available' })
    setEditingId(null)
    await fetchTables()
    setLoading(false)
  }

  const handleEdit = (table) => {
    setForm({ number: table.table_number, capacity: table.capacity, status: table.status })
    setEditingId(table.id)
  }

  const handleDelete = async (id) => {
    setLoading(true)
    await supabase.from('tables').delete().eq('id', id)
    await fetchTables()
    setLoading(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-500'
      case 'occupied': return 'bg-red-500'
      case 'reserved': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Table Management</h1>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap gap-4 items-end">
        <input
          type="number"
          name="number"
          value={form.number}
          onChange={handleInputChange}
          placeholder="Table Number"
          className="p-2 border rounded"
        />
        <input
          type="number"
          name="capacity"
          value={form.capacity}
          onChange={handleInputChange}
          placeholder="Capacity"
          className="p-2 border rounded"
        />
        <select
          name="status"
          value={form.status}
          onChange={handleInputChange}
          className="p-2 border rounded"
        >
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="reserved">Reserved</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <button type="submit" className="btn-primary">
          {editingId ? 'Update Table' : 'Add Table'}
        </button>
        {editingId && (
          <button type="button" className="btn-secondary" onClick={() => { setForm({ number: '', capacity: '', status: 'available' }); setEditingId(null); }}>
            Cancel
          </button>
        )}
        {formError && <span className="text-red-600 ml-4">{formError}</span>}
      </form>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className="bg-white rounded-lg shadow p-6 text-center cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className={`w-16 h-16 ${getStatusColor(table.status)} rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl`}>
              {table.table_number}
            </div>
            <h3 className="font-semibold">Table {table.table_number}</h3>
            <p className="text-sm text-gray-600">Capacity: {table.capacity}</p>
            <p className={`text-sm capitalize font-medium ${
              table.status === 'available' ? 'text-green-600' :
              table.status === 'occupied' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {table.status}
            </p>
            <div className="flex gap-2 mt-3">
              <button className="btn-secondary w-full" onClick={() => handleEdit(table)}>
                Edit
              </button>
              <button className="btn-danger w-full" onClick={() => handleDelete(table.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}