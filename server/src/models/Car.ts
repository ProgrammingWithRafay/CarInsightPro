// Mongoose model for Car
import mongoose, { Schema, Document } from 'mongoose';

export interface CarDocument extends Omit<Document, 'model'> {
  make: string;
  model: string;
  year: number;
  price: number;
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  transmission: 'Automatic' | 'Manual';
  specs: {
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
    chargingTime?: number; // hours (Level 2)
    range?: number; // miles
  };
  safetyRating: number;
  images: string[];
  avgRating: number;
  reviewCount: number;
  views: number;
  createdAt: Date;
  embedding?: number[];
}

const CarSchema: Schema = new Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  price: { type: Number, required: true },
  fuelType: { 
    type: String, 
    required: true,
    enum: ['Petrol', 'Diesel', 'Hybrid', 'Electric']
  },
  transmission: {
    type: String,
    required: true,
    enum: ['Automatic', 'Manual']
  },
  specs: {
    engine: { type: String, required: true },
    horsepower: { type: Number, required: true },
    torque: { type: Number, required: true },
    displacement: { type: Number, required: true },
    cylinders: { type: Number, required: true },
    drivetrain: { type: String, required: true },
    mileage_city: { type: Number, required: true },
    mileage_highway: { type: Number, required: true },
    dimensions: {
      length: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      wheelbase: { type: Number, required: true }
    },
    cargoSpace: { type: Number, required: true },
    curbWeight: { type: Number, required: true },
    seats: { type: Number, default: 5 },
    batteryCapacity: { type: Number, required: false },
    chargingTime: { type: Number, required: false },
    range: { type: Number, required: false }
  },
  safetyRating: { type: Number, required: true, min: 1, max: 5 },
  images: { type: [String], default: [] },
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  embedding: { type: [Number], required: false }
}, {
  timestamps: true
});

export default mongoose.model<CarDocument>('Car', CarSchema);
