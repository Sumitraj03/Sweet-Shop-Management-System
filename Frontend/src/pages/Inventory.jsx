import { useEffect, useState } from "react";
import axios from "axios";
import { backend_url } from "../utils/constants";
import { Link, useNavigate } from "react-router-dom";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  TrendingUp, 
  IndianRupee,
  ShoppingBag,
  ArrowLeft,
  User,
  LogOut,
  AlertCircle,
  RefreshCw,
  PackagePlus,
  CheckCircle
} from "lucide-react";

export default function Inventory() {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingSweet, setEditingSweet] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showRestockModal, setShowRestockModal] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: ""
  });
  const [editErrors, setEditErrors] = useState({});
  const [restockLoading, setRestockLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserSweets();
    }
  }, [user]);

  const checkUser = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        if (parsedUser.role !== 'admin') {
          navigate('/');
        }
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error("Error checking user:", error);
    }
  };

  const fetchUserSweets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backend_url}/api/sweets/getSweets`, {
        withCredentials: true,
      });
      
      if (res.data.success) {
        setSweets(res.data.sweets || []);
      }
    } catch (error) {
      console.error("Error fetching user sweets:", error);
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

  const handleDelete = async (sweetId) => {
    try {
      const res = await axios.delete(`${backend_url}/api/sweets/${sweetId}`, {
        withCredentials: true,
      });
      
      if (res.data.success) {
        setSweets(sweets.filter(sweet => sweet._id !== sweetId));
        setShowDeleteConfirm(null);
        alert(res.data.message);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete sweet");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditErrors({});
    
    // Validate form
    const errors = {};
    if (!editForm.name.trim()) errors.name = "Name is required";
    if (!editForm.category.trim()) errors.category = "Category is required";
    if (editForm.price < 0) errors.price = "Price cannot be negative";
    if (editForm.quantity < 0) errors.quantity = "Quantity cannot be negative";
    
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    try {
      const res = await axios.put(
        `${backend_url}/api/sweets/${editingSweet._id}`,
        editForm,
        { withCredentials: true }
      );
      
      if (res.data.success) {
        setSweets(sweets.map(sweet => 
          sweet._id === editingSweet._id ? res.data.sweet : sweet
        ));
        setEditingSweet(null);
        setEditForm({ name: "", category: "", price: "", quantity: "" });
        alert(res.data.message);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update sweet");
    }
  };

  const handleRestock = async () => {
    if (!restockQuantity || parseInt(restockQuantity) <= 0) {
      alert("Please enter a valid quantity greater than 0");
      return;
    }

    setRestockLoading(true);
    try {
      const res = await axios.put(
        `${backend_url}/api/sweets/${showRestockModal._id}`,
        { quantity: parseInt(showRestockModal.quantity) + parseInt(restockQuantity) },
        { withCredentials: true }
      );
      
      if (res.data.success) {
        setSweets(sweets.map(sweet => 
          sweet._id === showRestockModal._id ? res.data.sweet : sweet
        ));
        setShowRestockModal(null);
        setRestockQuantity("");
        alert(`Restocked successfully! Added ${restockQuantity} units.`);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to restock");
    } finally {
      setRestockLoading(false);
    }
  };

  const startEdit = (sweet) => {
    setEditingSweet(sweet);
    setEditForm({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      quantity: sweet.quantity
    });
    setEditErrors({});
  };

  const startRestock = (sweet) => {
    setShowRestockModal(sweet);
    setRestockQuantity("");
  };

  const filteredSweets = sweets.filter(sweet => {
    const matchesFilter = filter === "all" || 
                         (filter === "low" && sweet.quantity <= 10 && sweet.quantity > 0) ||
                         (filter === "out" && sweet.quantity === 0);
    
    const matchesSearch = sweet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sweet.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const calculateStats = () => {
    const totalValue = sweets.reduce((sum, sweet) => sum + (sweet.price * sweet.quantity), 0);
    const totalStock = sweets.reduce((sum, sweet) => sum + sweet.quantity, 0);
    const lowStock = sweets.filter(sweet => sweet.quantity <= 10 && sweet.quantity > 0).length;
    const outOfStock = sweets.filter(sweet => sweet.quantity === 0).length;
    
    return {
      totalValue,
      totalStock,
      totalItems: sweets.length,
      lowStock,
      outOfStock
    };
  };

  const stats = calculateStats();

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
            <Link to="/inventory" className="text-pink-600 bg-pink-50 px-3 py-2 rounded-lg font-semibold">
              Inventory
            </Link>
            <Link to="/purchases" className="text-gray-700 hover:text-pink-600 transition-colors px-3 py-2 rounded-lg hover:bg-pink-50">
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
                Your Inventory
              </h1>
              <p className="text-gray-600 mt-2">
                Manage all your sweet items and stock levels
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={fetchUserSweets}
                className="px-4 py-2.5 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 transition-all font-medium flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <Link
                to="/add"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Sweet
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{stats.totalItems}</div>
                  <div className="text-sm opacity-90">Total Items</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{stats.totalStock}</div>
                  <div className="text-sm opacity-90">In Stock</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">₹{stats.totalValue.toLocaleString()}</div>
                  <div className="text-sm opacity-90">Total Value</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{stats.lowStock + stats.outOfStock}</div>
                  <div className="text-sm opacity-90">Need Attention</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sweets by name or category..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-100 placeholder-gray-500"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400">Filter:</span>
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
                    onClick={() => setFilter("low")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === "low" 
                        ? "bg-amber-900/30 text-amber-300" 
                        : "text-gray-500 hover:bg-gray-800"
                    }`}
                  >
                    Low Stock (≤10)
                  </button>
                  <button
                    onClick={() => setFilter("out")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === "out" 
                        ? "bg-red-900/30 text-red-300" 
                        : "text-gray-500 hover:bg-gray-800"
                    }`}
                  >
                    Out of Stock
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
              <p className="mt-4 text-gray-600">Loading inventory...</p>
            </div>
          ) : filteredSweets.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No sweets found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || filter !== "all" 
                  ? "Try a different search or filter" 
                  : "Start by adding your first sweet to inventory"}
              </p>
              <Link
                to="/add"
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium"
              >
                Add Your First Sweet
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700/50">
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Sweet Details</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Price</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Stock</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Value</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSweets.map((sweet) => (
                    <tr key={sweet._id} className="hover:bg-gray-700/50 transition-colors border-b border-gray-700">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-100">{sweet.name}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          ID: {sweet._id}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                          {sweet.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold text-gray-100">₹{sweet.price}</span>
                        </div>
                        <div className="text-sm text-gray-500">per kg</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className={`font-semibold ${
                          sweet.quantity === 0 ? 'text-red-600' :
                          sweet.quantity <= 10 ? 'text-amber-600' :
                          'text-green-600'
                        }`}>
                          {sweet.quantity} units
                        </div>
                        <div className="text-xs text-gray-500">
                          {sweet.quantity === 0 ? 'Out of stock' :
                           sweet.quantity <= 10 ? 'Low stock' :
                           'In stock'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-4 h-4 text-gray-500" />
                          <span className="font-bold text-pink-600">
                            ₹{(sweet.price * sweet.quantity).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startRestock(sweet)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Restock"
                          >
                            <PackagePlus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => startEdit(sweet)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(sweet._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!loading && filteredSweets.length > 0 && (
            <div className="p-6 border-t border-gray-700 bg-gray-700/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing {filteredSweets.length} of {sweets.length} items
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Filtered Value: <span className="font-bold text-pink-600 ml-1">
                      ₹{filteredSweets.reduce((sum, s) => sum + (s.price * s.quantity), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingSweet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-gray-100">Edit Sweet</h3>
              <p className="text-gray-600 text-sm mt-1">Update sweet details</p>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sweet Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                    editErrors.name 
                      ? "border-red-600 text-white focus:ring-red-500 focus:border-transparent bg-red-900/20" 
                      : "border-gray-600 bg-gray-700 text-gray-100 focus:ring-pink-500 focus:border-transparent"
                  }`}
                />
                {editErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{editErrors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  required
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                    editErrors.category 
                      ? "border-red-300 focus:ring-red-500 focus:border-transparent" 
                      : "border-gray-200 bg-gray-50 focus:ring-pink-500 focus:border-transparent"
                  }`}
                />
                {editErrors.category && (
                  <p className="mt-1 text-sm text-red-600">{editErrors.category}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                    required
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                      editErrors.price 
                        ? "border-red-300 focus:ring-red-500 focus:border-transparent" 
                        : "border-gray-200 bg-gray-50 focus:ring-pink-500 focus:border-transparent"
                    }`}
                  />
                  {editErrors.price && (
                    <p className="mt-1 text-sm text-red-600">{editErrors.price}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({...editForm, quantity: e.target.value})}
                    required
                    min="0"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                      editErrors.quantity 
                        ? "border-red-300 focus:ring-red-500 focus:border-transparent" 
                        : "border-gray-200 bg-gray-50 focus:ring-pink-500 focus:border-transparent"
                  }`}
                  />
                  {editErrors.quantity && (
                    <p className="mt-1 text-sm text-red-600">{editErrors.quantity}</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingSweet(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all font-medium"
                >
                  Update Sweet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <PackagePlus className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center">Restock Sweet</h3>
              <p className="text-gray-600 text-sm mt-2 text-center">
                Add more units to <span className="font-semibold">{showRestockModal.name}</span>
              </p>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Current Stock:</span>
                  <span className="font-semibold text-gray-900">{showRestockModal.quantity} units</span>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity to Add
                  </label>
                  <input
                    type="number"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(e.target.value)}
                    min="1"
                    placeholder="Enter quantity"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">New Total Stock:</span>
                    <span className="font-bold text-green-600">
                      {showRestockModal.quantity + (parseInt(restockQuantity) || 0)} units
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRestockModal(null);
                    setRestockQuantity("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestock}
                  disabled={restockLoading || !restockQuantity}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {restockLoading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Restocking...
                    </>
                  ) : (
                    "Confirm Restock"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center">Confirm Delete</h3>
              <p className="text-gray-600 text-sm mt-2 text-center">
                Are you sure you want to delete this sweet? This action cannot be undone.
              </p>
            </div>
            
            <div className="p-6">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-900">Mithai House</span>
            </div>
            
            <div className="flex gap-6 text-sm text-gray-600">
              <Link to="/" className="hover:text-pink-600 transition-colors">
                Home
              </Link>
              <Link to="/inventory" className="text-pink-600 font-semibold">
                Inventory
              </Link>
              <Link to="/purchases" className="hover:text-pink-600 transition-colors">
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