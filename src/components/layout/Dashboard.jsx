export const Dashboard = () => {
  const stats = [
    { title: 'Today\'s Sales', value: '₹0.00', color: 'bg-green-500' },
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
                  <p className="font-medium">₹0.00</p>
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