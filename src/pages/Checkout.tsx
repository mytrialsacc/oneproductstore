import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, ChevronRight, ArrowLeft } from 'lucide-react';
import countries from '../data/countries';

interface CheckoutProduct {
  name: string;
  price: number;
  short_description: string;
  image: string;
}

interface ShippingForm {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product as CheckoutProduct;
  const [formData, setFormData] = useState<ShippingForm>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [errors, setErrors] = useState<Partial<ShippingForm>>({});

  if (!product) {
    navigate('/');
    return null;
  }

  const validateForm = () => {
    const newErrors: Partial<ShippingForm> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!formData.country) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      navigate('/payment', { 
        state: { 
          product,
          shippingDetails: formData
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white">
                  1
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-indigo-600">Step 1</p>
                  <p className="text-sm text-gray-500">Shipping</p>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-600">
                  2
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Step 2</p>
                  <p className="text-sm text-gray-500">Payment</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="h-0.5 w-full bg-gray-200"></div>
            </div>
            <div className="relative flex justify-start">
              <div className="h-0.5 w-1/2 bg-indigo-600"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Summary */}
          <div className="lg:order-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="flex items-start space-x-6">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-32 h-32 object-cover rounded-lg shadow-md"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                  <p className="mt-2 text-gray-600">{product.short_description}</p>
                  <p className="mt-4 text-3xl font-bold text-indigo-600">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                <dl className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">Subtotal</dt>
                    <dd className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">Shipping</dt>
                    <dd className="text-sm font-medium text-green-600">Free</dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <dt className="text-base font-medium text-gray-900">Total</dt>
                    <dd className="text-base font-medium text-gray-900">${product.price.toFixed(2)}</dd>
                  </div>
                </dl>
              </div>

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </button>
              </div>
            </div>
          </div>

          {/* Shipping Form */}
          <div className="lg:order-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className={`mt-1 block w-full rounded-lg border ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className={`mt-1 block w-full rounded-lg border ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`mt-1 block w-full rounded-lg border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`mt-1 block w-full rounded-lg border ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={`mt-1 block w-full rounded-lg border ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className={`mt-1 block w-full rounded-lg border ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      ZIP / Postal Code
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className={`mt-1 block w-full rounded-lg border ${
                        errors.zipCode ? 'border-red-500' : 'border-gray-300'
                      } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className={`mt-1 block w-full rounded-lg border ${
                        errors.country ? 'border-red-500' : 'border-gray-300'
                      } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
                    >
                      <option value="">Select a country</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    {errors.country && (
                      <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <span>Continue to Payment</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}