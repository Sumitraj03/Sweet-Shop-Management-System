import { useEffect, useState } from "react";
import axios from "axios";
import { backend_url } from "../utils/constants";
import { Link, useNavigate } from "react-router-dom";
import { Package, Calendar, IndianRupee, ShoppingBag, User, LogOut, TrendingUp, Filter, Search, Download, ArrowLeft, CheckCircle } from "lucide-react";

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchPurchases();
  }, []);

  const checkUser = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error("Error checking user:", error);
    }
  };

  const fetchPurchases = async () => {
    try {
      const res = await axios.get(`${backend_url}/api/purchases`, {
        withCredentials: true,
      });
      
      if (res.data.success) {
        setPurchases(res.data.purchases || []);
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${backend_url}/api/auth/logout`, {}, {
        withCredentials: true
      });
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesFilter = filter === "all" || 
                         (filter === "recent" && isRecent(purchase.createdAt)) ||
                         (filter === "high" && purchase.totalAmount > 5000);
    
    const matchesSearch = purchase.sweetId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         purchase.sweetId?.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const isRecent = (dateString) => {
    const purchaseDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - purchaseDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const calculateStats = () => {
    const totalAmount = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
    const totalItems = purchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
    const avgOrderValue = purchases.length > 0 ? totalAmount / purchases.length : 0;
    
    return {
      totalAmount,
      totalItems,
      totalOrders: purchases.length,
      avgOrderValue
    };
  };

  const stats = calculateStats();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Sweet Name', 'Category', 'Quantity', 'Unit Price', 'Total Amount', 'Purchase Date'];
    const csvData = [
      headers,
      ...filteredPurchases.map(purchase => [
        purchase._id,
        purchase.sweetId.name,
        purchase.sweetId.category,
        purchase.quantity,
        `₹${purchase.purchasedAtPrice}`,
        `₹${purchase.totalAmount}`,
        formatDate(purchase.createdAt)
      ])
    ].join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchases-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🍬</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Mithai House
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8 font-medium">
            <Link to="/" className="text-gray-700 hover:text-pink-600 transition-colors px-3 py-2 rounded-lg hover:bg-pink-50">
              Home
            </Link>
            <Link to="/inventory" className="text-gray-700 hover:text-pink-600 transition-colors px-3 py-2 rounded-lg hover:bg-pink-50">
              Inventory
            </Link>
            <Link to="/purchases" className="text-pink-600 bg-pink-50 px-3 py-2 rounded-lg font-semibold">
              Purchases
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-300">{user.fullName}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all font-medium flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <Link to="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
              <h1 className="text-3xl font-bold text-gray-100">
                Purchase History
              </h1>
              <p className="text-gray-600 mt-2">
                Track all your sweet purchases and orders
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={exportToCSV}
                className="px-4 py-2.5 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 transition-all font-medium flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <div className="text-sm opacity-90">Total Orders</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{stats.totalItems}</div>
                  <div className="text-sm opacity-90">Items Purchased</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">₹{stats.totalAmount.toLocaleString()}</div>
                  <div className="text-sm opacity-90">Total Spent</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <IndianRupee className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">₹{stats.avgOrderValue.toFixed(0)}</div>
                  <div className="text-sm opacity-90">Avg. Order Value</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search purchases by sweet name or category..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-100 placeholder-gray-500"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Filter:</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === "all" 
                        ? "bg-pink-900/30 text-pink-300" 
                        : "text-gray-500 hover:bg-gray-800"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter("recent")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === "recent" 
                        ? "bg-purple-900/30 text-purple-300" 
                        : "text-gray-500 hover:bg-gray-800"
                    }`}
                  >
                    Recent (7 days)
                  </button>
                  <button
                    onClick={() => setFilter("high")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === "high" 
                        ? "bg-amber-900/30 text-amber-300" 
                        : "text-gray-500 hover:bg-gray-800"
                    }`}
                  >
                    High Value (&gt;₹5000)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
              <p className="mt-4 text-gray-600">Loading purchases...</p>
            </div>
          ) : filteredPurchases.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No purchases found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || filter !== "all" 
                  ? "Try a different search or filter" 
                  : "You haven't made any purchases yet"}
              </p>
              <Link
                to="/"
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700/50">
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Sweet Details</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Price</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Total</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Purchase Date</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPurchases.map((purchase) => (
                    <tr key={purchase._id} className="hover:bg-gray-700/50 transition-colors border-b border-gray-700">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-semibold text-gray-100">{purchase.sweetId.name}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            <span className="inline-block px-2 py-1 bg-pink-900/30 text-pink-300 rounded-full text-xs">
                              {purchase.sweetId.category}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Order ID: {purchase._id}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-100">{purchase.quantity}</div>
                        <div className="text-sm text-gray-500">units</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold text-gray-100">{purchase.purchasedAtPrice}</span>
                        </div>
                        <div className="text-sm text-gray-500">per kg</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-4 h-4 text-gray-500" />
                          <span className="font-bold text-lg text-pink-600">
                            {purchase.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{formatDate(purchase.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!loading && filteredPurchases.length > 0 && (
            <div className="p-6 border-t border-gray-700 bg-gray-700/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing {filteredPurchases.length} of {purchases.length} purchases
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Total Value: <span className="font-bold text-pink-600 ml-1">
                      ₹{filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-100">Mithai House</span>
            </div>
            
            <div className="flex gap-6 text-sm text-gray-600">
              <Link to="/" className="hover:text-pink-600 transition-colors">
                Home
              </Link>
              <Link to="/inventory" className="hover:text-pink-600 transition-colors">
                Inventory
              </Link>
              <Link to="/purchases" className="text-pink-600 font-semibold">
                Purchases
              </Link>
            </div>
            
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Sweet Shop Management
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}