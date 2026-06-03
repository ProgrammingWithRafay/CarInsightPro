export interface CarSpecs {
  engine: string;
  horsepower: number;
  torque: number;
  displacement: number;
  cylinders: number;
  drivetrain: string;
  mileage_city: number;
  mileage_highway: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    wheelbase: number;
  };
  cargoSpace: number;
  curbWeight: number;
  seats?: number;
  batteryCapacity?: number; // kWh
  chargingTime?: number; // hours
  range?: number; // miles
}

export interface Car {
  _id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  transmission: 'Automatic' | 'Manual';
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
  avatar: string;
  bookmarks: string[];
  isBlocked: boolean;
  createdAt: string;
}

export interface SubScores {
  comfort: number;
  reliability: number;
  fuelEconomy: number;
  valueMoney: number;
  resaleValue: number;
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
  safetyRating: number | '';
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
  totalReports: number;
  carsTrend: number;
  usersTrend: number;
}
