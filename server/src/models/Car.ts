// Mongoose model for Car
import mongoose, { Schema, Document } from 'mongoose';

export interface CarDocument extends Omit<Document, 'model'> {
  make: string;
  model: string;
  year: number;
  price: number;
  priceMax?: number;
  description?: string;
  bodyType?: string;
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric' | 'Petrol & Hybrid';
  transmission: 'Automatic' | 'Manual';
  specs: {
    engine: string;
    horsepower: number;
    torque: number;
    displacement?: number;
    cylinders?: number;
    drivetrain?: string;
    mileage_city?: number;
    mileage_highway?: number;
    mileage?: string; // e.g. "14 - 22 KM/L"
    dimensions?: {
      length: number;
      width: number;
      height: number;
      wheelbase?: number;
    };
    groundClearance?: number; // mm
    bootSpace?: number; // liters
    kerbWeight?: string; // e.g. "995 - 1050 KG"
    fuelTankCapacity?: number; // liters
    topSpeed?: number; // km/h
    tyreSize?: string;
    seats?: number;
    batteryCapacity?: number; // kWh
    chargingTime?: number; // hours
    range?: number; // km
    // Legacy fields (kept for backward compat)
    cargoSpace?: number;
    curbWeight?: number;
  };
  safetyRating: number;
  images: string[];
  avgRating: number;
  reviewCount: number;
  views: number;
  createdAt: Date;
}

const CarSchema: Schema = new Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  price: { type: Number, required: true },
  priceMax: { type: Number, required: false },
  description: { type: String, required: false },
  bodyType: { type: String, required: false },
  fuelType: { 
    type: String, 
    required: true,
    enum: ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'Petrol & Hybrid']
  },
  transmission: {
    type: String,
    required: true,
    enum: ['Automatic', 'Manual', 'Manual & Automatic']
  },
  specs: {
    engine: { type: String, required: false, default: '' },
    horsepower: { type: Number, required: false, default: 0 },
    torque: { type: Number, required: false, default: 0 },
    displacement: { type: Number, required: false },
    cylinders: { type: Number, required: false },
    drivetrain: { type: String, required: false },
    mileage_city: { type: Number, required: false },
    mileage_highway: { type: Number, required: false },
    mileage: { type: String, required: false },
    dimensions: {
      length: { type: Number, required: false },
      width: { type: Number, required: false },
      height: { type: Number, required: false },
      wheelbase: { type: Number, required: false }
    },
    groundClearance: { type: Number, required: false },
    bootSpace: { type: Number, required: false },
    kerbWeight: { type: String, required: false },
    fuelTankCapacity: { type: Number, required: false },
    topSpeed: { type: Number, required: false },
    tyreSize: { type: String, required: false },
    seats: { type: Number, default: 5 },
    batteryCapacity: { type: Number, required: false },
    chargingTime: { type: Number, required: false },
    range: { type: Number, required: false },
    cargoSpace: { type: Number, required: false },
    curbWeight: { type: Number, required: false }
  },
  safetyRating: { type: Number, required: false, default: 0, min: 0, max: 5 },
  images: { type: [String], default: [] },
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<CarDocument>('Car', CarSchema);
