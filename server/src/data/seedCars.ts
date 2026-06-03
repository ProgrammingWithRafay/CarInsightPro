import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Car from '../models/Car';
import User from '../models/User';
import Review from '../models/Review';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || '');
    console.log('MongoDB Connected for Seeding');
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

import fs from 'fs';
import path from 'path';

const modelImagesPath = path.join(__dirname, 'modelImages.json');
const modelImages: Record<string, string[]> = JSON.parse(fs.readFileSync(modelImagesPath, 'utf8'));

const getImagesForModel = (make: string, model: string): string[] => {
  const images = modelImages[`${make} ${model}`];
  if (images && images.length > 0) return images.slice(0, 5); // Take up to 5
  return ['https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80'];
};

const brands = [
  'Toyota', 'BMW', 'Tesla', 'Honda', 'Ford', 'Audi', 'Mercedes', 'Nissan',
  'Hyundai', 'Kia', 'Volkswagen', 'Porsche', 'Volvo', 'Subaru', 'Mazda',
  'Lexus', 'Jeep', 'Chevrolet'
];

const featuredCars = [
  {
    make: 'Toyota', model: 'Camry', year: 2023, price: 26990, fuelType: 'Petrol', transmission: 'Automatic', safetyRating: 5,
    images: getImagesForModel('Toyota', 'Camry'),
    specs: { engine: '2.5L 4-Cylinder', horsepower: 203, torque: 184, displacement: 2487, cylinders: 4, drivetrain: 'FWD', mileage_city: 28, mileage_highway: 39, dimensions: { length: 192.1, width: 72.4, height: 56.9, wheelbase: 111.2 }, cargoSpace: 15.1, curbWeight: 3310 }
  },
  {
    make: 'BMW', model: '3 Series', year: 2024, price: 43800, fuelType: 'Petrol', transmission: 'Automatic', safetyRating: 5,
    images: getImagesForModel('BMW', '3 Series'),
    specs: { engine: '2.0L Turbo 4-Cylinder', horsepower: 255, torque: 295, displacement: 1998, cylinders: 4, drivetrain: 'RWD', mileage_city: 25, mileage_highway: 34, dimensions: { length: 185.7, width: 71.9, height: 56.8, wheelbase: 112.2 }, cargoSpace: 17, curbWeight: 3582 }
  },
  {
    make: 'Tesla', model: 'Model 3', year: 2023, price: 40240, fuelType: 'Electric', transmission: 'Automatic', safetyRating: 5,
    images: getImagesForModel('Tesla', 'Model 3'),
    specs: { engine: 'Electric Motor', horsepower: 283, torque: 330, displacement: 0, cylinders: 0, drivetrain: 'RWD', mileage_city: 138, mileage_highway: 126, dimensions: { length: 184.8, width: 72.8, height: 56.4, wheelbase: 113.2 }, cargoSpace: 23, curbWeight: 3862, batteryCapacity: 82, range: 358, chargingTime: 8 }
  },
  {
    make: 'Honda', model: 'Civic', year: 2022, price: 22550, fuelType: 'Petrol', transmission: 'Automatic', safetyRating: 5,
    images: getImagesForModel('Honda', 'Civic'),
    specs: { engine: '2.0L 4-Cylinder', horsepower: 158, torque: 138, displacement: 1996, cylinders: 4, drivetrain: 'FWD', mileage_city: 31, mileage_highway: 40, dimensions: { length: 184, width: 70.9, height: 55.7, wheelbase: 107.7 }, cargoSpace: 14.8, curbWeight: 2877 }
  },
  {
    make: 'Ford', model: 'Mustang', year: 2024, price: 30920, fuelType: 'Petrol', transmission: 'Manual', safetyRating: 4,
    images: getImagesForModel('Ford', 'Mustang'),
    specs: { engine: '2.3L EcoBoost 4-Cylinder', horsepower: 315, torque: 350, displacement: 2300, cylinders: 4, drivetrain: 'RWD', mileage_city: 21, mileage_highway: 32, dimensions: { length: 188.3, width: 75.4, height: 54.4, wheelbase: 107 }, cargoSpace: 13.3, curbWeight: 3532 }
  },
  {
    make: 'Audi', model: 'A4', year: 2023, price: 39900, fuelType: 'Petrol', transmission: 'Automatic', safetyRating: 5,
    images: getImagesForModel('Audi', 'A4'),
    specs: { engine: '2.0L Turbo 4-Cylinder', horsepower: 201, torque: 236, displacement: 1984, cylinders: 4, drivetrain: 'AWD', mileage_city: 24, mileage_highway: 33, dimensions: { length: 187.5, width: 72.7, height: 56.2, wheelbase: 111 }, cargoSpace: 12, curbWeight: 3417 }
  },
  {
    make: 'Porsche', model: '911', year: 2024, price: 114400, fuelType: 'Petrol', transmission: 'Automatic', safetyRating: 5,
    images: getImagesForModel('Porsche', '911'),
    specs: { engine: '3.0L Twin-Turbo Flat-6', horsepower: 379, torque: 331, displacement: 2981, cylinders: 6, drivetrain: 'RWD', mileage_city: 18, mileage_highway: 24, dimensions: { length: 177.9, width: 72.9, height: 51.1, wheelbase: 96.5 }, cargoSpace: 4.6, curbWeight: 3354 }
  }
];

// Realistic model names per brand
const brandModels: Record<string, string[]> = {
  'Toyota': ['Corolla', 'RAV4', 'Highlander'],
  'BMW': ['5 Series', 'X3', 'X5'],
  'Tesla': ['Model S', 'Model Y', 'Model X'],
  'Honda': ['Accord', 'CR-V', 'HR-V'],
  'Ford': ['F-150', 'Explorer', 'Bronco'],
  'Audi': ['Q5', 'A6', 'Q7'],
  'Mercedes': ['C-Class', 'GLC', 'E-Class'],
  'Nissan': ['Altima', 'Rogue', 'Sentra'],
  'Hyundai': ['Tucson', 'Elantra', 'Santa Fe'],
  'Kia': ['Sportage', 'K5', 'Telluride'],
  'Volkswagen': ['Jetta', 'Tiguan', 'Atlas'],
  'Porsche': ['Cayenne', 'Macan', '911'],
  'Volvo': ['XC60', 'XC90', 'S60'],
  'Subaru': ['Outback', 'Forester', 'Crosstrek'],
  'Mazda': ['CX-5', 'Mazda3', 'CX-9'],
  'Lexus': ['RX 350', 'NX', 'ES 350'],
  'Jeep': ['Wrangler', 'Grand Cherokee', 'Compass'],
  'Chevrolet': ['Silverado', 'Equinox', 'Tahoe'],
};

const brandModelIndex: Record<string, number> = {};

const generateRandomCars = (count: number) => {
  const cars = [];
  const fuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
  const transmissions = ['Automatic', 'Manual'];

  for (let i = 0; i < count; i++) {
    const make = brands[i % brands.length]; // Round-robin brands for even distribution
    const isElectric = make === 'Tesla' || Math.random() > 0.50;
    const fuelType = isElectric ? 'Electric' : fuelTypes[Math.floor(Math.random() * 3)];
    
    // Get a realistic model name
    const models = brandModels[make] || ['Base'];
    if (!brandModelIndex[make]) brandModelIndex[make] = 0;
    const model = models[brandModelIndex[make] % models.length];
    brandModelIndex[make]++;

    const carData = {
      make,
      model,
      year: 2019 + Math.floor(Math.random() * 6),
      price: 18000 + Math.floor(Math.random() * 55000),
      fuelType,
      transmission: transmissions[Math.floor(Math.random() * 2)],
      safetyRating: 3 + Math.floor(Math.random() * 3),
      images: getImagesForModel(make, model),
      specs: {
        engine: isElectric ? 'Electric Motor' : ['2.0L 4-Cylinder', '2.5L 4-Cylinder', '3.0L V6', '2.0L Turbo'][Math.floor(Math.random() * 4)],
        horsepower: 140 + Math.floor(Math.random() * 250),
        torque: 150 + Math.floor(Math.random() * 250),
        displacement: isElectric ? 0 : [1998, 2487, 2996, 1984][Math.floor(Math.random() * 4)],
        cylinders: isElectric ? 0 : [4, 4, 6, 4][Math.floor(Math.random() * 4)],
        drivetrain: ['FWD', 'RWD', 'AWD'][Math.floor(Math.random() * 3)],
        mileage_city: isElectric ? 100 + Math.floor(Math.random() * 40) : 20 + Math.floor(Math.random() * 15),
        mileage_highway: isElectric ? 95 + Math.floor(Math.random() * 35) : 28 + Math.floor(Math.random() * 18),
        dimensions: {
          length: 175 + Math.floor(Math.random() * 25),
          width: 69 + Math.floor(Math.random() * 8),
          height: 54 + Math.floor(Math.random() * 12),
          wheelbase: 105 + Math.floor(Math.random() * 12)
        },
        cargoSpace: 10 + Math.floor(Math.random() * 20),
        curbWeight: 2800 + Math.floor(Math.random() * 1500),
        ...(fuelType === 'Electric' || fuelType === 'Hybrid' ? {
          batteryCapacity: fuelType === 'Electric' ? 60 + Math.floor(Math.random() * 40) : 10 + Math.floor(Math.random() * 15),
          range: fuelType === 'Electric' ? 200 + Math.floor(Math.random() * 200) : 20 + Math.floor(Math.random() * 40),
          chargingTime: fuelType === 'Electric' ? 6 + Math.floor(Math.random() * 4) : 2 + Math.floor(Math.random() * 2)
        } : {})
      }
    };
    
    // removed 3D model condition

    cars.push(carData);
  }
  return cars;
};

import { extraEVs } from './extraEVs';

const seedDatabase = async () => {
  await connectDB();

  try {
    await Car.deleteMany();
    await Review.deleteMany();

    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@carinsight.com';

    if (!process.env.SEED_ADMIN_PASSWORD) {
      throw new Error('SEED_ADMIN_PASSWORD is missing in .env file!');
    }

    // Only remove seed users, preserve real registered users
    const seedEmails = [adminEmail, 'admin@carinsight.com'];
    await User.deleteMany({ email: { $in: seedEmails } });

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, salt);

    const users = await User.insertMany([
      { name: 'Admin User', email: adminEmail, password: adminPassword, role: 'admin', isVerified: true }
    ]);

    const allCarsData = [...featuredCars, ...extraEVs, ...generateRandomCars(150)];
    const createdCars = await Car.insertMany(allCarsData);

    const reviewsToCreate = [];
    for (let i = 0; i < 10; i++) {
      reviewsToCreate.push({
        car: createdCars[i % createdCars.length]._id,
        user: users[0]._id,
        title: 'Great Car',
        rating: 8 + (i % 2),
        subScores: {
          comfort: 8,
          reliability: 9,
          fuelEconomy: 7,
          valueMoney: 8,
          resaleValue: 9
        },
        comment: `This is a sample review for ${createdCars[i % createdCars.length].make} ${createdCars[i % createdCars.length].model}. Great car overall!`
      });
    }

    const createdReviews = await Review.insertMany(reviewsToCreate);

    for (const review of createdReviews) {
      const car = await Car.findById(review.car);
      if (car) {
        const carReviews = createdReviews.filter(r => r.car.toString() === car._id.toString());
        car.reviewCount = carReviews.length;
        car.avgRating = carReviews.reduce((acc, r) => acc + r.rating, 0) / carReviews.length;
        await car.save();
      }
    }

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

seedDatabase();
