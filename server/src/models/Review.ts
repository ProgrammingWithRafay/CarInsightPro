/**
 * Mongoose model for User Reviews.
 * Stores individual ratings, granular sub-scores, and textual comments for specific cars.
 * Includes a validation hook to automatically compute the overall rating from the sub-scores.
 */
import mongoose, { Schema, Document } from 'mongoose';

export interface ReviewDocument extends Document {
  car: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  title: string;
  rating: number;
  subScores: {
    style: number;
    comfort: number;
    fuelEconomy: number;
    performance: number;
    valueMoney: number;
  };
  comment: string;
  helpful: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  car: { type: Schema.Types.ObjectId, ref: 'Car', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  subScores: {
    style: { type: Number, required: true, min: 1, max: 5 },
    comfort: { type: Number, required: true, min: 1, max: 5 },
    fuelEconomy: { type: Number, required: true, min: 1, max: 5 },
    performance: { type: Number, required: true, min: 1, max: 5 },
    valueMoney: { type: Number, required: true, min: 1, max: 5 }
  },
  comment: { type: String, required: true },
  helpful: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

// Index for hot query (fetching reviews by car ID)
ReviewSchema.index({ car: 1 });

/**
 * Pre-validate middleware.
 * Automatically calculates the overall 'rating' as the mathematical average
 * of the 5 individual sub-scores before the document is saved to the database.
 */
ReviewSchema.pre<ReviewDocument>('validate', function(next) {
  if (this.subScores) {
    const { style, comfort, fuelEconomy, performance, valueMoney } = this.subScores;
    this.rating = (style + comfort + fuelEconomy + performance + valueMoney) / 5;
  }
  next();
});

export default mongoose.model<ReviewDocument>('Review', ReviewSchema);
