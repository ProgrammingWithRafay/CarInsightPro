# 🚗 CarInsight Pro

A full-stack car research and comparison platform built with React, Node.js, Express, and MongoDB. Browse car listings, compare vehicles side-by-side, read and write reviews, explore the EV Hub, take a car recommendation quiz, and much more.

---

## ✨ Features

- **Car Listings** — Browse, search, and filter a curated database of cars
- **Car Detail Pages** — View full specs, image galleries, and price history
- **Side-by-Side Comparison** — Compare multiple vehicles across key specs
- **Reviews & Ratings** — Community-driven car reviews with star ratings
- **EV Hub** — Dedicated section for electric vehicle information
- **Car Recommendation Quiz** — Answer questions to get personalized suggestions
- **User Dashboard** — Manage bookmarks, reviews, and profile settings
- **Admin Panel** — Manage cars, users, reviews, and support messages
- **Bookmarks** — Save cars for later viewing
- **Support System** — Submit and track support messages
- **Authentication** — JWT-based login/register with secure cookie handling
- **Cloud Image Uploads** — Car images stored on Cloudinary
- **Email Notifications** — Transactional emails via Brevo SMTP
- **PDF Export** — Generate comparison reports as PDF
- **CI/CD** — GitHub Actions workflow for continuous integration

---

## 🛠️ Tech Stack

### Frontend (Client)
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing |
| Bootstrap 5 | UI component library |
| Recharts | Data visualization |
| Axios | HTTP client |
| jsPDF | PDF generation |

### Backend (Server)
| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express | Web framework |
| TypeScript | Type safety |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication |
| Cloudinary | Image storage |
| Nodemailer + Brevo | Email service |
| Multer | File upload handling |
| Helmet | Security headers |
| Morgan | HTTP request logging |

---

## 📁 Project Structure

```
CarInsightPro/
├── .github/workflows/     # CI/CD pipeline
├── client/                # React frontend
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── context/       # React context providers
│       ├── hooks/         # Custom React hooks
│       ├── pages/         # Page-level components
│       │   ├── Admin/     # Admin panel pages
│       │   ├── Auth/      # Login & Register
│       │   ├── CarDetail/ # Individual car view
│       │   ├── Cars/      # Car listings
│       │   ├── Compare/   # Vehicle comparison
│       │   ├── Dashboard/ # User dashboard
│       │   ├── EVHub/     # Electric vehicle hub
│       │   ├── Home/      # Landing page
│       │   ├── Quiz/      # Car recommendation quiz
│       │   └── Static/    # About, Contact, etc.
│       ├── services/      # API service functions
│       ├── styles/        # CSS stylesheets
│       ├── types/         # TypeScript type definitions
│       └── utils/         # Utility functions
├── server/                # Express backend
│   ├── scripts/           # Utility scripts
│   └── src/
│       ├── config/        # Database & app configuration
│       ├── controllers/   # Route handlers
│       ├── data/          # Seed data & scripts
│       ├── middleware/    # Auth, error handling, etc.
│       ├── models/        # Mongoose schemas
│       │   ├── Car.ts
│       │   ├── User.ts
│       │   ├── Review.ts
│       │   ├── PriceHistory.ts
│       │   └── SupportMessage.ts
│       ├── routes/        # API route definitions
│       ├── types/         # TypeScript type definitions
│       ├── utils/         # Helper functions
│       └── server.ts      # App entry point
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB** (Atlas cloud or local instance)
- **Cloudinary** account (for image uploads)
- **Brevo** account (for transactional emails — optional)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/CarInsightPro.git
cd CarInsightPro
```

### 2. Set Up Environment Variables

Copy the example files and fill in your credentials:

```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.example client/.env
```

Edit both `.env` files with your actual values. See the `.env.example` files for required variables.

### 3. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 4. Seed the Database

```bash
cd server
npm run seed
```

This populates the database with initial car data and creates the default admin account.

### 5. Run the Development Servers

Open two terminal windows:

```bash
# Terminal 1 — Backend (runs on port 5000)
cd server
npm run dev

# Terminal 2 — Frontend (runs on port 5173)
cd client
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## 📡 API Endpoints

| Route Prefix | Description |
|---|---|
| `/api/auth` | Authentication (register, login, logout, profile) |
| `/api/cars` | Car CRUD operations and search |
| `/api/reviews` | Car reviews and ratings |
| `/api/bookmarks` | User bookmarks |
| `/api/admin` | Admin management endpoints |
| `/api/support` | Support message system |

---

## 🏗️ Build for Production

```bash
# Build the client
cd client
npm run build

# Build the server
cd server
npm run build
npm start
```

---

## 🚢 Deployment

- **Frontend**: Configured for [Vercel](https://vercel.com) — see `client/vercel.json`
- **Backend**: Configured for [Railway](https://railway.app) — see `server/railway.json`

---

## 📄 License

This project was built with dedication and passion as a hands-on learning journey into full-stack web development. It represents countless hours of effort, problem-solving, and growth as a developer.
