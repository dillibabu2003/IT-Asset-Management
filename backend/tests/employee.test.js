const request = require('supertest');
const express = require('express');
const { getEmployeesBySearchTerm } = require('../controllers/employee');
const Employee = require('../models/employee');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

jest.mock('../models/employee');
jest.mock('../middlewares/authorizeClient', () => {
  return jest.fn(() => {
    return async (req, res, next) => {
      return next();
    };
  });
});
jest.mock('jsonwebtoken', () => {
  const actualJwt = jest.requireActual('jsonwebtoken');
  return {
    ...actualJwt,
    sign: jest.fn(),
    verify: jest.fn(),
    JsonWebTokenError: actualJwt.JsonWebTokenError,
    TokenExpiredError: actualJwt.TokenExpiredError,
  };
});
jest.mock('../config/redis', () => ({
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
}));

describe('Employee Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const demoDecodedToken = { _id: "6bdfjdkj45763", id: "DBOX001", email: "dboxtest@test.com", role: "admin" };
    jwt.verify.mockResolvedValueOnce(demoDecodedToken);
    redisClient.get.mockResolvedValue("ACCESS_TOKEN_"+demoDecodedToken.id);
  });

  describe('POST /employees/search', () => {
    it('should return 200 and employees if search key is provided', async () => {
      const mockEmployees = [
        { employee_id: 'EMP001', firstname: 'John', lastname: 'Doe' },
        { employee_id: 'EMP002', firstname: 'Jane', lastname: 'Doe' },
      ];
      Employee.aggregate.mockResolvedValue(mockEmployees);

      const response = await request(app)
        .post('/api/v1/employees/search')
        .send({ search_key: 'Doe' })
        .set('Cookie', ['access_token=your_token_here']);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Users fetched successfully');
      expect(response.body.data).toEqual(mockEmployees);
    });

    it('should return 200 and first ten employees if search key is empty', async () => {
        const mockEmployees = [
          { employee_id: 'EMP001', firstname: 'John', lastname: 'Doe' },
          { employee_id: 'EMP002', firstname: 'Jane', lastname: 'Doe' },
        ];
      
        Employee.find.mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockEmployees),
        });
      
        const response = await request(app)
          .post('/api/v1/employees/search')
          .send({ search_key: '' }) // Empty search_key
          .set('Cookie', ['access_token=your_token_here']);
      
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Employees fetched successfully');
        expect(response.body.data).toEqual(mockEmployees);
      });
      

    it('should return 404 if no employees are found', async () => {
      Employee.aggregate.mockResolvedValue([]);

      const response = await request(app)
        .post('/api/v1/employees/search')
        .send({ search_key: 'NonExistent' })
        .set('Cookie', ['access_token=your_token_here']);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No documents found');
    });

    it('should return 400 if search key is not provided', async () => {
        const response = await request(app)
          .post('/api/v1/employees/search')
          .send({}) // No search_key in body
          .set('Cookie', ['access_token=your_token_here']);
      
        expect(response.status).toBe(400);
        // expect(response.body.message).toBe('Invalid search term');
      });
      
      it('should handle errors and return 500', async () => {
        Employee.aggregate.mockImplementationOnce(() => {
          throw new Error('Database error');
        });
      
        const response = await request(app)
          .post('/api/v1/employees/search')
          .send({ search_key: 'Doe' })
          .set('Cookie', ['access_token=your_token_here']);
      
        expect(response.status).toBe(500);
        // expect(response.body.message).toBe('Internal Server Error');
      });
      
  });
});