export const Settings = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="max-w-2xl">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">System Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Restaurant Name</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" placeholder="My Restaurant" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Default Tax Rate (%)</label>
              <input type="number" className="w-full p-2 border border-gray-300 rounded" placeholder="8.5" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Idle Timeout (minutes)</label>
              <input type="number" className="w-full p-2 border border-gray-300 rounded" placeholder="5" />
            </div>
            <button className="btn-primary">Update Settings</button>
          </div>
        </div>
      </div>
    </div>
  )
}