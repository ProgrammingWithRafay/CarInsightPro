import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Car from '../src/models/Car';
import { createCarDescription, generateEmbedding } from '../src/utils/embedding';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const backfillEmbeddings = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env');
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find cars that don't have an embedding yet (or all if you want to force regenerate)
    const cars = await Car.find({ embedding: { $exists: false } });
    console.log(`Found ${cars.length} cars without embeddings.`);

    for (const car of cars) {
      try {
        console.log(`Generating embedding for ${car.year} ${car.make} ${car.model}...`);
        const description = createCarDescription(car);
        const embedding = await generateEmbedding(description);
        
        car.embedding = embedding;
        await car.save();
        console.log(`Successfully saved embedding for ${car._id}`);
        
        // Sleep for 500ms to avoid OpenAI rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to process ${car._id}:`, error);
      }
    }

    console.log('Backfill complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

backfillEmbeddings();
