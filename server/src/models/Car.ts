/**
 * Mongoose model for Car inventory items.
 * Contains exhaustive technical specifications, pricing data, and aggregated review metrics.
 */
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
    horsepower: string;
    torque: string;
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
    horsepower: { type: String, required: false },
    torque: { type: String, required: false },
    displacement: { type: Number, required: false },
    cylinders: { type: Number, required: false },
    drivetrain: { type: String, required: false },
    mileage_city: { type: Number, required: false },
    mileage_highway: { type: Number, required: false },
    mileage: { type: String, required: false },
    dimensions: { type: String, required: false },
    groundClearance: { type: String, required: false },
    bootSpace: { type: String, required: false },
    kerbWeight: { type: String, required: false },
    fuelTankCapacity: { type: String, required: false },
    topSpeed: { type: String, required: false },
    tyreSize: { type: String, required: false },
    seats: { type: Number, default: 5 },
    batteryCapacity: { type: String, required: false },
    chargingTime: { type: Number, required: false },
    range: { type: String, required: false },
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

// Indexes for hot queries (filtering, searching, matchmaker)
CarSchema.index({ make: 1, model: 1 });
CarSchema.index({ price: 1 });
CarSchema.index({ fuelType: 1 });
CarSchema.index({ 'specs.seats': 1 });

export default mongoose.model<CarDocument>('Car', CarSchema);
