const request = require('supertest');
const express = require('express');
const services = require('../controllers/services');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { createPutObjectPreSignedURL, createGetObjectPreSignedURL} = require('../services/s3');
const {uploadFileToS3} = require('../controllers/services');
const cleanedEnv = require('../utils/cleanedEnv');
const app = require("../src/app");
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const fs = require('fs');
jest.mock('../services/s3');
jest.mock('../services/email');
jest.mock('../middlewares/authorizeClient', () => {
    return jest.fn(() => {
        return async (req, res, next) => {
            return next();
        };
    });
});
jest.mock("jsonwebtoken", () => {
    const actualJwt = jest.requireActual("jsonwebtoken");
    return {
      ...actualJwt,
      sign: jest.fn(),
      verify: jest.fn(),
      JsonWebTokenError: actualJwt.JsonWebTokenError,
      TokenExpiredError: actualJwt.TokenExpiredError,
    };
  });
  jest.mock("../config/redis", () => ({
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  }));

describe('Services Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks(); 
        const demoDecodedToken = { _id: "6bdfjdkj45763", id: "DBOX001", email: "dboxtest@test.com", role: "admin" };
        jwt.verify.mockResolvedValueOnce(demoDecodedToken);
        redisClient.get.mockResolvedValue("ACCESS_TOKEN_"+demoDecodedToken.id);
      });


    describe('generatePutObjectUrl', () => {
        it('should return 400 if required fields are missing', async () => {
            const res = await request(app).post('/api/v1/services/s3/put-object-url').send({}).set('Cookie', ['access_token=your_token_here']);
            expect(res.status).toBe(400);
            // expect(res.body).toEqual("Type of file i.e. profile-pic or invoice, file name and content type are required");
        });

        it('should return 400 if invalid content type is provided', async () => {
            const res = await request(app).post('/api/v1/services/s3/put-object-url').send({
                type: 'invoice',
                content_type: 'invalid/type',
                file_name: 'testfile'
            }).set('Cookie', ['access_token=your_token_here']);
            expect(res.status).toBe(400);
            // expect(res.body).toEqual("Invalid content type provided");
        });

        it('should return 500 if createPutObjectPreSignedURL fails', async () => {
            createPutObjectPreSignedURL.mockResolvedValue({ error: 'Some error' });
            const res = await request(app).post('/api/v1/services/s3/put-object-url').send({
                type: 'invoice',
                content_type: 'application/pdf',
                file_name: 'testfile'
            }).set('Cookie', ['access_token=your_token_here']);
            expect(res.status).toBe(500);
            // expect(res.body).toEqual(new ApiError(500, null, 'Some error').toJSON());
        });

        it('should return 200 with pre-signed URL if successful', async () => {
            createPutObjectPreSignedURL.mockResolvedValue({ s3Response: 'some-url', error: null });
            const res = await request(app).post('/api/v1/services/s3/put-object-url').send({
                type: 'invoice',
                content_type: 'application/pdf',
                file_name: 'testfile'
            }).set('Cookie', ['access_token=your_token_here']);;
            expect(res.status).toBe(200);
        });

        it('should return 400 if invalid type is provided', async () => {
            const res = await request(app).post('/api/v1/services/s3/put-object-url').send({
                type: 'invalid',
                content_type: 'application/pdf',
                file_name: 'testfile'
            }).set('Cookie', ['access_token=your_token_here']);;
            expect(res.status).toBe(400);
        });
    });

    describe('generateGetObjectUrl', () => {
        it('should return 400 if key is missing', async () => {
            const res = await request(app).get('/api/v1/services/s3/get-object-url').query({}).set('Cookie', ['access_token=your_token_here']);
            expect(res.status).toBe(400);
        });

        it('should return 500 if createGetObjectPreSignedURL fails', async () => {
            createGetObjectPreSignedURL.mockResolvedValue({ error: 'Some error' });
            const res = await request(app).get('/api/v1/services/s3/get-object-url').query({ key: 'testfile' }).set('Cookie', ['access_token=your_token_here']);
            expect(res.status).toBe(500);
        });

        it('should return 200 with pre-signed URL if successful', async () => {
            createGetObjectPreSignedURL.mockResolvedValue({ s3Response: 'some-url', error: null });
            const res = await request(app).get('/api/v1/services/s3/get-object-url').query({ key: 'testfile' }).set('Cookie', ['access_token=your_token_here']);
            expect(res.status).toBe(200);
    
        });

    });

    
});