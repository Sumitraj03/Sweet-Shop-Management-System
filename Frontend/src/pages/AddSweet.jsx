import { useState, useEffect } from "react";
import axios from "axios";
import { backend_url } from "../utils/constants";
import { Link, useNavigate } from "react-router-dom";
import { 
  Package, 
  ArrowLeft, 
  Plus,
  User, 
  LogOut,
  Tag,
  IndianRupee,
  Hash,
  CheckCircle
} from "lucide-react";

export default function AddSweet() {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    quantity: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = () => {
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

  const handleLogout = async () => {
    try {
      await axios.post(`${backend_url}/api/auth/logout`, {}, {
        withCredentials: true
      });
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
   
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Sweet name is required";
    }
    
    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }
    
    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (parseFloat(formData.price) < 0) {
      newErrors.price = "Price cannot be negative";
    } else if (parseFloat(formData.price) === 0) {
      newErrors.price = "Price must be greater than 0";
    }
    
    if (!formData.quantity) {
      newErrors.quantity = "Quantity is required";
    } else if (parseInt(formData.quantity) < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    } else if (parseInt(formData.quantity) === 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const sweetData = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      };

      const res = await axios.post(
        `${backend_url}/api/sweets`,
        sweetData,
        { withCredentials: true }
      );

      if (res.data.success) {
        setSuccess(true);
        setFormData({ name: "", category: "", price: "", quantity: "" });
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setErrors({ submit: res.data.message });
      }
    } catch (error) {
      setErrors({ 
        submit: error.response?.data?.message || "Failed to add sweet. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnother = () => {
    setFormData({ name: "", category: "", price: "", quantity: "" });
    setErrors({});
    setSuccess(false);
  };

  const popularCategories = [
    "Traditional",
    "Festival Special",
    "Dry Fruit Sweets",
    "Chocolate Based",
    "Sugar Free",
    "Mithai",
    "Laddu",
    "Barfi",
    "Halwa",
    "Chikki"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50/50 to-purple-50">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🍬</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
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
                    <p className="text-sm font-medium text-gray-700">{user.fullName}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all font-medium flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link to="/inventory" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Inventory
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Add New Sweet
              </h1>
              <p className="text-gray-600 mt-2">
                Add a new sweet item to your inventory
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-700">Sweet Added Successfully!</p>
                <p className="text-sm text-emerald-600 mt-1">
                  Your sweet has been added to inventory. You can view it in the inventory page.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-600">{errors.submit}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sweet Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sweet Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Gulab Jamun, Kaju Katli, Rasgulla"
                      className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 ${
                        errors.name 
                          ? "border-red-300 focus:ring-red-500 focus:border-transparent" 
                          : "border-gray-200 bg-gray-50 focus:ring-pink-500 focus:border-transparent"
                      }`}
                    />
                    <Package className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="e.g., Traditional, Festival, Dry Fruit"
                      className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 ${
                        errors.category 
                          ? "border-red-300 focus:ring-red-500 focus:border-transparent" 
                          : "border-gray-200 bg-gray-50 focus:ring-pink-500 focus:border-transparent"
                      }`}
                      list="categories"
                    />
                    <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                  <datalist id="categories">
                    {popularCategories.map((cat, index) => (
                      <option key={index} value={cat} />
                    ))}
                  </datalist>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

             
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 ${
                          errors.price 
                            ? "border-red-300 focus:ring-red-500 focus:border-transparent" 
                            : "border-gray-200 bg-gray-50 focus:ring-pink-500 focus:border-transparent"
                        }`}
                      />
                      <IndianRupee className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Price per kilogram
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Initial Stock *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 ${
                          errors.quantity 
                            ? "border-red-300 focus:ring-red-500 focus:border-transparent" 
                            : "border-gray-200 bg-gray-50 focus:ring-pink-500 focus:border-transparent"
                        }`}
                      />
                      <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                    {errors.quantity && (
                      <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      kgs available in stock
                    </p>
                  </div>
                </div>

              
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Adding Sweet...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Add Sweet to Inventory
                        </>
                      )}
                    </button>
                    
                    {success && (
                      <button
                        type="button"
                        onClick={handleAddAnother}
                        className="flex-1 px-6 py-3.5 border-2 border-purple-200 text-purple-700 rounded-xl hover:bg-purple-50 transition-all font-semibold"
                      >
                        Add Another Sweet
                      </button>
                    )}
                    
                    <Link
                      to="/inventory"
                      className="flex-1 px-6 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold text-center"
                    >
                      Cancel
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>

         
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-lg mb-4">Tips for Adding Sweets</h3>
                <ul className="space-y-3 text-sm opacity-90">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-white rounded-full mt-1.5"></div>
                    <span>Use descriptive names customers will recognize</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-white rounded-full mt-1.5"></div>
                    <span>Group similar sweets under common categories</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-white rounded-full mt-1.5"></div>
                    <span>Set competitive prices per kilogram</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-white rounded-full mt-1.5"></div>
                    <span>Start with reasonable stock quantities</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Popular Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {popularCategories.map((cat, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData({...formData, category: cat})}
                      className="px-3 py-1.5 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors text-sm"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Quick Stock Suggestions</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Small batch</span>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, quantity: "10"})}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-xs"
                    >
                      10 kgs
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Medium batch</span>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, quantity: "25"})}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-xs"
                    >
                      25 kgs
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Large batch</span>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, quantity: "50"})}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-xs"
                    >
                      50 kgs
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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