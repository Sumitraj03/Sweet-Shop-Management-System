import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { backend_url } from '../utils/constants';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        fullname: formData.fullname,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      const res = await axios.post(
        `${backend_url}/api/auth/register`,
        userData,
        { withCredentials: true }
      );

      if (res.data.success) {
        // Auto-login after registration
        const loginRes = await axios.post(
          `${backend_url}/api/auth/login`,
          { email: formData.email, password: formData.password },
          { withCredentials: true }
        );

        if (loginRes.data.success) {
          localStorage.setItem('user', JSON.stringify(loginRes.data.user));
          
          if (loginRes.data.user.role === 'admin') {
            navigate('/inventory');
          } else {
            navigate('/');
          }
        }
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">🍬</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Mithai House
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-100 mb-3">
            Create Account
          </h1>
          <p className="text-gray-400">
            Join us to manage your sweet shop
          </p>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-100 placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-100 placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'customer'})}
                  className={`py-3.5 rounded-xl border transition-all font-medium ${
                    formData.role === 'customer'
                      ? 'border-pink-500 bg-pink-900/30 text-pink-300'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'admin'})}
                  className={`py-3.5 rounded-xl border transition-all font-medium ${
                    formData.role === 'admin'
                      ? 'border-purple-500 bg-purple-900/30 text-purple-300'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Admin
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Admin accounts can manage inventory and view all purchases
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-100 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Must be at least 6 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-100 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-400"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 text-pink-600 border-gray-600 rounded focus:ring-pink-500 bg-gray-700"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-400">
                I agree to the{' '}
                <Link to="/terms" className="text-pink-400 hover:text-pink-300 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-pink-400 hover:text-pink-300 font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-pink-400 hover:text-pink-300 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}