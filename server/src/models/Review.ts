// Mongoose model for Review
import mongoose, { Schema, Document } from 'mongoose';

export interface ReviewDocument extends Document {
  car: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  title: string;
  rating: number;
  subScores: {
    comfort: number;
    reliability: number;
    fuelEconomy: number;
    valueMoney: number;
    resaleValue: number;
  };
  comment: string;
  helpful: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  car: { type: Schema.Types.ObjectId, ref: 'Car', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 10 },
  subScores: {
    comfort: { type: Number, required: true, min: 1, max: 10 },
    reliability: { type: Number, required: true, min: 1, max: 10 },
    fuelEconomy: { type: Number, required: true, min: 1, max: 10 },
    valueMoney: { type: Number, required: true, min: 1, max: 10 },
    resaleValue: { type: Number, required: true, min: 1, max: 10 }
  },
  comment: { type: String, required: true },
  helpful: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

ReviewSchema.pre<ReviewDocument>('validate', function(next) {
  if (this.subScores) {
    const { comfort, reliability, fuelEconomy, valueMoney, resaleValue } = this.subScores;
    this.rating = (comfort + reliability + fuelEconomy + valueMoney + resaleValue) / 5;
  }
  next();
});

export default mongoose.model<ReviewDocument>('Review', ReviewSchema);
