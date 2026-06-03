// Review Controller - Handles adding, fetching, and updating reviews
import { Request, Response } from 'express';
import Review from '../models/Review';
import Car from '../models/Car';

// Get reviews for a specific car
export const getReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ car: req.params.carId }).populate('user', 'name avatar').sort('-createdAt');
    
    // Calculate aggregated subScores
    let aggregatedSubScores = { comfort: 0, reliability: 0, fuelEconomy: 0, valueMoney: 0, resaleValue: 0 };
    if (reviews.length > 0) {
      reviews.forEach(r => {
        if (r.subScores) {
          aggregatedSubScores.comfort += r.subScores.comfort;
          aggregatedSubScores.reliability += r.subScores.reliability;
          aggregatedSubScores.fuelEconomy += r.subScores.fuelEconomy;
          aggregatedSubScores.valueMoney += r.subScores.valueMoney;
          aggregatedSubScores.resaleValue += r.subScores.resaleValue;
        }
      });
      aggregatedSubScores.comfort /= reviews.length;
      aggregatedSubScores.reliability /= reviews.length;
      aggregatedSubScores.fuelEconomy /= reviews.length;
      aggregatedSubScores.valueMoney /= reviews.length;
      aggregatedSubScores.resaleValue /= reviews.length;
    }

    res.json({ success: true, data: { reviews, aggregatedSubScores } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add a review
export const addReview = async (req: Request, res: Response) => {
  try {
    const { title, subScores, comment } = req.body;
    const carId = req.params.carId;

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({ car: carId, user: req.user?._id });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this car' });
    }

    const review = await Review.create({
      car: carId,
      user: req.user?._id,
      title,
      subScores,
      comment,
      // rating is auto-calculated in pre-validate hook
    });

    // Update car average rating and count
    const reviews = await Review.find({ car: carId });
    car.reviewCount = reviews.length;
    car.avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    await car.save();

    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a review
export const updateReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    await review.save();

    // Update car stats
    const reviews = await Review.find({ car: review.car });
    const car = await Car.findById(review.car);
    if (car) {
      car.avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
      await car.save();
    }

    res.json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a review
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const carId = review.car;
    await review.deleteOne();

    // Update car stats
    const reviews = await Review.find({ car: carId });
    const car = await Car.findById(carId);
    if (car) {
      car.reviewCount = reviews.length;
      car.avgRating = reviews.length > 0 ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length : 0;
      await car.save();
    }

    res.json({ success: true, message: 'Review removed' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark review as helpful
export const markHelpful = async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const isHelpful = review.helpful.includes(userId as any);

    if (isHelpful) {
      review.helpful = review.helpful.filter((id: any) => id.toString() !== userId.toString());
    } else {
      review.helpful.push(userId as any);
    }

    await review.save();
    res.json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
