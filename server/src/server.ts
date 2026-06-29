// Main entry point for the Express server
import dns from 'dns';

// Force Node.js to use IPv4 first to prevent ENETUNREACH errors in Docker/Railway
// environments that do not have outbound IPv6 routing enabled.
dns.setDefaultResultOrder('ipv4first');

import { connectDB } from './config/db';
import app from './app';

const PORT = process.env.PORT || 5000;

// connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
