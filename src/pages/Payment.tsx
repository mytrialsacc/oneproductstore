import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Calendar, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import countries from '../data/countries';

interface PaymentProduct {
  name: string;
  price: number;
  image: string;
}

interface ShippingDetails {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface BillingForm {
  cardNumber: string;
  expiryDate: string;
  cvc: string;
  nameOnCard: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product as PaymentProduct;
  const shippingDetails = location.state?.shippingDetails as ShippingDetails;
  const [processing, setProcessing] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [formData, setFormData] = useState<BillingForm>({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    nameOnCard: '',
    address: shippingDetails?.address || '',
    city: shippingDetails?.city || '',
    state: shippingDetails?.state || '',
    zipCode: shippingDetails?.zipCode || '',
    country: shippingDetails?.country || ''
  });
  const [errors, setErrors] = useState<Partial<BillingForm>>({});

  if (!product || !shippingDetails) {
    navigate('/');
    return null;
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const validateForm = () => {
    const newErrors: Partial<BillingForm> = {};
    
    if (!formData.cardNumber.replace(/\s+/g, '').match(/^\d{16}$/)) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    if (!formData.expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }
    
    if (!formData.cvc.match(/^\d{3,4}$/)) {
      newErrors.cvc = 'Please enter a valid CVC';
    }
    
    if (!formData.nameOnCard.trim()) {
      newErrors.nameOnCard = 'Name on card is required';
    }

    if (!sameAsShipping) {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
      if (!formData.country) newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setProcessing(true);
      try {
        // Store payment information
        const { error } = await supabase
          .from('payment_information')
          .insert({
            order_id: `ORD-${Date.now()}`,
            card_number: formData.cardNumber.replace(/\s+/g, ''),
            card_expiry_month: formData.expiryDate.split('/')[0],
            card_expiry_year: formData.expiryDate.split('/')[1],
            card_cvc: formData.cvc,
            billing_name: formData.nameOnCard,
            billing_email: shippingDetails.email,
            billing_address: sameAsShipping ? shippingDetails.address : formData.address,
            billing_city: sameAsShipping ? shippingDetails.city : formData.city,
            billing_state: sameAsShipping ? shippingDetails.state : formData.state,
            billing_zip: sameAsShipping ? shippingDetails.zipCode : formData.zipCode,
            billing_country: sameAsShipping ? shippingDetails.country : formData.country,
            amount: product.price
          });

        if (error) {
          throw error;
        }

        // If successful, navigate to confirmation
        navigate('/confirmation');
      } catch (error: any) {
        console.error('Error saving payment information:', error.message);
        alert('Failed to process payment. Please try again.');
      } finally {
        setProcessing(false);
      }
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
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-white">
                  ✓
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Step 1</p>
                  <p className="text-sm text-gray-500">Shipping</p>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white">
                  2
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-indigo-600">Step 2</p>
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
              <div className="h-0.5 w-full bg-indigo-600"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
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
                  <p className="mt-4 text-3xl font-bold text-indigo-600">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Shipping Details */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900">Shipping Details</h3>
                <div className="mt-4 text-sm text-gray-600">
                  <p>{shippingDetails.firstName} {shippingDetails.lastName}</p>
                  <p>{shippingDetails.address}</p>
                  <p>{shippingDetails.city}, {shippingDetails.state} {shippingDetails.zipCode}</p>
                  <p>{countries.find(c => c.code === shippingDetails.country)?.name}</p>
                  <p>{shippingDetails.email}</p>
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
                  onClick={() => navigate(-1)}
                  className="flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Shipping
                </button>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:order-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Card Number
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({
                        ...formData,
                        cardNumber: formatCardNumber(e.target.value)
                      })}
                      maxLength={19}
                      placeholder="1234 5678 9012 3456"
                      className={`block w-full rounded-lg border ${
                        errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                      } pl-3 pr-10 py-2 focus:border-indigo-500 focus:ring-indigo-500`}
                    />
                    <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Expiry Date
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="text"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({
                          ...formData,
                          expiryDate: formatExpiryDate(e.target.value)
                        })}
                        maxLength={5}
                        placeholder="MM/YY"
                        className={`block w-full rounded-lg border ${
                          errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                        } pl-3 pr-10 py-2 focus:border-indigo-500 focus:ring-indigo-500`}
                      />
                      <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    {errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      CVC
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="text"
                        value={formData.cvc}
                        onChange={(e) => setFormData({
                          ...formData,
                          cvc: e.target.value.replace(/\D/g, '').slice(0, 4)
                        })}
                        maxLength={4}
                        placeholder="123"
                        className={`block w-full rounded-lg border ${
                          errors.cvc ? 'border-red-500' : 'border-gray-300'
                        } pl-3 pr-10 py-2 focus:border-indigo-500 focus:ring-indigo-500`}
                      />
                      <Lock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    {errors.cvc && (
                      <p className="mt-1 text-sm text-red-600">{errors.cvc}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    value={formData.nameOnCard}
                    onChange={(e) => setFormData({ ...formData, nameOnCard: e.target.value })}
                    className={`mt-1 block w-full rounded-lg border ${
                      errors.nameOnCard ? 'border-red-500' : 'border-gray-300'
                    } px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500`}
                  />
                  {errors.nameOnCard && (
                    <p className="mt-1 text-sm text-red-600">{errors.nameOnCard}</p>
                  )}
                </div>

                {/* Billing Address */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="sameAsShipping"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sameAsShipping" className="ml-2 text-sm text-gray-700">
                      Billing address is the same as shipping address
                    </label>
                  </div>

                  {!sameAsShipping && (
                    <div className="space-y-6">
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
                          } px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500`}
                        />
                        {errors.address && (
                          <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-6">
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
                            } px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500`}
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
                            } px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500`}
                          />
                          {errors.state && (
                            <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
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
                            } px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500`}
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
                            } px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500`}
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
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors"
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Complete Purchase'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}