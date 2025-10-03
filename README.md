# Canim E-commerce

Full-stack e-commerce application built with Next.js frontend and Node.js backend.

## 🚀 Features

- 🛍️ Product catalog with search and filtering
- 🛒 Shopping cart functionality
- 👤 User authentication and profiles
- 💳 Payment processing integration
- 📊 Admin dashboard with analytics
- 📱 Fully responsive design
- 🔐 Role-based access control (Admin, Seller, Buyer)
- 📧 Email notifications
- 🖼️ Image upload with Cloudinary

## 🛠️ Tech Stack

**Frontend:**
- Next.js 13+ (App Router)
- Tailwind CSS
- Redux Toolkit (RTK Query)
- React Hot Toast

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Cloudinary (Image storage)
- Nodemailer (Email service)

## 📋 Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Gmail account (for email service)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/canim-ecommerce.git
cd canim-ecommerce
```

### 2. Server Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your actual credentials
npm start
```

### 3. Client Setup
```bash
cd client
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
npm run dev
```

### 4. Access the application
- Frontend: http://localhost:3000
