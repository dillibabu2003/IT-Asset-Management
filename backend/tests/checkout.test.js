const request = require("supertest");
const app = require("../src/app"); // Import your Express app
const Checkout = require("../models/checkout");
const Employee = require("../models/employee");
const Asset = require("../models/asset");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const redisClient = require("../config/redis");
// const License = require("../models/license");

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
  get: jest.fn().mockResolvedValue(null), 
  del: jest.fn(),
}));
jest.mock("../models/permission", () => ({
  findOne: jest.fn(),
}));
jest.mock("../middlewares/authorizeClient", () => {
  return jest.fn(() => {
    return async (req, res, next) => {
      return next();
    };
  });
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
jest.mock("../models/asset", function() {
  const mockAssetModel = function(data) {
    return {
      ...data,
      generateId: jest.fn(() => "generatedId123"),
      save: jest.fn().mockResolvedValue(data)
    };
  };
  mockAssetModel.findOne = jest.fn();
  mockAssetModel.findOneAndDelete = jest.fn();
  mockAssetModel.findOneAndUpdate = jest.fn();
  mockAssetModel.find = jest.fn();
  mockAssetModel.aggregate = jest.fn();
  mockAssetModel.countDocuments = jest.fn();
  return mockAssetModel;
});
jest.mock("../models/license", function() {
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
  mockLicenseModel.aggregate = jest.fn();
  mockLicenseModel.countDocuments = jest.fn();
  return mockLicenseModel;
});
jest.mock("../models/checkout", function() {
  const mockCheckoutModel = function(data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(data)
    };
  };
  mockCheckoutModel.findOne = jest.fn();
  mockCheckoutModel.findOneAndDelete = jest.fn();
  mockCheckoutModel.findOneAndUpdate = jest.fn();
  mockCheckoutModel.find = jest.fn();
  mockCheckoutModel.aggregate = jest.fn();
  mockCheckoutModel.countDocuments = jest.fn();
  mockCheckoutModel.create = jest.fn(); 
  return mockCheckoutModel;
});
jest.mock("../models/employee", function() {
  const mockEmployeeModel = function(data) {
    return {
      ...data,
      generateId: jest.fn(() => "generatedId123"),
      save: jest.fn().mockResolvedValue(data)
    };
  };
  mockEmployeeModel.findOne = jest.fn();
  mockEmployeeModel.findOneAndDelete = jest.fn();
  mockEmployeeModel.findOneAndUpdate = jest.fn();
  mockEmployeeModel.find = jest.fn();
  mockEmployeeModel.aggregate = jest.fn();
  mockEmployeeModel.countDocuments = jest.fn();
  return mockEmployeeModel;
});


describe("Checkout Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const demoDecodedToken = { _id: "6bdfjdkj45763", id: "DBOX001", email: "dboxtest@test.com", role: "admin" };
    jwt.verify.mockResolvedValueOnce(demoDecodedToken);
    redisClient.get.mockResolvedValue("ACCESS_TOKEN_"+demoDecodedToken.id);
    
    
    const session = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    mongoose.startSession.mockResolvedValue(session);
  });

  describe("POST /api/v1/checkout/assign/individual", () => {
    it("should assign an item to an employee successfully", async () => {
      const mockEmployee = { _id: "employeeId123", employee_id: "EMP001" };
      const mockAsset = new Asset({
        _id: "assetId123", serial_no: "SN001", status: "available"
      });
      
      Employee.findOne.mockResolvedValue(mockEmployee);
      Asset.find.mockResolvedValue([mockAsset]);
      Checkout.countDocuments.mockResolvedValueOnce(1);
      Checkout.countDocuments.mockResolvedValueOnce(2);

      const response = await request(app)
        .post("/api/v1/checkout/assign/individual")
        .set("Cookie", [`access_token=some_token`]) // Setting the mocked token in cookies
        .send({
          object_name: "assets",
          employee_info: { employee_id: "EMP001" },
          serial_no: "SN001",
        });
        
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Checkout successfull");
    });

    it("should return 422 if required fields are missing", async () => {
      const response = await request(app)
        .post("/api/v1/checkout/assign/individual")
        .set("Cookie", [`access_token=some_token`]) // Setting the mocked token in cookies
        .send({
          object_name: "assets",
          serial_no: "SN001",
        });

      expect(response.status).toBe(422);
      expect(response.body.message).toBe("Invalid checkout information");
    });
    it("should return 400 if required items are already assigned to someone", async () => {
      Asset.find.mockResolvedValue([]);
      const response = await request(app)
      .post("/api/v1/checkout/assign/individual")
      .set("Cookie", [`access_token=some_token`]) // Setting the mocked token in cookies
      .send({
        object_name: "assets",
        employee_info: { employee_id: "EMP001" },
        serial_no: "SN001",
      });
      expect(response.status).toBe(400);
    });
    it("should return 400 if object_name is invalid", async () => {
      Asset.find.mockResolvedValue([]);
      const response = await request(app)
      .post("/api/v1/checkout/assign/individual")
      .set("Cookie", [`access_token=some_token`]) // Setting the mocked token in cookies
      .send({
        object_name: "assetsssssssssss",
        employee_info: { employee_id: "EMP001" },
        serial_no: "SN001",
      });
      expect(response.status).toBe(400);
    });

    it("should return 400 if the employee does not exist", async () => {
      Employee.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/checkout/assign/individual")
        .set("Cookie", [`access_token=some_token`]) // Setting the mocked token in cookies
        .send({
          object_name: "assets",
          employee_info: { employee_id: "EMP001" },
          serial_no: "SN001",
        });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/v1/checkout/unassign/individual", () => {
    it("should unassign an item from an employee successfully", async () => {
      const mockEmployee = { _id: "employeeId123", employee_id: "EMP001" };
      const mockAsset = new Asset({
        _id: "assetId123", serial_no: "SN001", status: "deployed",assigned_to: "EMP001",
        end: new Date()
      })
      const mockCheckout = { _id: "checkoutId123", checkout_id: "CHK001" };

      Employee.findOne.mockResolvedValue(mockEmployee);
      Asset.findOne.mockResolvedValue(mockAsset);
      Checkout.findOneAndUpdate.mockResolvedValue(mockCheckout);

      const response = await request(app)
        .post("/api/v1/checkout/unassign/individual")
        .set("Cookie", [`access_token=some_token`]) // Setting the mocked token in cookies
        .send({
          object_name: "assets",
          info_to_unassign: { employee_id: "EMP001", serial_no: "SN001" },
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Unassignment successfull");
      expect(Checkout.findOneAndUpdate).toHaveBeenCalled();
    });
    it("should return 400 if the item is not assigned to the employee", async () => {
      const mockEmployee = { _id: "employeeId123", employee_id: "EMP001" };

      Employee.findOne.mockResolvedValue(mockEmployee);
      Asset.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/checkout/unassign/individual")
        .set("Cookie", [`access_token=some_token`]) // Setting the mocked token in cookies
        .send({
          object_name: "assets",
          info_to_unassign: { employee_id: "EMP001", serial_no: "SN001" },
        });
      expect(response.status).toBe(400);
    });
    it("should return 422 if params are missing", async () => {
      const response = await request(app)
        .post("/api/v1/checkout/unassign/individual")
        .set("Cookie", [`access_token=some_token`]) // Setting the mocked token in cookies
        .send({
          info_to_unassign: { employee_id: "EMP001", serial_no: "SN001" },
        });
      expect(response.status).toBe(422);
    });
    it("should return 400 if the item doesnot exist", async () => {
      const mockEmployee = { _id: "employeeId123", employee_id: "EMP001" };

      Employee.findOne.mockResolvedValue(mockEmployee);
      Asset.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/checkout/unassign/individual")
        .set("Cookie", [`access_token=some_token`]) // Setting the mocked token in cookies
        .send({
          object_name: "assets",
          info_to_unassign: { employee_id: "EMP001", serial_no: "SN001" },
        });
      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/v1/checkout/assign/bulk", () => {
    it("should assign multiple items to employees successfully", async () => {
      const mockEmployee = { _id: "employeeId123", employee_id: "EMP001" };
      const mockAsset = new Asset({
        _id: "assetId123", serial_no: "SN001", status: "available",
        end: new Date()
      });
      Employee.findOne.mockResolvedValue(mockEmployee);
      Asset.find.mockResolvedValue([mockAsset]);
      Checkout.countDocuments.mockResolvedValueOnce(1);
      Checkout.countDocuments.mockResolvedValueOnce(2);

      const response = await request(app)
        .post("/api/v1/checkout/assign/bulk")
        .set("Cookie", [`access_token=some_token`]) // Setting the mocked token in cookies
        .send({
          object_name: "assets",
          info_to_assign: [{ employee_id: "EMP001", serial_no: "SN001" }],
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Checkout successfull");
    });
    it("should return 422 if params are missing", async () => {
      const response = await request(app)
      .post("/api/v1/checkout/assign/bulk")
      .set("Cookie", [`access_token=some_token`]) // Setting the mocked token in cookies
      .send({});
      expect(response.status).toBe(422);
    });
    it("should return 400 if object_name is invalid", async () => {
      Asset.find.mockResolvedValue([]);
      const response = await request(app)
      .post("/api/v1/checkout/assign/bulk")
      .set("Cookie", [`access_token=some_token`]) // Setting the mocked token in cookies
      .send({
        object_name: "assetssssssssss",
          info_to_assign: [{ employee_id: "EMP001", serial_no: "SN001" }],
      });
      expect(response.status).toBe(400);
    });

    it("should return 400 if duplicate serial numbers are found", async () => {
      const response = await request(app)
        .post("/api/v1/checkout/assign/bulk")
        .set("Cookie", [`access_token=some_token`]) // Setting the mocked token in cookies
        .send({
          object_name: "assets",
          info_to_assign: [
            { employee_id: "EMP001", serial_no: "SN001" },
            { employee_id: "EMP002", serial_no: "SN001" },
          ],
        });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/v1/checkout/unassign/bulk", () => {
    it("should unassign items from employees successfully", async () => {
      const mockEmployee = { _id: "employeeId123", employee_id: "EMP001" };
      const mockAsset = new Asset({
        _id: "assetId123", serial_no: "SN001", status: "deployed",assigned_to: "EMP001",
        end: new Date()
      })
      const mockCheckout = { _id: "checkoutId123", checkout_id: "CHK001" };

      Employee.findOne.mockResolvedValue(mockEmployee);
      Asset.findOne.mockResolvedValue(mockAsset);
      Checkout.findOneAndUpdate.mockResolvedValue(mockCheckout);

      const response = await request(app)
        .post("/api/v1/checkout/unassign/bulk")
        .set("Cookie", [`access_token=some_token`]) // Setting the mocked token in cookies
        .send({
          object_name: "assets",
          info_to_unassign: [{ employee_id: "EMP001", serial_no: "SN001" }],
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Unassignment successfull");
      expect(Checkout.findOneAndUpdate).toHaveBeenCalled();
    });
    it("should return 400 if the item is not assigned to the employee", async () => {
      const mockEmployee = { _id: "employeeId123", employee_id: "EMP001" };

      Employee.findOne.mockResolvedValue(mockEmployee);
      Asset.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/checkout/unassign/bulk")
        .set("Cookie", [`access_token=some_token`]) // Setting the mocked token in cookies
        .send({
          object_name: "assets",
          info_to_unassign: [{ employee_id: "EMP001", serial_no: "SN001" }],
        });
      expect(response.status).toBe(400);
    });
    it("should return 422 if params are missing", async () => {
      const response = await request(app)
        .post("/api/v1/checkout/unassign/bulk")
        .set("Cookie", [`access_token=some_token`]) // Setting the mocked token in cookies
        .send({
          info_to_unassign: { employee_id: "EMP001", serial_no: "SN001" },
        });
      expect(response.status).toBe(422);
    });
    it("should return 400 if the item doesnot exist", async () => {
      const mockEmployee = { _id: "employeeId123", employee_id: "EMP001" };

      Employee.findOne.mockResolvedValue(mockEmployee);
      Asset.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/checkout/unassign/bulk")
        .set("Cookie", [`access_token=some_token`]) // Setting the mocked token in cookies
        .send({
          object_name: "assets",
          info_to_unassign: [{ employee_id: "EMP001", serial_no: "SN001" }],
        });
      expect(response.status).toBe(400);
    });
  });

  describe("GET /checkout", () => {
    it("should fetch paginated checkouts successfully", async () => {
      const mockCheckouts = [
        { _id: "checkoutId123", checkout_id: "CHK001" },
        { _id: "checkoutId124", checkout_id: "CHK002" },
      ];

      Checkout.find.mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockCheckouts),
      }));
      Checkout.countDocuments.mockResolvedValue(2);

      const response = await request(app)
      .get("/api/v1/checkout/")
      .set("Cookie", [`access_token=some_token`]) // Setting the mocked token in cookies
        .query({ page: 1, limit: 10 });      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Checkouts fetched successfully");
      expect(response.body.data.checkouts).toHaveLength(2);
    });

    it("should return 422 for invalid query parameters", async () => {
      const response = await request(app)
        .get("/api/v1/checkout/")
        .set("Cookie", [`access_token=some_token`]) // Setting the mocked token in cookies
          .query({ page: "invalid thing", limit: 10 });

      expect(response.status).toBe(422);
    });
  });
});