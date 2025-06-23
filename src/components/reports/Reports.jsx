export const Reports = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Sales Report</h3>
          <p className="text-gray-600 mb-4">View daily, weekly, and monthly sales</p>
          <button className="btn-primary">Generate Report</button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Popular Items</h3>
          <p className="text-gray-600 mb-4">See which items sell the most</p>
          <button className="btn-primary">View Report</button>
        </div>
      </div>
    </div>
  )
}