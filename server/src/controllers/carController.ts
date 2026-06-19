// Car Controller - Handles fetching, creating, updating, and deleting cars
import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import Car from '../models/Car';
import PriceHistory from '../models/PriceHistory';

/**
 * Retrieves a paginated list of cars based on various filter criteria.
 * 
 * Supports filtering by search terms (make/model), brand, year range, price range,
 * fuel type, EV/Hybrid range, transmission, and safety rating. Also handles sorting
 * and returns the total count and pagination metadata alongside the car data.
 */
export const getCars = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 9;
    const skip = (page - 1) * limit;

    let query: any = {};

    // Search by make or model
    if (req.query.search) {
      const searchStr = req.query.search as string;
      const escapedSearch = searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
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

    return res.json({
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
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Fetches high-level statistics intended for public display (e.g., on the homepage).
 * 
 * Currently gathers the total number of cars in the inventory and the total number
 * of reviews left by users to showcase platform activity.
 */
export const getPublicStats = async (req: Request, res: Response) => {
  try {
    const totalCars = await Car.countDocuments();
    // Assuming Review model is imported or can be queried. We need to import Review if not already imported.
    const mongoose = require('mongoose');
    const Review = mongoose.models.Review || mongoose.model('Review');
    const totalReviews = await Review.countDocuments();
    
    // We can also count Users or anything else if needed, but let's stick to cars and reviews
    res.json({ success: true, data: { totalCars, totalReviews } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Extracts unique values for dynamic filter dropdowns on the client side.
 * 
 * Queries the database for all distinct brands (makes), fuel types, and body types
 * currently available in the car inventory, returning sorted arrays for the UI.
 */
export const getFilterOptions = async (req: Request, res: Response) => {
  try {
    const brands = await Car.distinct('make');
    const fuelTypes = await Car.distinct('fuelType');
    const bodyTypes = await Car.distinct('bodyType');
    
    // Post-process to ensure clean distinct arrays even if dirty data exists
    const toTitleCase = (str: string) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    const cleanBrands = [...new Set(brands.filter(Boolean).map(b => toTitleCase(b.trim())))].sort();
    
    res.json({ 
      success: true, 
      data: { 
        brands: cleanBrands, 
        fuelTypes: fuelTypes.filter(Boolean).sort(),
        bodyTypes: bodyTypes.filter(Boolean).sort()
      } 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Retrieves the full details of a single car by its database ID.
 * 
 * Automatically increments the car's 'views' counter by 1 every time this endpoint
 * is successfully hit, allowing us to track the most popular vehicles.
 */
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

/**
 * Fetches multiple cars simultaneously for a side-by-side comparison.
 * 
 * Expects a comma-separated list of car IDs in the query parameters.
 * Returns an array of car documents matching those IDs.
 */
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

/**
 * Creates a new car listing in the database (Admin only).
 * 
 * Handles the upload of up to 5 images to Cloudinary, linking their URLs to the car document.
 * Also contains business logic to automatically set the engine type to 'Electric Motor'
 * for EVs if no engine spec was explicitly provided.
 */
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

    // Auto-set engine for EVs
    if (carData.fuelType === 'Electric' && (!carData.specs?.engine || carData.specs.engine === '')) {
      if (!carData.specs) carData.specs = {};
      carData.specs.engine = 'Electric Motor';
    }

    if (carData.make) {
      carData.make = carData.make.trim().replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }

    const car = await Car.create(carData);

    res.status(201).json({ success: true, data: car });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Updates an existing car listing and manages price history tracking (Admin only).
 * 
 * Can handle new image uploads, appending them to existing images up to the MAX_IMAGES limit.
 * Crucially, if the price is changed during the update, it automatically creates a new 
 * PriceHistory record to track market depreciation/appreciation over time.
 */
export const updateCar = async (req: Request, res: Response) => {
  try {
    let updateData = req.body;
    
    // If formData was used, data will be a JSON string in req.body.data
    if (req.body.data) {
      updateData = JSON.parse(req.body.data);
    }

    // Clean make if present
    if (updateData.make) {
      updateData.make = updateData.make.trim().replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
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

    // Auto-set engine for EVs
    if (updateData.fuelType === 'Electric' && (!updateData.specs?.engine || updateData.specs.engine === '')) {
      if (!updateData.specs) updateData.specs = {};
      updateData.specs.engine = 'Electric Motor';
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

/**
 * Removes a car from the inventory (Admin only).
 * 
 * Permanently deletes the car document from the database based on the provided ID.
 */
export const deleteCar = async (req: Request, res: Response) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    // Extract public_id and delete images from Cloudinary
    if (car.images && car.images.length > 0) {
      const deletePromises = car.images.map((url: string) => {
        // e.g. https://res.cloudinary.com/cloud/image/upload/v123/carinsight_pro/abc.jpg -> carinsight_pro/abc
        const parts = url.split('/');
        const filename = parts.pop()?.split('.')[0];
        const folder = parts.pop();
        if (folder && filename) {
          const publicId = `${folder}/${filename}`;
          return cloudinary.uploader.destroy(publicId);
        }
        return Promise.resolve();
      });
      await Promise.all(deletePromises);
    }

    await car.deleteOne();
    res.json({ success: true, message: 'Car removed' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Generates personalized car recommendations based on user preferences.
 * 
 * Evaluates the inventory against constraints like budget, required seats, intended usage 
 * (city vs highway), and fuel type preferences. Uses a custom scoring algorithm to calculate
 * a 'matchPercentage' for each viable car, returning the top 5 matches.
 */
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
          else if ((parseInt(car.specs?.dimensions as string) || 4500) < 4500) score += 20;
        } else if (usage === 'highway') {
          if ((parseInt(car.specs?.horsepower as string) || 0) >= 150) score += 20;
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

/**
 * Retrieves the historical price changes for a specific car.
 * 
 * Queries the PriceHistory collection by car ID, sorting the results chronologically
 * so the client can render a price trend graph.
 */
export const getCarPriceHistory = async (req: Request, res: Response) => {
  try {
    const history = await PriceHistory.find({ car: req.params.id }).sort({ date: 1 });
    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
