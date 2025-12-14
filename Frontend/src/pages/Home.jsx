import { useEffect, useState } from "react";
import axios from "axios";
import { backend_url } from "../utils/constants";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Package, TrendingUp, Star, ChevronRight, Sparkles, User, LogOut, Plus, Minus, CheckCircle } from "lucide-react";

export default function Home() {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [purchasingSweetId, setPurchasingSweetId] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSweets();
    checkUser();
  }, []);

  const fetchSweets = async () => {
    try {
      const res = await axios.get(`${backend_url}/api/sweets`, {
        withCredentials: true,
      });
      setSweets(res.data.sweets || []);
      
      const initialQuantities = {};
      res.data.sweets?.forEach(sweet => {
        initialQuantities[sweet._id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (error) {
      console.error("Error fetching sweets", error);
    } finally {
      setLoading(false);
    }
  };

  const checkUser = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error checking user:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${backend_url}/api/auth/logout`, {}, {
        withCredentials: true
      });
      localStorage.removeItem('user');
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleQuantityChange = (sweetId, action) => {
    setQuantities(prev => {
      const current = prev[sweetId] || 1;
      let newQuantity = current;
      
      if (action === 'increment') {
        newQuantity = current + 1;
      } else if (action === 'decrement') {
        newQuantity = Math.max(1, current - 1);
      }
      
      return {
        ...prev,
        [sweetId]: newQuantity
      };
    });
  };

  const handlePurchase = async (sweet) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const quantity = quantities[sweet._id] || 1;
    
    if (quantity > sweet.quantity) {
      alert(`Only ${sweet.quantity} kgs available in stock`);
      return;
    }

    setPurchasingSweetId(sweet._id);

    try {
      const res = await axios.post(
        `${backend_url}/api/sweets/${sweet._id}/purchase`,
        { quantity },
        { withCredentials: true }
      );

      if (res.data.success) {
        // Show success message
        setSuccessMessage(`Successfully purchased ${quantity} x ${sweet.name} for ₹${(sweet.price * quantity).toFixed(2)}`);
        setShowSuccessMessage(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
          setSuccessMessage("");
        }, 3000);

        // Update local state immediately for better UX
        setSweets(prevSweets => 
          prevSweets.map(s => 
            s._id === sweet._id 
              ? { ...s, quantity: s.quantity - quantity }
              : s
          )
        );

        // Reset quantity for this sweet
        setQuantities(prev => ({
          ...prev,
          [sweet._id]: 1
        }));

        // You could also refetch to get latest data
        setTimeout(() => {
          fetchSweets();
        }, 500);
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Purchase failed";
      alert(errorMsg);
      
      // If purchase fails, refresh sweets to get accurate stock
      fetchSweets();
    } finally {
      setPurchasingSweetId(null);
    }
  };

  const filteredSweets = sweets.filter(sweet =>
    sweet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sweet.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalSweets: sweets.length,
    totalStock: sweets.reduce((sum, sweet) => sum + sweet.quantity, 0),
    totalValue: sweets.reduce((sum, sweet) => sum + (sweet.price * sweet.quantity), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Success Message Toast */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-xl p-4 max-w-md">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5" />
              <div>
                <p className="font-semibold">Purchase Successful!</p>
                <p className="text-sm opacity-90">{successMessage}</p>
                <p className="text-xs mt-1 opacity-80">View your orders in Purchases page</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">🍬</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Mithai House
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 font-medium">
            <Link to="/" className="text-gray-300 hover:text-pink-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-800">
              Home
            </Link>
            <Link to="/inventory" className="text-gray-300 hover:text-pink-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-800">
              Inventory
            </Link>
            <Link to="/purchases" className="text-gray-300 hover:text-pink-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-800">
              Purchases
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-700">{user.fullName}</p>
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
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl border border-purple-600 text-purple-400 hover:bg-gray-800 transition-all font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6">
        <section className="py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-950 to-purple-950 text-pink-300 px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold text-sm">
                  {user ? `Welcome back, ${user.fullName}!` : 'Premium Sweets Collection'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-100 leading-tight mb-6">
                {user ? (
                  <>
                    Welcome to Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Dashboard</span>
                  </>
                ) : (
                  <>
                    Taste the <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Authentic</span> Sweetness
                  </>
                )}
              </h1>
              
              <p className="text-lg text-gray-400 mb-8 max-w-xl">
                {user ? (
                  user.role === 'admin' 
                    ? 'Manage your inventory, track purchases, and oversee your sweet shop operations.'
                    : 'Browse our collection of traditional sweets and make your purchases with ease.'
                ) : (
                  'Discover handcrafted traditional sweets, manage inventory seamlessly, and experience modern sweet shop management.'
                )}
              </p>
              
              <div className="flex flex-wrap gap-4">
                {user ? (
                  user.role === 'admin' ? (
                    <>
                      <Link
                        to="/inventory"
                        className="px-8 py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold inline-flex items-center gap-2"
                      >
                        Manage Inventory
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                      <Link
                        to="/purchases"
                        className="px-8 py-3.5 border-2 border-purple-500 text-purple-300 rounded-xl hover:bg-purple-950 transition-all font-semibold inline-flex items-center gap-2"
                      >
                        View Purchases
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </>
                  ) : (
                    <>
                      <button
                        className="px-8 py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold inline-flex items-center gap-2"
                        onClick={() => document.getElementById('sweet-grid').scrollIntoView({ behavior: 'smooth' })}
                      >
                        Shop Now
                        <ShoppingBag className="w-5 h-5" />
                      </button>
                      <Link
                        to="/purchases"
                        className="px-8 py-3.5 border-2 border-purple-500 text-purple-300 rounded-xl hover:bg-purple-950 transition-all font-semibold inline-flex items-center gap-2"
                      >
                        My Orders
                        <Package className="w-5 h-5" />
                      </Link>
                    </>
                  )
                ) : (
                  <>
                    <Link
                      to="/inventory"
                      className="px-8 py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold inline-flex items-center gap-2"
                    >
                      Explore Inventory
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                    <button className="px-8 py-3.5 border-2 border-purple-500 text-purple-300 rounded-xl hover:bg-purple-950 transition-all font-semibold">
                      Watch Demo
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-3xl blur-2xl opacity-20"></div>
              <div className="relative bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <Search className="w-5 h-5 text-purple-400" />
                  <h3 className="text-xl font-semibold text-gray-200">
                    {user ? 'Quick Search' : 'Find Your Favorite Sweet'}
                  </h3>
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search sweets by name or category..."
                    className="w-full pl-12 pr-4 py-4 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-100 placeholder-gray-500"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{stats.totalSweets}</div>
                  <div className="text-sm opacity-90">Total Sweets</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{stats.totalStock}</div>
                  <div className="text-sm opacity-90">Items in Stock</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-3xl font-bold">₹{stats.totalValue.toLocaleString()}</div>
                  <div className="text-sm opacity-90">Total Stock Value</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="sweet-grid" className="mb-20">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Our Sweet Collection</h2>
              <p className="text-gray-600">Freshly made with traditional recipes</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{filteredSweets.length} items</span>
              {user && user.role === 'admin' && (
                <Link
                  to="/add"
                  className="ml-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all text-sm font-medium"
                >
                  + Add New
                </Link>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
              <p className="mt-4 text-gray-600">Loading sweets...</p>
            </div>
          ) : filteredSweets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No sweets found</h3>
              <p className="text-gray-500 mb-6">Try a different search term</p>
              {user && user.role === 'admin' && (
                <Link
                  to="/add"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all font-medium"
                >
                  Add Your First Sweet
                </Link>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSweets.map((sweet) => (
                <div
                  key={sweet._id}
                  className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:border-pink-100 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                        {sweet.name}
                      </h3>
                      <span className="inline-block mt-2 px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm font-medium">
                        {sweet.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-gray-700">4.8</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Price per kg</span>
                      <span className="font-semibold text-gray-900">₹{sweet.price}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Stock Available</span>
                      <span className={`font-semibold ${sweet.quantity > 10 ? 'text-green-600' : sweet.quantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                        {sweet.quantity} kgs
                      </span>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Quantity:</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityChange(sweet._id, 'decrement')}
                            disabled={quantities[sweet._id] <= 1}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-semibold">
                            {quantities[sweet._id] || 1}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(sweet._id, 'increment')}
                            disabled={quantities[sweet._id] >= sweet.quantity}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total:</span>
                        <span className="font-bold text-lg text-pink-600">
                          ₹{(sweet.price * (quantities[sweet._id] || 1)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(sweet)}
                    disabled={sweet.quantity === 0 || purchasingSweetId === sweet._id}
                    className={`mt-6 w-full py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      sweet.quantity > 0
                        ? purchasingSweetId === sweet._id
                          ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white cursor-wait"
                          : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {purchasingSweetId === sweet._id ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : sweet.quantity > 0 ? (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        Purchase Now
                      </>
                    ) : (
                      "Out of Stock"
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {!user && (
          <section className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl p-8 md:p-12 mb-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Ready to Manage Your Sweet Shop?
              </h2>
              <p className="text-gray-600 mb-8">
                Join hundreds of sweet shop owners using our platform for seamless inventory and sales management.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/signup"
                  className="px-8 py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3.5 border-2 border-purple-200 text-purple-700 rounded-xl hover:bg-purple-50 transition-all font-semibold"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>

      <footer className="bg-white border-t border-gray-100">
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
              <Link to="/inventory" className="hover:text-pink-600 transition-colors">
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