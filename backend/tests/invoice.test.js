const request = require('supertest');
const express = require('express');
const { createInvoice, updateInvoice, deleteInvoice, getPaginatedInvoices, getInvoiceById, getUserColumnVisibilities } = require('../controllers/invoice');
const Invoice = require('../models/invoice');
const License = require('../models/license');
const UserVisibility = require('../models/userPreference');
const Asset = require('../models/asset');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const mongoose = require('mongoose');
const authorizeClient = require('../middlewares/authorizeClient');

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
  get: jest.fn().mockResolvedValue(null),
  del: jest.fn(),
}));
jest.mock("../models/permission", () => ({
  findOne: jest.fn(),
}));

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


jest.mock('../models/invoice', function() {
    const mockInvoiceModel = function(data) {
      return {
        ...data,
        save: jest.fn().mockResolvedValue(data)
      };
    };
    mockInvoiceModel.findOne = jest.fn();
    mockInvoiceModel.findOneAndDelete = jest.fn();
    mockInvoiceModel.findOneAndUpdate = jest.fn();
    mockInvoiceModel.findByIdAndUpdate = jest.fn();
    mockInvoiceModel.find = jest.fn();
    mockInvoiceModel.aggregate = jest.fn();
    mockInvoiceModel.countDocuments = jest.fn();
    mockInvoiceModel.insertMany = jest.fn();
    mockInvoiceModel.deleteMany = jest.fn();
    mockInvoiceModel.deleteOne = jest.fn();
    mockInvoiceModel.aggregate = jest.fn().mockImplementation(() => {
      return {
      exec: jest.fn()
      }
    });
    
    return mockInvoiceModel;
  });
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
jest.mock('../models/asset', function() {
    const mockAssetModel = function(data) {
      return {
        ...data,
        save: jest.fn().mockResolvedValue(data)
      };
    };
    mockAssetModel.findOne = jest.fn();
    mockAssetModel.findOneAndDelete = jest.fn();
    mockAssetModel.findOneAndUpdate = jest.fn();
    mockAssetModel.find = jest.fn();
    mockAssetModel.deleteMany = jest.fn();
    mockAssetModel.deleteOne = jest.fn();
    mockAssetModel.aggregate = {
        exec: jest.fn()
    },
    mockAssetModel.insertMany = jest.fn();
    mockAssetModel.save=jest.fn().mockResolvedValue(true)
    return mockAssetModel;
});
jest.mock('../models/userPreference', function() {
    const mockUserVisibility = function(data) {
      return {
        ...data,
        save: jest.fn().mockResolvedValue(data)
      };
    };
    mockUserVisibility.findOne = jest.fn();
    mockUserVisibility.findOneAndDelete = jest.fn();
    mockUserVisibility.findOneAndUpdate = jest.fn();
    mockUserVisibility.find = jest.fn();
    mockUserVisibility.countDocuments = jest.fn();
    mockUserVisibility.insertMany = jest.fn();
    mockUserVisibility.deleteMany = jest.fn();
    mockUserVisibility.deleteOne = jest.fn();
    return mockUserVisibility;
});


describe('Invoice Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
      const demoDecodedToken = { _id: "6bdfjdkj45763", id: "DBOX001", email: "dboxtest@test.com", role: "admin" };
      jwt.verify.mockResolvedValueOnce(demoDecodedToken);
      redisClient.get.mockResolvedValueOnce("ACCESS_TOKEN_"+demoDecodedToken.id);
      
      
      const session = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };
      mongoose.startSession.mockResolvedValue(session);
  });
  describe('POST /invoices/create', () => {
    // afterEach(() => {
    //     jest.resetAllMocks();
    //   });
    it('should create a new invoice and return 200', async () => {
      License.insertMany.mockResolvedValueOnce([]);
      Asset.insertMany.mockResolvedValueOnce([]);

      const res = await request(app)
        .post('/api/v1/invoices/create')
        .set('Cookie', ['access_token=your_token_here'])
        .send({
          invoice_id: 'INV001',
          invoice_date: new Date().toISOString(),
          total_amount: 1000,
          licenses: [],
          assets: [],
          vendor_name: 'Vendor A',
          owner_name: 'Owner A',
          invoice_description: 'Test description',
          invoice_filename: 'invoice.pdf'
        })

      expect(res.status).toBe(200);
    //   expect(res.body.message).toBe('Invoice Created Successfully');
    });

    it('should return 400 if there is an error creating the invoice', async () => {
        
      License.insertMany.mockImplementation(() => {
        throw new Error();
      });
      Asset.insertMany.mockImplementation(() => {
        throw new Error();
      });
        const res = await request(app)
            .post('/api/v1/invoices/create')
            .set('Cookie', ['access_token=your_token_here'])
            .send({
              invoice_id: 'INV001',
              invoice_date: new Date().toISOString(),
              total_amount: 1000,
              licenses: [],
              assets: [],
              vendor_name: 'Vendor A',
              owner_name: 'Owner A',
              invoice_description: 'Test description',
              invoice_filename: 'invoice.pdf'
            });
            
        // console.log(res);
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Error Creating Invoice');
    });
  });

describe('DELETE /invoices/delete', () => {
    it('should delete an invoice and return 200', async () => {
        const session = await mongoose.startSession();
        session.startTransaction = jest.fn();
        session.commitTransaction = jest.fn();
        session.abortTransaction = jest.fn();
        session.endSession = jest.fn();

        Invoice.findOne.mockResolvedValue({ _id: '1', data: new Map([['licenses', []], ['assets', []]]) });
        License.deleteMany.mockResolvedValue({});
        Asset.deleteMany.mockResolvedValue({});
        Invoice.deleteOne.mockResolvedValue({});

        const res = await request(app)
            .delete('/api/v1/invoices/delete')
            .send({ invoice_id: 'INV001' })
            .set('Cookie', ['access_token=your_token_here']);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Invoice deleted Succefully');
    });

    it('should return 400 if there is an error deleting the invoice', async () => {

        Invoice.findOne.mockRejectedValue(new Error('Database error'));

        const res = await request(app)
            .delete('/api/v1/invoices/delete')
            .send({ invoice_id: 'INV001' })
            .set('Cookie', ['access_token=your_token_here']);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Error Deleting Invoice');
    });
});

describe('GET /invoices/paginate', () => {
    it('should return paginated invoices and return 200', async () => {
        const mockInvoices = [{ _id: '1', invoice_id: 'INV001' }];
        Invoice.countDocuments.mockResolvedValue(1);
        Invoice.aggregate.mockResolvedValue(mockInvoices);
        
        const res = await request(app)
            .get('/api/v1/invoices/paginate?page=1&limit=10')
            .set('Cookie', ['access_token=your_token_here']);

        console.log(res);
        expect(res.status).toBe(200);
        // expect(res.body.message).toBe('Invoices fetched successfully');
        expect(res.body.data.invoices).toEqual(mockInvoices);
    });

    it('should return 400 if query parameters are invalid', async () => {
        const res = await request(app)
            .get('/api/v1/invoices/paginate?page=invalid&limit=10')
            .set('Cookie', ['access_token=your_token_here']);

        expect(res.status).toBe(400);
        // expect(res.body.message).toBe('Invalid query parameters');
    });
});

describe('GET /invoices/:id', () => {
    it('should return an invoice by id and return 200', async () => {
        const mockInvoice = { _id: '1', invoice_id: 'INV001' };
        Invoice.find.mockResolvedValue(mockInvoice);

        const res = await request(app)
            .get('/api/v1/invoices/1')
            .set('Cookie', ['access_token=your_token_here']);

        expect(res.status).toBe(200);
        // expect(res.body.message).toBe('Invoice Fetched Successfully');
        // expect(res.body.data).toEqual(mockInvoice);
    });

    it('should return 404 if the invoice is not found', async () => {
        Invoice.find.mockResolvedValue(null);

        const res = await request(app)
            .get('/api/v1/invoices/1')
            .set('Cookie', ['access_token=your_token_here']);

        expect(res.status).toBe(404);
        // expect(res.body.message).toBe('Invoice not found');
    });
});

describe('GET /invoices/column-visibilities', () => {
    it('should return user column visibilities and return 200', async () => {
        const mockUserColumnVisibilities = {
              user_id: "6bdfjdkj45763",
              visible_fields: {
                invoices: {
                  invoice_id: true,
                  invoice_date: false,
                  total_amount: true
                },
                assets: {
                  asset_name: true,
                  asset_status: false
                }
              }
            };
        UserVisibility.findOne.mockResolvedValue(mockUserColumnVisibilities);

        const res = await request(app)
            .get('/api/v1/invoices/column-visibilities')
            .set('Cookie', ['access_token=your_token_here']);
        console.log(res);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Invoices Column preferences fetched successfully.');
        expect(res.body.data).toEqual(mockUserColumnVisibilities.visible_fields.invoices);
    });

    it('should return 400 if user preferences are not found', async () => {
        UserVisibility.findOne.mockResolvedValue(null);

        const res = await request(app)
            .get('/api/v1/invoices/column-visibilities')
            .set('Cookie', ['access_token=your_token_here']);

        expect(res.status).toBe(400);
        // expect(res.body.message).toBe('User preferences not found');
    });
});
});