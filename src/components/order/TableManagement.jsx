import { useState } from 'react'

export const TableManagement = () => {
  const [tables] = useState([])

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
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className="bg-white rounded-lg shadow p-6 text-center cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className={`w-16 h-16 ${getStatusColor(table.status)} rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl`}>
              {table.number}
            </div>
            <h3 className="font-semibold">Table {table.number}</h3>
            <p className="text-sm text-gray-600">Capacity: {table.capacity}</p>
            <p className={`text-sm capitalize font-medium ${
              table.status === 'available' ? 'text-green-600' :
              table.status === 'occupied' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {table.status}
            </p>
            {table.status === 'available' && (
              <button className="mt-3 btn-primary w-full">
                Assign Table
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}