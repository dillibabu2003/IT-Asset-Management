const request = require('supertest');
const express = require('express');
const { getMetaData } = require('../controllers/metadata');
const Metadata = require('../models/metadata');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

jest.mock('../models/metadata');
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
jest.mock("../models/metadata", function() {
    const mockMetadataModel = function(data) {
      return {
        ...data,
        save: jest.fn().mockResolvedValue(data)
      };
    };
    mockMetadataModel.findOne = jest.fn();
    mockMetadataModel.findOneAndDelete = jest.fn();
    mockMetadataModel.findOneAndUpdate = jest.fn();
    mockMetadataModel.find= jest.fn();
    mockMetadataModel.aggregate = jest.fn();
    mockMetadataModel.countDocuments = jest.fn();
    return mockMetadataModel;
  });

describe('Metadata Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const demoDecodedToken = { _id: "6bdfjdkj45763", id: "DBOX001", email: "dboxtest@test.com", role: "admin" };
    jwt.verify.mockResolvedValueOnce(demoDecodedToken);
    redisClient.get.mockResolvedValue("ACCESS_TOKEN_"+demoDecodedToken.id);
  });

  describe('GET /metadata/:belongs_to', () => {
    it('should return 200 and metadata if data exists', async () => {
      const mockMetadata = [
        { id: 'field1', name: 'Field 1' },
        { id: 'field2', name: 'Field 2' },
      ];
      const mockSelect = jest.fn().mockResolvedValue(mockMetadata);
            Metadata.find.mockImplementation(()=>({
              select: mockSelect }));

      const res = await request(app)
        .get('/api/v1/metadata/assets')
        .set('Cookie', ['access_token=your_token_here']);

      expect(res.status).toBe(200);
    });

    it('should return 404 if metadata does not exist', async () => {

            const mockMetadata = null;
            const mockSelect = jest.fn().mockResolvedValue(mockMetadata);
            Metadata.find.mockImplementation(() => ({
                select: mockSelect
            }));

            const res = await request(app)
                .get('/api/v1/metadata/assets')
                .set('Cookie', ['access_token=your_token_here']);

            expect(res.status).toBe(404);
    });
  });
});