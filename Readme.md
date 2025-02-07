# MyBae E-commerce Platform

A modern, single-product e-commerce platform built with React, TypeScript, and Supabase. Features a beautiful UI, secure payment processing, admin dashboard, and real-time updates.

## 🚀 Features

- **Beautiful Single Product Showcase**
  - Image gallery with video support
  - Detailed product information
  - Customer reviews system
- **Secure Checkout Process**
  - Multi-step checkout flow
  - Address validation
  - Secure payment processing
- **Admin Dashboard**
  - Product management
  - Order tracking
  - Customer reviews moderation
  - Site settings configuration
- **Real-time Updates**
  - Instant order notifications
  - Live inventory tracking
  - Real-time review updates

## 🛠 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- A Supabase account

## 📦 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd mybae
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🗄️ Database Setup

1. Click the "Connect to Supabase" button in the top right corner of your project.

2. The migrations will automatically create the following tables:
   - products
   - site_settings
   - product_media
   - product_videos
   - site_assets
   - contact_messages
   - product_reviews
   - payment_information

## 🚀 Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Building for Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 📚 Tech Stack

- **Frontend**

  - React 18
  - TypeScript
  - Vite
  - Tailwind CSS
  - Lucide React (icons)
  - React Router DOM

- **Backend/Database**
  - Supabase (PostgreSQL)
  - Row Level Security (RLS)
  - Real-time subscriptions

## 📁 Project Structure

```
mybae/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   ├── lib/            # Utilities and configurations
│   └── data/           # Static data and types
├── public/             # Static assets
├── supabase/
│   └── migrations/     # Database migrations
└── ...config files
```

## 🔐 Authentication

The platform uses Supabase Authentication with the following features:

- Email/Password authentication for admin access
- Secure session management
- Protected admin routes

## 💳 Payment Processing

The payment system is configured to:

- Accept credit card payments
- Store payment information securely
- Process orders in real-time
- Send confirmation emails

## 🛡️ Security Features

- Row Level Security (RLS) policies for all tables
- Secure admin authentication
- Protected API endpoints
- Encrypted payment information
- XSS protection
- CSRF protection

## 🎨 Customization

### Site Settings

Through the admin panel, you can customize:

- Site name
- Logo
- Favicon
- Contact information
- Product details
- Media assets
  vite 5.4.8

### Styling

The project uses Tailwind CSS for styling. Customize the design by:

1. Modifying `tailwind.config.js`
2. Adding custom CSS in `src/index.css`
3. Updating component classes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For support, email admin@casivex.online or open an issue in the repository.
