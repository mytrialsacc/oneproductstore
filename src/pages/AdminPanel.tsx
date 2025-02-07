import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useDropzone } from 'react-dropzone';
import { LogOut, Upload, Settings, Package, Image as ImageIcon, X, Mail, Star, CreditCard } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  short_description: string;
  long_description: string;
  meta_title: string;
  meta_description: string;
  in_stock: boolean;
  images: string[];
  video_url?: string;
}

interface SiteSettings {
  id: string;
  site_name: string;
  logo_url?: string;
  favicon_url?: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ContactMessage {
  id: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface Review {
  id: string;
  product_id: string;
  name: string;
  rating: number;
  comment: string;
  featured: boolean;
  created_at: string;
}

interface PaymentInfo {
  id: string;
  order_id: string;
  card_number: string;
  card_expiry_month: string;
  card_expiry_year: string;
  card_cvc: string;
  billing_name: string;
  billing_email: string;
  billing_phone: string | null;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_zip: string;
  billing_country: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('product');
  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchProduct();
    fetchSettings();
    fetchMessages();
    fetchReviews();
    fetchContactInfo();
    fetchPayments();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  async function fetchProduct() {
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .limit(1)
        .single();

      if (productError) throw productError;

      if (productData) {
        const { data: mediaData } = await supabase
          .from('product_media')
          .select('url')
          .eq('product_id', productData.id)
          .order('created_at', { ascending: true });

        const { data: videoData } = await supabase
          .from('product_videos')
          .select('url')
          .eq('product_id', productData.id)
          .limit(1);

        setProduct({
          ...productData,
          images: mediaData?.map(m => m.url) || [],
          video_url: videoData?.[0]?.url
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      showToast('Failed to fetch product data', 'error');
    }
  }

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        const { data: assetsData } = await supabase
          .from('site_assets')
          .select('type, url');

        const logo = assetsData?.find(a => a.type === 'logo');
        const favicon = assetsData?.find(a => a.type === 'favicon');

        setSettings({
          ...data,
          logo_url: logo?.url,
          favicon_url: favicon?.url
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showToast('Failed to fetch site settings', 'error');
    }
  }

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      showToast('Failed to fetch messages', 'error');
    }
  }

  async function fetchReviews() {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showToast('Failed to fetch reviews', 'error');
    }
  }

  async function fetchPayments() {
    try {
      const { data, error } = await supabase
        .from('payment_information')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      showToast('Failed to fetch payments', 'error');
    }
  }

  async function fetchContactInfo() {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('contact_info')
        .single();

      if (error) throw error;
      if (data?.contact_info) {
        setContactInfo(data.contact_info);
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      showToast('Failed to fetch contact info', 'error');
    }
  }

  const uploadFile = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onProductMediaDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!product) return;
    
    setUploadingMedia(true);
    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        const url = await uploadFile(file, 'product-media');
        
        await supabase
          .from('product_media')
          .insert({
            url,
            product_id: product.id
          });

        return url;
      });

      const newUrls = await Promise.all(uploadPromises);
      
      setProduct(prev => prev ? {
        ...prev,
        images: [...prev.images, ...newUrls]
      } : null);

      showToast(`Successfully uploaded ${acceptedFiles.length} image${acceptedFiles.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Error uploading files:', error);
      showToast('Failed to upload images', 'error');
    } finally {
      setUploadingMedia(false);
    }
  }, [product]);

  const onVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !product) return;

    setUploadingMedia(true);
    try {
      const videoUrl = await uploadFile(file, 'product-videos');

      await supabase
        .from('product_videos')
        .delete()
        .eq('product_id', product.id);

      await supabase
        .from('product_videos')
        .insert({
          url: videoUrl,
          product_id: product.id
        });

      setProduct({ ...product, video_url: videoUrl });
      showToast('Video uploaded successfully');
    } catch (error) {
      console.error('Error uploading video:', error);
      showToast('Failed to upload video', 'error');
    } finally {
      setUploadingMedia(false);
    }
  };

  const onLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !settings) return;

    setUploadingMedia(true);
    try {
      const logoUrl = await uploadFile(file, 'site-assets');

      await supabase
        .from('site_assets')
        .upsert({
          type: 'logo',
          url: logoUrl
        });

      setSettings({ ...settings, logo_url: logoUrl });
      showToast('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      showToast('Failed to upload logo', 'error');
    } finally {
      setUploadingMedia(false);
    }
  };

  const onFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !settings) return;

    setUploadingMedia(true);
    try {
      const faviconUrl = await uploadFile(file, 'site-assets');

      await supabase
        .from('site_assets')
        .upsert({
          type: 'favicon',
          url: faviconUrl
        });

      setSettings({ ...settings, favicon_url: faviconUrl });
      showToast('Favicon uploaded successfully');
    } catch (error) {
      console.error('Error uploading favicon:', error);
      showToast('Failed to upload favicon', 'error');
    } finally {
      setUploadingMedia(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: onProductMediaDrop
  });

  async function handleSaveProduct() {
    if (!product) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .upsert({
          ...product,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      showToast('Product saved successfully');
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveSettings() {
    if (!settings) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          ...settings,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      showToast('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveContactInfo() {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          contact_info: contactInfo,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings?.id);

      if (error) throw error;
      showToast('Contact information saved successfully');
    } catch (error) {
      console.error('Error saving contact info:', error);
      showToast('Failed to save contact information', 'error');
    }
  }

  async function toggleReviewFeatured(review: Review) {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ featured: !review.featured })
        .eq('id', review.id);

      if (error) throw error;
      await fetchReviews();
      showToast(`Review ${review.featured ? 'unfeatured' : 'featured'} successfully`);
    } catch (error) {
      console.error('Error updating review:', error);
      showToast('Failed to update review', 'error');
    }
  }

  async function markMessageAsRead(message: ContactMessage) {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ read: true })
        .eq('id', message.id);

      if (error) throw error;
      await fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
      showToast('Failed to mark message as read', 'error');
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/mybae/login');
  }

  if (!product || !settings) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center justify-between p-4 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white min-w-[200px]`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-4 hover:opacity-75"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('product')}
              className={`${
                activeTab === 'product'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Package className="h-5 w-5 mr-2" />
              Product Management
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`${
                activeTab === 'settings'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Settings className="h-5 w-5 mr-2" />
              Site Settings
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`${
                activeTab === 'messages'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Mail className="h-5 w-5 mr-2" />
              Messages
              {messages.filter(m => !m.read).length > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                  {messages.filter(m => !m.read).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`${
                activeTab === 'reviews'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Star className="h-5 w-5 mr-2" />
              Reviews
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`${
                activeTab === 'payments'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Payments
            </button>
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
          {activeTab === 'product' ? (
            <form className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => setProduct({ ...product, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price
                    </label>
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Description</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Short Description
                  </label>
                  <textarea
                    value={product.short_description}
                    onChange={(e) => setProduct({ ...product, short_description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Long Description
                  </label>
                  <textarea
                    value={product.long_description}
                    onChange={(e) => setProduct({ ...product, long_description: e.target.value })}
                    rows={6}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">SEO</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={product.meta_title}
                    onChange={(e) => setProduct({ ...product, meta_title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Meta Description
                  </label>
                  <textarea
                    value={product.meta_description}
                    onChange={(e) => setProduct({ ...product, meta_description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Media</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Video Upload
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={onVideoUpload}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                  {product.video_url && (
                    <div className="mt-2">
                      <video
                        src={product.video_url}
                        controls
                        className="max-w-xs rounded"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
                  </label>
                  <div
                    {...getRootProps()}
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
                      uploadingMedia ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300'
                    } border-dashed rounded-md`}
                  >
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <input {...getInputProps()} />
                        <p>Drag and drop images here, or click to select files</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {product.images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
                          className="h-24 w-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await supabase
                                .from('product_media')
                                .delete()
                                .eq('url', url);

                              const newImages = [...product.images];
                              newImages.splice(index, 1);
                              setProduct({ ...product, images: newImages });
                              showToast('Image deleted successfully');
                            } catch (error) {
                              console.error('Error deleting image:', error);
                              showToast('Failed to delete image', 'error');
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Availability</h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={product.in_stock}
                    onChange={(e) => setProduct({ ...product, in_stock: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    In Stock
                  </label>
                </div>
              </div>

              <div className="pt-5">
                <button
                  type="button"
                  onClick={handleSaveProduct}
                  disabled={saving || uploadingMedia}
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : activeTab === 'settings' ? (
            <form className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Site Settings</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.site_name}
                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onLogoUpload}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                  {settings.logo_url && (
                    <div className="mt-2">
                      <img
                        src={settings.logo_url}
                        alt="Site Logo"
                        className="h-12 object-contain"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Favicon
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onFaviconUpload}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                  {settings.favicon_url && (
                    <div className="mt-2">
                      <img
                        src={settings.favicon_url}
                        alt="Favicon"
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                 ```
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    value={contactInfo.address}
                    onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="pt-5">
                  <button
                    type="button"
                    onClick={handleSaveContactInfo}
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save Contact Information
                  </button>
                </div>
              </div>

              <div className="pt-5">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={saving || uploadingMedia}
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          ) : activeTab === 'messages' ? (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Contact Messages</h3>
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Email
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Message
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {messages.map((message) => (
                      <tr key={message.id} className={message.read ? 'bg-gray-50' : ''}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {message.email}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {message.message}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(message.created_at).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {message.read ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Read
                            </span>
                          ) : (
                            <button
                              onClick={() => markMessageAsRead(message)}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            >
                              Mark as Read
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'reviews' ? (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Product Reviews</h3>
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Rating
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Comment
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Featured
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {reviews.map((review) => (
                      <tr key={review.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {review.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex text-yellow-400">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-current" />
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {review.comment}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <button
                            onClick={() => toggleReviewFeatured(review)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              review.featured
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {review.featured ? 'Featured' : 'Not Featured'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'payments' ? (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Payment Information</h3>
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Order ID
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Card Details
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Billing Info
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Amount
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {payment.order_id}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <div>
                            <p>Number: {payment.card_number}</p>
                            <p>Expiry: {payment.card_expiry_month}/{payment.card_expiry_year}</p>
                            <p>CVC: {payment.card_cvc}</p>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <div>
                            <p>{payment.billing_name}</p>
                            <p>{payment.billing_email}</p>
                            <p>{payment.billing_address}</p>
                            <p>{payment.billing_city}, {payment.billing_state} {payment.billing_zip}</p>
                            <p>{payment.billing_country}</p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          ${payment.amount.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}