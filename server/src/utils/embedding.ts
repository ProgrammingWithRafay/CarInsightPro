import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

const getOpenAIClient = () => {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
};

/**
 * Converts car data into a rich descriptive string suitable for embedding.
 */
export const createCarDescription = (car: any): string => {
  return `This is a ${car.year} ${car.make} ${car.model}. 
It is a ${car.fuelType} vehicle with a ${car.transmission} transmission.
Specs include: ${car.specs.engine} engine with ${car.specs.horsepower} horsepower and ${car.specs.torque} lb-ft of torque.
It has a ${car.specs.drivetrain} drivetrain, gets ${car.specs.mileage_city} MPG city and ${car.specs.mileage_highway} MPG highway.
It seats ${car.specs.seats || 5} people and has a safety rating of ${car.safetyRating} out of 5 stars.
Priced at $${car.price}.`;
};

/**
 * Calls OpenAI API to generate a vector embedding.
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await getOpenAIClient().embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
};
