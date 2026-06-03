import mongoose, { Schema, Document } from 'mongoose';

export interface PriceHistoryDocument extends Document {
  car: mongoose.Types.ObjectId;
  oldPrice: number;
  newPrice: number;
  date: Date;
}

const PriceHistorySchema: Schema = new Schema({
  car: { type: Schema.Types.ObjectId, ref: 'Car', required: true },
  oldPrice: { type: Number, required: true },
  newPrice: { type: Number, required: true },
  date: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model<PriceHistoryDocument>('PriceHistory', PriceHistorySchema);
