import { useState } from 'react';
import {
  HomeIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
  { id: 'orders', label: 'Orders', icon: ClipboardDocumentListIcon },
  { id: 'menu', label: 'Menu', icon: ShoppingBagIcon },
  { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
  { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
];

const mockOrders = [
  { id: '1', customer: 'Rahul S.', items: 3, total: 450, status: 'pending', time: '2 min ago' },
  { id: '2', customer: 'Priya M.', items: 2, total: 280, status: 'preparing', time: '5 min ago' },
  { id: '3', customer: 'Amit K.', items: 5, total: 720, status: 'ready', time: '8 min ago' },
];

const mockChartData = [
  { day: 'Mon', orders: 45, revenue: 12500 },
  { day: 'Tue', orders: 52, revenue: 14800 },
  { day: 'Wed', orders: 48, revenue: 13200 },
  { day: 'Thu', orders: 61, revenue: 16800 },
  { day: 'Fri', orders: 72, revenue: 19500 },
  { day: 'Sat', orders: 85, revenue: 22500 },
  { day: 'Sun', orders: 78, revenue: 21000 },
];

function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">Z</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Zeyora</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <nav className="p-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg mb-2 transition-colors ${
                activeMenu === item.id
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium">VD</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Vendor Demo</p>
              <p className="text-sm text-gray-500">Business Account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
              <Bars3Icon className="w-6 h-6 text-gray-500" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {activeMenu === 'dashboard' && 'Dashboard'}
              {activeMenu === 'orders' && 'Orders'}
              {activeMenu === 'menu' && 'Menu Management'}
              {activeMenu === 'analytics' && 'Analytics'}
              {activeMenu === 'settings' && 'Settings'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Today, 10 Jan 2024</span>
            <button className="relative">
              <BellIcon className="w-6 h-6 text-gray-500" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">3</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {activeMenu === 'dashboard' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Today's Orders</p>
                      <p className="text-3xl font-bold text-gray-800">127</p>
                      <p className="text-sm text-green-600 mt-1">↑ 12% from yesterday</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Today's Revenue</p>
                      <p className="text-3xl font-bold text-gray-800">₹34,500</p>
                      <p className="text-sm text-green-600 mt-1">↑ 8% from yesterday</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CurrencyRupeeIcon className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Pending Orders</p>
                      <p className="text-3xl font-bold text-gray-800">8</p>
                      <p className="text-sm text-yellow-600 mt-1">Action required</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <ClockIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Rating</p>
                      <p className="text-3xl font-bold text-gray-800">4.8</p>
                      <p className="text-sm text-gray-500 mt-1">1,234 reviews</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <StarIcon className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart and Orders */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 card">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Revenue Overview</h2>
                    <select className="px-3 py-1 border border-gray-200 rounded-lg text-sm">
                      <option>This Week</option>
                      <option>This Month</option>
                      <option>This Year</option>
                    </select>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="day" stroke="#6B7280" />
                        <YAxis stroke="#6B7280" />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={2} dot={{ fill: '#FF6B35' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
                    <button className="text-sm text-primary font-medium">View All</button>
                  </div>
                  <div className="space-y-4">
                    {mockOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{order.customer}</p>
                          <p className="text-sm text-gray-500">{order.items} items • {formatCurrency(order.total)}</p>
                        </div>
                        <span className={`badge ${getStatusColor(order.status)} capitalize`}>
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeMenu === 'orders' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">All Orders</h2>
                <div className="flex gap-2">
                  {['All', 'Pending', 'Preparing', 'Ready'].map((filter) => (
                    <button
                      key={filter}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        filter === 'All' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Order ID</th>
                    <th className="table-header-cell">Customer</th>
                    <th className="table-header-cell">Items</th>
                    <th className="table-header-cell">Total</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Time</th>
                    <th className="table-header-cell">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOrders.map((order) => (
                    <tr key={order.id} className="table-row">
                      <td className="table-cell font-medium">#{order.id}</td>
                      <td className="table-cell">{order.customer}</td>
                      <td className="table-cell">{order.items}</td>
                      <td className="table-cell font-medium">{formatCurrency(order.total)}</td>
                      <td className="table-cell">
                        <span className={`badge ${getStatusColor(order.status)} capitalize`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="table-cell">{order.time}</td>
                      <td className="table-cell">
                        <button className="text-primary font-medium hover:underline">Update</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeMenu === 'menu' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Menu Items</h2>
                <button className="btn-primary flex items-center gap-2">
                  <PlusIcon className="w-5 h-5" />
                  Add Item
                </button>
              </div>
              <div className="text-center py-12 text-gray-500">
                Menu management interface - Add/Edit/Delete products
              </div>
            </div>
          )}

          {activeMenu === 'analytics' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Analytics Dashboard</h2>
              <div className="text-center py-12 text-gray-500">
                Detailed analytics and insights for your business
              </div>
            </div>
          )}

          {activeMenu === 'settings' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Settings</h2>
              <div className="text-center py-12 text-gray-500">
                Business settings, operating hours, and preferences
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Helper components for icons
function BellIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function CurrencyRupeeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

export default App;
