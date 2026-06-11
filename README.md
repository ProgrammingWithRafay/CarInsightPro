# CarInsight Pro

A premium, full-stack car research and comparison platform built with React, Node.js, Express, and MongoDB. 
Browse dynamic car listings, compare vehicles side-by-side, read community reviews, explore the EV Hub, take a tailored car recommendation quiz, and manage everything through a comprehensive Admin Panel.

---

## Features

- **Dynamic Car Listings** — Browse, search, and filter a curated database of cars directly from the database.
- **Car Detail Pages** — View full specs, telemetry data, and premium image galleries.
- **Side-by-Side Comparison** — Compare up to 3 vehicles across key metrics (Engine, Range, Price, etc.).
- **Reviews & Ratings** — Community-driven car reviews with a 1-5 star rating system across Style, Comfort, Fuel Economy/Battery, Performance, and Value.
- **EV & Hybrid Hub** — Dedicated section for electric and hybrid vehicle information.
- **Matchmaker Quiz** — Answer questions to get personalized vehicle recommendations.
- **Admin Panel** — Full CMS to manually add, edit, and delete cars, manage users, and track support tickets.
- **Authentication** — Secure JWT-based login/register with HTTP-only cookies.
- **Cloud Image Uploads** — Car images securely uploaded and managed via Cloudinary.
- **PDF Export** — Generate comparison reports as downloadable PDFs.
- **Continuous Integration** — GitHub Actions workflow checks TypeScript errors and ESLint rules automatically.

---

## Tech Stack

### Frontend (Client)
| Technology | Purpose |
|---|---|
| React 18 & TypeScript | Core UI framework and strict typing |
| Vite | Lightning-fast build tool |
| React Router v6 | Client-side routing with automatic scroll management |
| Bootstrap 5 & Custom CSS | Layouts, grids, and premium dark-mode styling |
| Recharts | Data visualization (Telemetry charts) |
| jsPDF | PDF generation for comparison reports |

### Backend (Server)
| Technology | Purpose |
|---|---|
| Node.js & Express | Server runtime and API framework |
| TypeScript | Type safety across endpoints |
| MongoDB + Mongoose | NoSQL Database & ODM |
| JSON Web Tokens (JWT) | Secure authentication |
| Cloudinary | Remote image hosting |
| Multer | File upload handling |

---

## Project Structure

```text
CarInsightPro/
├── .github/workflows/     # GitHub Actions CI pipeline
├── client/                # React Frontend
│   ├── public/
│   └── src/
│       ├── components/    # Reusable UI (Navbar, Footer, FilterSidebar, etc.)
│       ├── context/       # Auth and Toast Providers
│       ├── hooks/         # Custom React hooks
│       ├── pages/         # Full Views (Home, Admin, Cars, Compare, etc.)
│       ├── services/      # Axios API service handlers
│       ├── styles/        # Global CSS theme and design tokens
│       ├── types/         # TypeScript interfaces
│       └── utils/         # Formatting helpers
├── server/                # Express Backend
│   ├── src/
│   │   ├── config/        # Environment and DB config
│   │   ├── controllers/   # Route handlers for Cars, Users, Reviews
│   │   ├── data/          # Admin user creation scripts
│   │   ├── middleware/    # Auth verification and error boundaries
│   │   ├── models/        # Mongoose Database Schemas
│   │   ├── routes/        # API route definitions
│   │   └── server.ts      # Main Express application
│   └── package.json
└── README.md
```

---

## Getting Started (Local Development)

### Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB** (Atlas cloud or local instance)
- **Cloudinary** account (for image uploads)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/CarInsightPro.git
cd CarInsightPro
```

### 2. Set Up Environment Variables

Copy the example files and fill in your credentials. **Never push `.env` files to GitHub!**

```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.example client/.env
```

### 3. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 4. Create the Admin User

To access the Admin Panel, you need to create the initial admin account:

```bash
cd server
npm run create-admin
```

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

Visit **http://localhost:5173** in your browser. From there, log in with your Admin credentials and navigate to the Admin Panel to start adding vehicles.

---

## Deployment

This project is configured to be deployed using **Vercel** for the frontend client and **Railway** for the Express backend. The MongoDB database should be hosted on MongoDB Atlas.

---

## License

This project was built with dedication and passion as a hands-on learning journey into full-stack web development. It represents countless hours of effort, problem-solving, and growth as a developer.
