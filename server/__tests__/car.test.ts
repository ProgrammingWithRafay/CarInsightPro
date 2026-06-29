import request from 'supertest';
import app from '../src/app';
import Car from '../src/models/Car';
import mongoose from 'mongoose';

describe('Car API Endpoints', () => {
  let car1Id: string;
  let car2Id: string;

  beforeEach(async () => {
    // Insert some test cars
    const car1 = await Car.create({
      make: 'Toyota',
      model: 'Corolla',
      year: 2022,
      price: 25000,
      fuelType: 'Petrol',
      transmission: 'Automatic'
    });
    
    const car2 = await Car.create({
      make: 'Honda',
      model: 'Civic',
      year: 2023,
      price: 28000,
      fuelType: 'Hybrid',
      transmission: 'Automatic'
    });

    const car3 = await Car.create({
      make: 'Ford',
      model: 'Focus',
      year: 2021,
      price: 22000,
      fuelType: 'Petrol',
      transmission: 'Manual'
    });

    car1Id = car1._id.toString();
    car2Id = car2._id.toString();
  });

  describe('GET /api/cars (Filtering)', () => {
    it('should filter cars by brand (make)', async () => {
      const response = await request(app).get('/api/cars?brand=Toyota');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].make).toBe('Toyota');
    });

    it('should filter cars by fuel type', async () => {
      const response = await request(app).get('/api/cars?fuelType=Hybrid');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].fuelType).toBe('Hybrid');
    });

    it('should filter cars by price range', async () => {
      const response = await request(app).get('/api/cars?priceMin=24000&priceMax=29000');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      const makes = response.body.data.map((c: any) => c.make);
      expect(makes).toContain('Toyota');
      expect(makes).toContain('Honda');
    });
  });

  describe('GET /api/cars/compare', () => {
    it('should return comparison data for two valid car IDs', async () => {
      const response = await request(app).get(`/api/cars/compare?ids=${car1Id},${car2Id}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      const makes = response.body.data.map((c: any) => c.make);
      expect(makes).toContain('Toyota');
      expect(makes).toContain('Honda');
    });

    it('should handle invalid IDs with an appropriate error or empty array', async () => {
      // mongoose returns 500 cast error if format is wrong, but since it's a valid object id that doesn't exist it returns 200 with empty array
      const invalidId = new mongoose.Types.ObjectId().toString();
      const response = await request(app).get(`/api/cars/compare?ids=${invalidId}`);
      
      expect(response.status).toBe(200); 
      expect(response.body.data.length).toBe(0);
    });

    it('should return error when no IDs are provided', async () => {
      const response = await request(app).get(`/api/cars/compare`);
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/Please provide car IDs/);
    });
  });
});
