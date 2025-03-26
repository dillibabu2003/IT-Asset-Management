const request = require('supertest');
const express = require('express');
const {
  getPaginatedDataByObjectName,
  getUserColumnVisibilitiesByObjectName,
  createBulkDocumentsOfObjectName,
  createDocumentOfObjectName,
  getDataBySearchTermOfObjectName,
  getAllDataByFilterOfObjectName,
  updateDocumentOfObjectName,
  deleteDocumentOfObjectName,
  deleteBulkDocumentsOfObjectName,
  getPaginatedDataWithFiltersByObjectName,
} = require('../controllers/dynamic_object');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const mongoose = require('mongoose');
const authorizeClient = require('../middlewares/authorizeClient');
const UserColumnVisibilities = require('../models/userPreference');
const Invoice = require('../models/invoice');
const MetaData = require('../models/metadata');
const License = require('../models/license');
// const { fetchPaginatedDocumentsByObjectName } = require('../controllers/dynamic_object');

// jest.mock('../controllers/dynamic_object/licenses', () => ({
//   fetchPaginatedDocumentsByObjectName: jest.fn()
// }));
jest.mock('../models/license', function() {
  const mockLicenseModel = function(data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(data)
    };
  };  
  mockLicenseModel.findOne = jest.fn();
  mockLicenseModel.findOneAndDelete = jest.fn();
  mockLicenseModel.findOneAndUpdate = jest.fn();
  mockLicenseModel.find = jest.fn();
  mockLicenseModel.countDocuments = jest.fn();
  mockLicenseModel.insertMany = jest.fn();
  mockLicenseModel.deleteMany = jest.fn();
  mockLicenseModel.deleteOne = jest.fn();
  mockLicenseModel.aggregate = {
      exec: jest.fn()
  }
  return mockLicenseModel;
});

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

jest.mock("mongoose", () => {
  const actualMongoose = jest.requireActual("mongoose");
  return {
    ...actualMongoose,
    startSession: jest.fn().mockResolvedValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    }),
  };
});

jest.mock('../config/redis', () => ({
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
}));

jest.mock('../models/userPreference', () => {
  const mockUserVisibility = function(data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(data)
    };
  };
  mockUserVisibility.findOne = jest.fn();
  return mockUserVisibility;
});

jest.mock('../models/invoice', () => {
  const mockInvoiceModel = function(data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(data)
    };
  };
  mockInvoiceModel.findOne = jest.fn();
  return mockInvoiceModel;
});

jest.mock('../models/metadata', () => {
  const mockMetaDataModel = function(data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(data)
    };
  };
  mockMetaDataModel.find = jest.fn();
  return mockMetaDataModel;
});

describe('Dynamic Object Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const demoDecodedToken = { _id: "6bdfjdkj45763", id: "DBOX001", email: "dboxtest@test.com", role: "admin" };
    jwt.verify.mockResolvedValueOnce(demoDecodedToken);
    redisClient.get.mockResolvedValue("ACCESS_TOKEN_"+demoDecodedToken.id);
  });

  describe('GET /:objectName', () => {
    it('should return paginated data by object name', async () => {
      const mockData = [{ _id: '1', name: 'Test Object' }];
      const mockModel = {
        countDocuments: jest.fn().mockResolvedValue(1),
        aggregate: jest.fn().mockResolvedValue(mockData),
      };
      const getModelByObjectName = jest.fn().mockReturnValue(mockModel);
      fetchPaginatedDocumentsByObjectName.mockResolvedValue([
        { id: 1, name: 'Document 1' },
        { id: 2, name: 'Document 2' },
      ]);
      const response = await request(app)
        .get('/api/v1/objects/licenses')
        .query({ page: 1, limit: 10 })
        .set('Cookie', ['access_token=your_token_here']);
        
    console.log(response)

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('testObject fetched successfully');
      expect(response.body.data.documents).toEqual(mockData);
    });

    it('should handle invalid query parameters', async () => {
      const response = await request(app)
        .get('/api/v1/objects/licenses')
        .query({ page: 'invalid', limit: 10 })
        .set('Cookie', ['access_token=your_token_here']);

      expect(response.status).toBe(400);
    //   expect(response.body.message).toBe('Invalid query parameters');
    });
  });

  describe('GET /:objectName/column-visibilities', () => {
    it('should return user column visibilities by object name', async () => {
      const mockVisibilities = {
        visible_fields: new Map([['testObject', { field1: true }]])
      };
      UserColumnVisibilities.findOne.mockResolvedValue(mockVisibilities);

      const response = await request(app)
        .get('/api/v1/objects/testObject/column-visibilities')
        .set('Cookie', ['access_token=your_token_here']);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('testObject Column preferences fetched successfully.');
      expect(response.body.data).toEqual({ field1: true });
    });

    it('should handle missing user preferences', async () => {
      UserColumnVisibilities.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/objects/testObject/column-visibilities')
        .set('Cookie', ['access_token=your_token_here']);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User preferences not found');
    });
  });

  describe('POST /:objectName/bulk', () => {
    it('should create bulk documents of object name', async () => {
      const mockDocuments = [{ name: 'Test Object' }];
      const mockModel = {
        insertMany: jest.fn().mockResolvedValue(mockDocuments),
      };
      const getModelByObjectName = jest.fn().mockReturnValue(mockModel);

      const response = await request(app)
        .post('/api/v1/objects/testObject/bulk')
        .send(mockDocuments)
        .set('Cookie', ['access_token=your_token_here']);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('testObject created successfully');
      expect(response.body.data).toEqual(mockDocuments);
    });

    it('should handle invalid request body', async () => {
      const response = await request(app)
        .post('/api/v1/objects/testObject/bulk')
        .send({})
        .set('Cookie', ['access_token=your_token_here']);

      expect(response.status).toBe(400);
    //   expect(response.body.message).toBe('Invalid request body');
    });
  });

  describe('POST /:objectName/create', () => {
    it('should create a document of object name', async () => {
      const mockDocument = { name: 'Test Object' };
      const mockModel = {
        create: jest.fn().mockResolvedValue(mockDocument),
      };
      const getModelByObjectName = jest.fn().mockReturnValue(mockModel);

      const response = await request(app)
        .post('/api/v1/objects/testObject/create')
        .send(mockDocument)
        .set('Cookie', ['access_token=your_token_here']);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('testObject created successfully');
      expect(response.body.data).toEqual(mockDocument);
    });

    it('should handle invalid request body', async () => {
      const response = await request(app)
        .post('/api/v1/objects/testObject/create')
        .send({})
        .set('Cookie', ['access_token=your_token_here']);

      expect(response.status).toBe(400);
    //   expect(response.body.message).toBe('Invalid request body');
    });
  });

  describe('PUT /:objectName/update', () => {
    it('should update a document of object name', async () => {
      const mockDocument = { name: 'Test Object' };
      const mockModel = {
        findOneAndUpdate: jest.fn().mockResolvedValue(mockDocument),
      };
      const getModelByObjectName = jest.fn().mockReturnValue(mockModel);

      const response = await request(app)
        .put('/api/v1/objects/testObject/update')
        .send(mockDocument)
        .set('Cookie', ['access_token=your_token_here']);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('testObject updated successfully');
      expect(response.body.data).toEqual(mockDocument);
    });

    it('should handle invalid request body', async () => {
      const response = await request(app)
        .put('/api/v1/objects/testObject/update')
        .send({})
        .set('Cookie', ['access_token=your_token_here']);

      expect(response.status).toBe(400);
    //   expect(response.body.message).toBe('Invalid request body');
    });
  });

  describe('DELETE /:objectName/delete', () => {
    it('should delete a document of object name', async () => {
      const mockModel = {
        deleteOne: jest.fn().mockResolvedValue({ acknowledged: true, deletedCount: 1 }),
      };
      const getModelByObjectName = jest.fn().mockReturnValue(mockModel);

      const response = await request(app)
        .delete('/api/v1/objects/testObject/delete')
        .send({ _id: '1' })
        .set('Cookie', ['access_token=your_token_here']);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('testObject deleted successfully');
    });

    it('should handle invalid request body', async () => {
      const response = await request(app)
        .delete('/api/v1/objects/testObject/delete')
        .send({})
        .set('Cookie', ['access_token=your_token_here']);

      expect(response.status).toBe(400);
      // expect(response.body.message).toBe('Invalid request body');
    });
  });

  describe('DELETE /:objectName/delete/bulk', () => {
    it('should delete bulk documents of object name', async () => {
      const mockModel = {
        deleteMany: jest.fn().mockResolvedValue({ acknowledged: true, deletedCount: 1 }),
      };
      const getModelByObjectName = jest.fn().mockReturnValue(mockModel);

      const response = await request(app)
        .delete('/api/v1/objects/testObject/delete/bulk')
        .send([{ _id: '1' }])
        .set('Cookie', ['access_token=your_token_here']);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('testObject deleted successfully');
    });

    it('should handle invalid request body', async () => {
      const response = await request(app)
        .delete('/api/v1/objects/testObject/delete/bulk')
        .send({})
        .set('Cookie', ['access_token=your_token_here']);

      expect(response.status).toBe(400);
      // expect(response.body.message).toBe('Invalid request body');
    });
  });

  describe('GET /:objectName/search', () => {
    it('should return data by search term of object name', async () => {
      const mockData = [{ _id: '1', name: 'Test Object' }];
      const mockModel = {
        aggregate: jest.fn().mockResolvedValue(mockData),
      };
      const getModelByObjectName = jest.fn().mockReturnValue(mockModel);

      const response = await request(app)
        .get('/api/v1/objects/testObject/search')
        .query({ search_key: 'Test', filters: '{}', page: 1, page_limit: 10 })
        .set('Cookie', ['access_token=your_token_here']);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('testObject fetched successfully');
      expect(response.body.data).toEqual(mockData);
    });

    it('should handle invalid query parameters', async () => {
      const response = await request(app)
        .get('/api/v1/objects/testObject/search')
        .query({ search_key: '', filters: '{}', page: 1, page_limit: 10 })
        .set('Cookie', ['access_token=your_token_here']);

      expect(response.status).toBe(400);
      // expect(response.body.message).toBe('Invalid search term or filters or page or page_limit');
    });
  });

  describe('POST /:objectName/filter-docs/all', () => {
    it('should return all data by filter of object name', async () => {
      const mockData = [{ _id: '1', name: 'Test Object' }];
      const mockModel = {
        aggregate: jest.fn().mockResolvedValue(mockData),
      };
      const getModelByObjectName = jest.fn().mockReturnValue(mockModel);

      const response = await request(app)
        .post('/api/v1/objects/testObject/filter-docs/all')
        .send({ filter: {} })
        .set('Cookie', ['access_token=your_token_here']);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('testObject fetched successfully');
      expect(response.body.data).toEqual(mockData);
    });

    it('should handle invalid request body', async () => {
      const response = await request(app)
        .post('/api/v1/objects/testObject/filter-docs/all')
        .send({})
        .set('Cookie', ['access_token=your_token_here']);

      expect(response.status).toBe(400);
    //   expect(response.body.message).toBe('Invalid filter');
    });
  });

  describe('GET /:objectName/filter-docs/paginate', () => {
    it('should return paginated data with filters by object name', async () => {
      const mockData = [{ _id: '1', name: 'Test Object' }];
      const mockModel = {
        aggregate: jest.fn().mockResolvedValue(mockData),
      };
      const getModelByObjectName = jest.fn().mockReturnValue(mockModel);

      const response = await request(app)
        .get('/api/v1/objects/testObject/filter-docs/paginate')
        .query({ page: 1, limit: 10, filters: '{}' })
        .set('Cookie', ['access_token=your_token_here']);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('testObject fetched successfully');
      expect(response.body.data.documents).toEqual(mockData);
    });

    it('should handle invalid query parameters', async () => {
      const response = await request(app)
        .get('/api/v1/objects/testObject/filter-docs/paginate')
        .query({ page: 'invalid', limit: 10, filters: '{}' })
        .set('Cookie', ['access_token=your_token_here']);

      expect(response.status).toBe(400);
      // expect(response.body.message).toBe('Invalid query parameters');
    });
  });
});