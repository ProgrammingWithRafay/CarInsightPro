import request from 'supertest';
import app from '../src/app';

describe('Auth Middleware', () => {
  it('should return 401 for a protected route when no token is provided', async () => {
    // Testing the POST /api/cars endpoint which is protected
    const response = await request(app).post('/api/cars').send({});
    
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/Not authorized/i);
  });
});
