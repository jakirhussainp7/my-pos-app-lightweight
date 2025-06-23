export const BackOffice = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Back Office</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Menu Management</h3>
          <p className="text-gray-600 mb-4">Add, edit, or remove menu items</p>
          <button className="btn-primary">Manage Menu</button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Staff Management</h3>
          <p className="text-gray-600 mb-4">Manage staff accounts and permissions</p>
          <button className="btn-primary">Manage Staff</button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Inventory</h3>
          <p className="text-gray-600 mb-4">Track and manage inventory levels</p>
          <button className="btn-primary">View Inventory</button>
        </div>
      </div>
    </div>
  )
}