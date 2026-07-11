import { useState } from 'react';
import {
  HomeIcon,
  UsersIcon,
  StorefrontIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ShieldExclamationIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
  { id: 'users', label: 'Users', icon: UsersIcon },
  { id: 'vendors', label: 'Vendors', icon: StorefrontIcon },
  { id: 'partners', label: 'Partners', icon: TruckIcon },
  { id: 'orders', label: 'Orders', icon: ClipboardDocumentListIcon },
  { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
  { id: 'fraud', label: 'Fraud Alerts', icon: ShieldExclamationIcon },
  { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
];

const mockRevenueData = [
  { month: 'Jan', revenue: 450000 },
  { month: 'Feb', revenue: 520000 },
  { month: 'Mar', revenue: 480000 },
  { month: 'Apr', revenue: 610000 },
  { month: 'May', revenue: 720000 },
  { month: 'Jun', revenue: 850000 },
];

const mockOrderStatusData = [
  { name: 'Delivered', value: 65, color: '#10B981' },
  { name: 'In Transit', value: 20, color: '#3B82F6' },
  { name: 'Cancelled', value: 10, color: '#EF4444' },
  { name: 'Pending', value: 5, color: '#F59E0B' },
];

const mockRecentActivity = [
  { id: 1, action: 'New vendor registered', entity: 'Pizza Palace', time: '2 min ago', type: 'vendor' },
  { id: 2, action: 'Partner KYC approved', entity: 'Rajesh Kumar', time: '5 min ago', type: 'partner' },
  { id: 3, action: 'Large order flagged', entity: 'Order #12345', time: '10 min ago', type: 'alert' },
  { id: 4, action: 'New user sign up', entity: 'Priya Sharma', time: '15 min ago', type: 'user' },
];

function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const formatCurrency = (amount: number) => `₹${(amount / 100000).toFixed(1)}L`;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-gray-800 border-r border-gray-700 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">Z</span>
            </div>
            <div>
              <span className="text-xl font-bold">Zeyora</span>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <XMarkIcon className="w-6 h-6 text-gray-400" />
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
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.id === 'fraud' && (
                <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-gray-300 font-medium">SA</span>
            </div>
            <div>
              <p className="font-medium text-white">Super Admin</p>
              <p className="text-sm text-gray-400">admin@zeyora.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
              <Bars3Icon className="w-6 h-6 text-gray-400" />
            </button>
            <h1 className="text-2xl font-bold">
              {activeMenu === 'dashboard' && 'Dashboard'}
              {activeMenu === 'users' && 'User Management'}
              {activeMenu === 'vendors' && 'Vendor Management'}
              {activeMenu === 'partners' && 'Partner Management'}
              {activeMenu === 'orders' && 'Order Management'}
              {activeMenu === 'analytics' && 'Analytics'}
              {activeMenu === 'fraud' && 'Fraud Detection'}
              {activeMenu === 'settings' && 'Settings'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Last updated: Just now</span>
            <button className="relative">
              <BellIcon className="w-6 h-6 text-gray-400" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">5</span>
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
                      <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold">₹36.3L</p>
                      <p className="text-sm text-green-400 mt-1">↑ 18% from last month</p>
                    </div>
                    <div className="w-12 h-12 bg-green-900 rounded-xl flex items-center justify-center">
                      <CurrencyRupeeIcon className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Total Users</p>
                      <p className="text-3xl font-bold">12,450</p>
                      <p className="text-sm text-green-400 mt-1">↑ 5% this week</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center">
                      <UsersIcon className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Active Vendors</p>
                      <p className="text-3xl font-bold">342</p>
                      <p className="text-sm text-yellow-400 mt-1">12 pending approval</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-900 rounded-xl flex items-center justify-center">
                      <StorefrontIcon className="w-6 h-6 text-orange-400" />
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Active Partners</p>
                      <p className="text-3xl font-bold">856</p>
                      <p className="text-sm text-gray-400 mt-1">543 online now</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-900 rounded-xl flex items-center justify-center">
                      <TruckIcon className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts and Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 card">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Revenue Trend</h2>
                    <select className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-sm">
                      <option>Last 6 Months</option>
                      <option>Last Year</option>
                    </select>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" tickFormatter={(v) => `₹${v/1000}L`} />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#004E89" fill="#004E89" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Order Status */}
                <div className="card">
                  <h2 className="text-lg font-semibold mb-6">Order Distribution</h2>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mockOrderStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {mockOrderStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {mockOrderStatusData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-gray-400">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mt-6 card">
                <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {mockRecentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === 'vendor' ? 'bg-orange-900' :
                          activity.type === 'partner' ? 'bg-blue-900' :
                          activity.type === 'alert' ? 'bg-red-900' : 'bg-green-900'
                        }`}>
                          {activity.type === 'vendor' && <StorefrontIcon className="w-5 h-5 text-orange-400" />}
                          {activity.type === 'partner' && <TruckIcon className="w-5 h-5 text-blue-400" />}
                          {activity.type === 'alert' && <ShieldExclamationIcon className="w-5 h-5 text-red-400" />}
                          {activity.type === 'user' && <UsersIcon className="w-5 h-5 text-green-400" />}
                        </div>
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-gray-400">{activity.entity}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeMenu !== 'dashboard' && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">
                {activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)} Management
              </h2>
              <div className="text-center py-12 text-gray-500">
                {activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)} management interface
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Helper components
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

export default App;
