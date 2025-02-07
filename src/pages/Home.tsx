import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight, Play, Pause, Star, Shield, Award, Truck, Clock, X, Menu, Phone, Mail, MapPin, Heart, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  short_description: string;
  long_description: string;
  in_stock: boolean;
  images: string[];
  video_url?: string;
}

interface SiteSettings {
  site_name: string;
  logo_url?: string;
  favicon_url?: string;
}

interface ContactMessage {
  email: string;
  message: string;
}

interface ReviewForm {
  name: string;
  rating: number;
  comment: string;
}

interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
  featured: boolean;
}

const trustBadges = [
  {
    icon: Shield,
    title: "Secure Payment",
    description: "256-bit SSL encryption"
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over $50"
  },
  {
    icon: Clock,
    title: "30-Day Returns",
    description: "Money-back guarantee"
  },
  {
    icon: Award,
    title: "Quality Assured",
    description: "100% satisfaction guaranteed"
  }
];

export default function Home() {
  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [contactForm, setContactForm] = useState<ContactMessage>({
    email: '',
    message: ''
  });
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    name: '',
    rating: 5,
    comment: ''
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  const navigate = useNavigate();

  const handleBuyNow = () => {
    if (!product) return;
    
    navigate('/checkout', {
      state: {
        product: {
          name: product.name,
          price: product.price,
          short_description: product.short_description,
          image: product.images[0]
        }
      }
    });
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch product data
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .limit(1)
          .single();

        if (productError) throw productError;

        // Fetch settings data
        const { data: settingsData, error: settingsError } = await supabase
          .from('site_settings')
          .select('*')
          .limit(1)
          .single();

        if (settingsError) throw settingsError;

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('product_reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;

        if (productData) {
          setProduct(productData);
        }
        if (settingsData) {
          setSettings(settingsData);
          if (settingsData.favicon_url) {
            const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
            if (favicon) {
              favicon.href = settingsData.favicon_url;
            }
          }
          if (settingsData.site_name) {
            document.title = settingsData.site_name;
          }
        }
        if (reviewsData) {
          setReviews(reviewsData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && !isVideoPlaying && product) {
      interval = setInterval(() => {
        const mediaItems = [...product.images, ...(product.video_url ? [product.video_url] : [])];
        setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length);
      }, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, isVideoPlaying, product]);

  const getMediaItems = (product: Product): MediaItem[] => {
    const items: MediaItem[] = product.images.map(url => ({ type: 'image', url }));
    if (product.video_url) {
      items.push({ type: 'video', url: product.video_url });
    }
    return items;
  };

  const handlePrevMedia = () => {
    if (!product) return;
    const mediaItems = getMediaItems(product);
    setCurrentMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const handleNextMedia = () => {
    if (!product) return;
    const mediaItems = getMediaItems(product);
    setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      const { error } = await supabase
        .from('product_reviews')
        .insert([{
          product_id: product.id,
          ...reviewForm
        }]);

      if (error) throw error;

      // Fetch updated reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('product_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      
      if (reviewsData) {
        setReviews(reviewsData);
      }

      setReviewForm({
        name: '',
        rating: 5,
        comment: ''
      });
      setShowReviewForm(false);
      alert('Thank you for your review!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveSection(sectionId);
    setIsMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600">Something went wrong. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!product || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Product Found</h2>
          <p className="text-gray-600">Please check back later.</p>
        </div>
      </div>
    );
  }

  const mediaItems = getMediaItems(product);
  const currentMedia = mediaItems[currentMediaIndex];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt={settings.site_name} className="h-10 w-auto" />
            ) : (
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-indigo-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                  {settings?.site_name}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {['home', 'about', 'contact'].map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`text-sm font-medium relative group ${
                  activeSection === section ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
                <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-indigo-600 transform origin-left transition-transform duration-300 ${
                  activeSection === section ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-lg">
            <div className="px-4 py-2 space-y-1">
              {['home', 'about', 'contact'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`block w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === section
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section id="home" className="relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center p-6 bg-white rounded-xl shadow-lg shadow-indigo-100/20 hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <badge.icon className="h-8 w-8 text-indigo-600 flex-shrink-0" />
                  <div className="ml-4">
                    <h3 className="text-sm font-semibold text-gray-900">{badge.title}</h3>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Product Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Media Gallery */}
              <div className="space-y-4">
                <div className="relative group">
                  <div className="aspect-w-1 aspect-h-1 rounded-2xl overflow-hidden bg-gray-100 shadow-xl">
                    {currentMedia.type === 'image' ? (
                      <img
                        src={currentMedia.url}
                        alt={product?.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <video
                        src={currentMedia.url}
                        controls
                        className="w-full h-full object-cover"
                        onPlay={() => setIsVideoPlaying(true)}
                        onPause={() => setIsVideoPlaying(false)}
                        onEnded={() => {
                          setIsVideoPlaying(false);
                          handleNextMedia();
                        }}
                      />
                    )}
                  </div>

                  {/* Navigation Controls */}
                  <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={handlePrevMedia}
                      className="p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transform hover:scale-110 transition-all"
                    >
                      <ChevronLeft className="h-6 w-6 text-gray-800" />
                    </button>
                    <button
                      onClick={handleNextMedia}
                      className="p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transform hover:scale-110 transition-all"
                    >
                      <ChevronRight className="h-6 w-6 text-gray-800" />
                    </button>
                  </div>

                  {/* Autoplay Control */}
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="absolute bottom-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6 text-gray-800" />
                    ) : (
                      <Play className="h-6 w-6 text-gray-800" />
                    )}
                  </button>
                </div>

                {/* Thumbnails */}
                <div className="grid grid-cols-6 gap-2">
                  {mediaItems.map((media, index) => (
                    <button
                      key={media.url}
                      onClick={() => setCurrentMediaIndex(index)}
                      className={`relative aspect-w-1 aspect-h-1 rounded-lg overflow-hidden ${
                        currentMediaIndex === index
                          ? 'ring-2 ring-indigo-500 ring-offset-2'
                          : 'hover:opacity-75'
                      } transform hover:scale-105 transition-all`}
                    >
                      {media.type === 'image' ? (
                        <img
                          src={media.url}
                          alt={`${product?.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Play className="h-6 w-6 text-gray-600" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                    {product?.name}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      Based on {reviews.length} reviews
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-4">
                    <p className="text-4xl font-bold text-indigo-600">
                      ${product?.price.toFixed(2)}
                    </p>
                    <span className="text-lg text-gray-500 line-through">
                      ${(product?.price ? product.price * 1.2 : 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p className="text-lg text-gray-600">{product?.short_description}</p>
                  <div
                    className="mt-6"
                    dangerouslySetInnerHTML={{ __html: product?.long_description || '' }}
                  />
                </div>

                <button
                  disabled={!product?.in_stock}
                  onClick={handleBuyNow}
                  className={`w-full py-4 px-8 rounded-xl text-white text-lg font-semibold transition-all transform hover:scale-[1.02] ${
                    product?.in_stock
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {product?.in_stock ? 'Buy Now - Free Shipping!' : 'Out of Stock'}
                </button>

                <p className="text-sm text-center text-gray-500">
                  🔒 Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-24 bg-gradient-to-b from-white to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">About Us</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Welcome to {settings?.site_name}, where quality meets excellence. We're dedicated to 
                providing exceptional products and outstanding customer service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <MapPin className="h-10 w-10 text-indigo-600 mb-6" />
                <h3 className="text-xl font-semibold mb-4">Visit Us</h3>
                <p className="text-gray-600">153 Joralemon St APT 3R, Brooklyn, NY 11201</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <Mail className="h-10 w-10 text-indigo-600 mb-6" />
                <h3 className="text-xl font-semibold mb-4">Email Us</h3>
                <a 
                  href="mailto:admin@casivex.online" 
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  admin@casivex.online
                </a>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <Phone className="h-10 w-10 text-indigo-600 mb-6" />
                <h3 className="text-xl font-semibold mb-4">Call Us</h3>
                <a 
                  href="tel:5802605403" 
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  580 260 5403
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>

            <div className="max-w-xl mx-auto">
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const { error } = await supabase
                    .from('contact_messages')
                    .insert([contactForm]);

                  if (error) throw error;

                  setContactForm({ email: '', message: '' });
                  alert('Message sent successfully!');
                } catch (error) {
                  console.error('Error sending message:', error);
                  alert('Failed to send message. Please try again.');
                }
              }} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-24 bg-gradient-to-b from-indigo-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Customer Reviews</h2>
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Write a Review
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold text-gray-900">{review.name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>

            {showReviewForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
                    <button
                      onClick={() => setShowReviewForm(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={handleReviewSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Rating
                      </label>
                      <div className="flex space-x-2 mt-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating })}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                rating <= reviewForm.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Comment
                      </label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        rows={4}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-6 rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                      Submit Review
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white">
          {/* Main Footer */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Heart className="h-6 w-6 text-indigo-400" />
                  <span className="text-xl font-bold">{settings?.site_name}</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Experience excellence in every product. We're dedicated to bringing you the best quality and service.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a href="#" className="text- -gray-400 hover:text-white transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Youtube className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <button 
                      onClick={() => scrollToSection('home')}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Home
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('about')}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      About Us
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('contact')}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Contact
                    </button>
                  </li>
                  <li>
                    <a href="#reviews" className="text-gray-400 hover:text-white transition-colors">
                      Reviews
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-400">153 Joralemon St APT 3R, Brooklyn, NY 11201</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                    <a 
                      href="tel:5802605403" 
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      580 260 5403
                    </a>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                    <a 
                      href="mailto:admin@casivex.online"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      admin@casivex.online
                    </a>
                  </li>
                </ul>
              </div>

              {/* Newsletter */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Subscribe to our newsletter for updates and exclusive offers.
                </p>
                <form className="space-y-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
              <p>&copy; {new Date().getFullYear()} {settings?.site_name}. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}