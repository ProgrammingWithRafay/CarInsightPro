// Car Controller - Handles fetching, creating, updating, and deleting cars
import { Request, Response } from 'express';
import Car from '../models/Car';
import PriceHistory from '../models/PriceHistory';
import cloudinary from '../config/cloudinary';

// Get all cars with filtering, sorting, pagination
export const getCars = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 9;
    const skip = (page - 1) * limit;

    let query: any = {};

    // Search by make or model
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      query.$or = [{ make: searchRegex }, { model: searchRegex }];
    }

    // Filter by brand
    if (req.query.brand) {
      query.make = { $in: (req.query.brand as string).split(',') };
    }

    // Filter by year
    if (req.query.yearMin || req.query.yearMax) {
      query.year = {};
      if (req.query.yearMin) query.year.$gte = parseInt(req.query.yearMin as string);
      if (req.query.yearMax) query.year.$lte = parseInt(req.query.yearMax as string);
    }

    // Filter by price
    if (req.query.priceMin || req.query.priceMax) {
      query.price = {};
      if (req.query.priceMin) query.price.$gte = parseInt(req.query.priceMin as string);
      if (req.query.priceMax) query.price.$lte = parseInt(req.query.priceMax as string);
    }

    // Filter by fuel type
    if (req.query.fuelType) {
      query.fuelType = { $in: (req.query.fuelType as string).split(',') };
    }

    // Filter by minimum range (EVs & Hybrids)
    if (req.query.rangeMin) {
      query['specs.range'] = { $gte: parseInt(req.query.rangeMin as string) };
    }

    // Filter by transmission
    if (req.query.transmission) {
      query.transmission = req.query.transmission;
    }

    // Filter by safety rating
    if (req.query.safetyRating) {
      query.safetyRating = { $gte: parseInt(req.query.safetyRating as string) };
    }

    // Sort
    let sort: any = { createdAt: -1 };
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'price-asc': sort = { price: 1 }; break;
        case 'price-desc': sort = { price: -1 }; break;
        case 'year-desc': sort = { year: -1 }; break;
        case 'year-asc': sort = { year: 1 }; break;
        case 'rating-desc': sort = { avgRating: -1 }; break;
      }
    }

    const total = await Car.countDocuments(query);
    const cars = await Car.find(query).sort(sort).skip(skip).limit(limit);

    res.json({
      success: true,
      data: cars,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single car by ID
export const getCarById = async (req: Request, res: Response) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    // Increment views
    car.views += 1;
    await car.save();

    res.json({ success: true, data: car });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Compare multiple cars
export const compareCars = async (req: Request, res: Response) => {
  try {
    const ids = req.query.ids ? (req.query.ids as string).split(',') : [];
    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide car IDs to compare' });
    }

    const cars = await Car.find({ _id: { $in: ids } });
    res.json({ success: true, data: cars });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const MAX_IMAGES = 5;

// Add new car (Admin only)
export const addCar = async (req: Request, res: Response) => {
  try {
    const carData = JSON.parse(req.body.data);
    let imageUrls: string[] = [];

    // Handle image uploads if present
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const uploadPromises = req.files.map((file: any) => {
        return new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'carinsight_pro' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result!.secure_url);
            }
          );
          uploadStream.end(file.buffer);
        });
      });

      imageUrls = await Promise.all(uploadPromises);
    }

    carData.images = imageUrls.slice(0, MAX_IMAGES);
    const car = await Car.create(carData);

    res.status(201).json({ success: true, data: car });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update car (Admin only)
export const updateCar = async (req: Request, res: Response) => {
  try {
    let updateData = req.body;
    
    // If formData was used, data will be a JSON string in req.body.data
    if (req.body.data) {
      updateData = JSON.parse(req.body.data);
    }

    let newImageUrls: string[] = [];
    
    // Handle new image uploads if present
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const uploadPromises = req.files.map((file: any) => {
        return new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'carinsight_pro' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result!.secure_url);
            }
          );
          uploadStream.end(file.buffer);
        });
      });

      newImageUrls = await Promise.all(uploadPromises);
    }

    if (newImageUrls.length > 0) {
      updateData.images = [...(updateData.images || []), ...newImageUrls].slice(0, MAX_IMAGES);
    } else if (updateData.images) {
      updateData.images = updateData.images.slice(0, MAX_IMAGES);
    }

    const existingCar = await Car.findById(req.params.id);
    if (!existingCar) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    if (updateData.price && existingCar.price !== Number(updateData.price)) {
      await PriceHistory.create({
        car: existingCar._id,
        oldPrice: existingCar.price,
        newPrice: Number(updateData.price)
      });
    }

    const car = await Car.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json({ success: true, data: car });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete car (Admin only)
export const deleteCar = async (req: Request, res: Response) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    await car.deleteOne();
    res.json({ success: true, message: 'Car removed' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Recommend cars
export const recommendCars = async (req: Request, res: Response) => {
  try {
    const { budget, usage, seats, fuelType } = req.query;
    const maxBudget = budget ? parseInt(budget as string) : Number.MAX_SAFE_INTEGER;
    const requiredSeats = seats ? parseInt(seats as string) : 0;
    
    const cars = await Car.find({
      price: { $lte: maxBudget },
      ...(requiredSeats > 0 ? { 'specs.seats': { $gte: requiredSeats } } : {})
    });

    const scoredCars = cars.map(car => {
      let score = 0;
      let maxScore = 0;

      if (fuelType) {
        maxScore += 30;
        if (car.fuelType.toLowerCase() === (fuelType as string).toLowerCase()) {
          score += 30;
        }
      }

      if (usage) {
        maxScore += 40;
        if (usage === 'city') {
          if ((car.specs?.mileage_city || 0) >= 15 || ['Electric', 'Hybrid'].includes(car.fuelType)) score += 40;
          else if ((car.specs?.dimensions?.length || 200) < 180) score += 20;
        } else if (usage === 'highway') {
          if ((car.specs?.horsepower || 0) >= 150) score += 20;
          if ((car.specs?.mileage_highway || 0) >= 18) score += 20;
        } else if (usage === 'mixed') {
          score += 20;
          if (['Hybrid'].includes(car.fuelType)) score += 20;
        }
      }
      
      const matchPercentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 100;
      
      return {
        ...car.toObject(),
        matchScore: score,
        matchPercentage
      };
    });

    scoredCars.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return a.price - b.price;
    });

    res.json({ success: true, data: scoredCars.slice(0, 5) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCarPriceHistory = async (req: Request, res: Response) => {
  try {
    const history = await PriceHistory.find({ car: req.params.id }).sort({ date: 1 });
    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
