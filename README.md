# CarInsight Pro

CarInsight Pro is a car research and comparison platform built with React, Node.js, Express, and MongoDB. It allows users to browse car listings, compare specs, read community reviews, and get personalized recommendations.

## Features

- **Car Listings & Search** — Filter a database of cars by make, model, price, and specs.
- **Detailed Specs & Comparisons** — View full vehicle details and compare up to 3 cars side-by-side.
- **Community Reviews** — Users can leave detailed reviews and ratings based on performance, comfort, and value.
- **EV & Hybrid Hub** — A dedicated section for electric and hybrid vehicles.
- **Matchmaker Quiz** — An interactive quiz to help users find cars that fit their lifestyle.
- **Admin Panel** — A built-in CMS to manage inventory, users, reviews, and support tickets.
- **PDF Export** — Generate and download car comparison reports.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, React Router v6, Bootstrap 5
- **State & Data Fetching:** TanStack React Query (with route-level code splitting)
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB & Mongoose (with optimized query indexing)
- **Authentication:** JWT with HTTP-only cookies
- **Media:** Cloudinary for image hosting and automatic optimization
- **Email:** Brevo API for transactional emails
- **Testing:** Jest, Supertest (Backend API testing)
## Project Structure

```text
CarInsightPro/
├── client/                # React SPA
│   ├── public/
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Route views (Home, Cars, Admin, etc.)
│       ├── services/      # Axios API calls
│       └── utils/         # Formatting and PDF helpers
├── server/                # Express API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Auth & error handling
│   │   ├── models/        # Mongoose schemas
│   │   └── routes/        # API endpoints
│   └── package.json
└── README.md
```

## Local Development

### Prerequisites

- Node.js v18+
- MongoDB instance (local or Atlas)
- Cloudinary account

### 1. Clone the repository

```bash
git clone https://github.com/your-username/CarInsightPro.git
cd CarInsightPro
```

### 2. Environment Variables

Copy the `.env.example` files and add your API keys:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 4. Create an Admin Account

To access the admin dashboard, you'll need to seed an initial admin user:

```bash
cd server
npm run create-admin
```

### 5. Start the App

Run both the client and server in development mode:

```bash
# In the server directory (Port 5000)
npm run dev

# In a new terminal, in the client directory (Port 5173)
npm run dev
```

Visit `http://localhost:5173` to view the app.

## Testing

The backend test suite runs on Jest and Supertest, utilizing `mongodb-memory-server` to mock the database. This ensures tests run in an isolated in-memory environment without affecting real data.

```bash
cd server
npm test
```

## Deployment

The frontend is ready to be deployed on Vercel or Netlify. The Express backend can be hosted on a service like Railway or Render, connected to a MongoDB Atlas cluster.
