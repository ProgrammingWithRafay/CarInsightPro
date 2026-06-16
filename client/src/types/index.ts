export interface CarSpecs {
  engine?: string;
  horsepower?: string;
  torque?: string;
  displacement?: number;
  cylinders?: number;
  drivetrain?: string;
  mileage_city?: number;
  mileage_highway?: number;
  mileage?: string; // e.g. "14 - 22 KM/L"
  dimensions?: string; // e.g. "4500 x 1800 x 1450 mm"
  groundClearance?: string; // mm
  bootSpace?: string; // liters
  kerbWeight?: string; // e.g. "995 - 1050 KG"
  fuelTankCapacity?: string; // liters
  topSpeed?: string; // km/h
  tyreSize?: string;
  seats?: number;
  batteryCapacity?: string; // kWh
  chargingTime?: number; // hours
  range?: string; // km
  // Legacy
  cargoSpace?: number;
  curbWeight?: number;
}

export interface Car {
  _id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  priceMax?: number;
  description?: string;
  bodyType?: string;
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric' | 'Petrol & Hybrid';
  transmission: 'Automatic' | 'Manual' | 'Manual & Automatic';
  specs: CarSpecs;
  safetyRating: number;
  images: string[];
  avgRating: number;
  reviewCount: number;
  views: number;
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  rank: 'Bronze' | 'Silver' | 'Gold';
  avatar: string;
  bookmarks: string[];
  isBlocked: boolean;
  createdAt: string;
}

export interface SubScores {
  style: number;
  comfort: number;
  fuelEconomy: number;
  performance: number;
  valueMoney: number;
}

export interface Review {
  _id: string;
  car: string | Car;
  user: string | User;
  title: string;
  rating: number;
  subScores: SubScores;
  comment: string;
  helpful: string[];
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FilterState {
  brand: string[];
  yearMin: number | '';
  yearMax: number | '';
  priceMin: number | '';
  priceMax: number | '';
  fuelType: string[];
  transmission: string;
  sortBy: string;
  search: string;
  page: number;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

export interface AdminStats {
  totalCars: number;
  totalUsers: number;
  totalReviews: number;
  totalTickets: number;
}
