const request = require("supertest");
const app = require("../src/app");
const User = require("../models/user");
const redisClient = require("../config/redis");
const jwt = require("jsonwebtoken");
const { uploadFileToS3 } = require("../services/s3");
const { hitEmailServerApi} = require("../services/email");
const mongoose = require("mongoose");


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
jest.mock("../models/user", function() {
  const mockUserModel = function(data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(data)
    };
  };
  mockUserModel.findOne = jest.fn();
  mockUserModel.findOneAndDelete = jest.fn();
  mockUserModel.findOneAndUpdate = jest.fn();
  mockUserModel.find = jest.fn();
  mockUserModel.aggregate = jest.fn();
  mockUserModel.countDocuments = jest.fn();
  return mockUserModel;
});
jest.mock("../models/userPreference", function() {
  const mockUserVisibilityModel = function(data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(data)
    };
  };
  mockUserVisibilityModel.findOne = jest.fn();
  mockUserVisibilityModel.findOneAndDelete = jest.fn();
  mockUserVisibilityModel.findOneAndUpdate = jest.fn();
  mockUserVisibilityModel.find = jest.fn();
  mockUserVisibilityModel.aggregate = jest.fn();
  mockUserVisibilityModel.countDocuments = jest.fn();
  return mockUserVisibilityModel;
});
jest.mock("../config/redis", () => ({
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
}));
jest.mock("../models/permission", () => ({
  findOne: jest.fn(),
}));
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
jest.mock("../middlewares/authorizeClient", () => {
  return jest.fn(() => {
    return async (req, res, next) => {
      return next();
    };
  });
});
jest.mock("../services/s3", () => ({
  uploadFileToS3: jest.fn(),
}));
jest.mock("../services/email", () => ({
  hitEmailServerApi: jest.fn(),
  EMAIL_TYPES: {
    VERIFY_EMAIL: "VERIFY_EMAIL",
  },
}));

describe("User Controller", () => {
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
  

  describe("POST /user/create", () => {
    afterEach(() => {
      jest.resetAllMocks();
    });
    it("should create a new user", async () => {
   

      User.findOne.mockResolvedValue(null);
      
      uploadFileToS3.mockResolvedValue({ s3Response: { $metadata: { httpStatusCode: 200 } } });
      hitEmailServerApi.mockResolvedValue({ emailResponse: { success: true }, error: null });

      const response = await request(app)
        .post("/api/v1/user/create")
        .set('Cookie', ['access_token=your_token_here'])
        .send({
          "user_id": "U001",
          "role": "admin",
          "firstname": "John",
          "lastname": "Doe",
          "email": "john.doe@example.com",
          "password": "Password@123",
          "date_of_birth": "1990-01-01",
          "gender": "male"
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("User created successfully.");
    });

    it("should return 400 if user already exists", async () => {
      const mockUser = {
        _id: "123",
        user_id: "U001",
        email: "test@example.com",
        role: "admin",
        status: "active",
        password: "password123",
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/api/v1/user/create")
        .set('Cookie', ['access_token=your_token_here'])
        .send({
         "user_id": "U001",
          "role": "admin",
          "firstname": "John",
          "lastname": "Doe",
          "email": "john.doe@example.com",
          "password": "Password@123",
          "date_of_birth": "1990-01-01",
          "gender": "male"
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("User with email or user_id  exists");
    });
  });

  describe("GET /user/details", () => {
    afterEach(() => {
      jest.resetAllMocks();
    });
    it("should return user details", async () => {
      const mockUser = {
        _id: "123",
        user_id: "U001",
        email: "test@example.com",
        role: "admin",
        status: "active",
        password: "password123",
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .get("/api/v1/user/details")
        .set('Cookie', ['access_token=your_token_here'])
        .send({ user_id: "U001" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User data fetched Successfully");
    });

    it("should return 400 if user not found", async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/v1/user/details")
        .set('Cookie', ['access_token=your_token_here'])
        .send({ user_id: "U001" });
      expect(response.status).toBe(400);
    });
  });

  describe("PUT /user/update", () => {
    afterEach(() => {
      jest.resetAllMocks();
    });
    it("should update user details", async () => {
      const mockUser = {
        _id: "123",
        user_id: "U001",
        email: "test@example.com",
        role: "admin",
        status: "active",
        password: "password123",
      };

      User.findOneAndUpdate.mockResolvedValue(mockUser);

      const response = await request(app)
        .put("/api/v1/user/update")
        .set('Cookie', ['access_token=your_token_here'])
        .send({
          user_id: "U001",
          email: "updated@example.com",
          role: "admin",
          status: "active",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User updated successfully");
    });

    it("should return 400 if user not found", async () => {
      User.findOneAndUpdate.mockResolvedValue(null);

      const response = await request(app)
        .put("/api/v1/user/update")
        .set('Cookie', ['access_token=your_token_here'])
        .send({
          user_id: "U001",
          email: "updated@example.com",
          role: "admin",
          status: "active",
        });

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /user/delete", () => {
    afterEach(() => {
      jest.resetAllMocks();
    });
    it("should delete user", async () => {
      const mockUser = {
        _id: "123",
        user_id: "U001",
        email: "test@example.com",
        role: "admin",
        status: "active",
        password: "password123",
      };

      User.findOneAndDelete.mockResolvedValue(mockUser);

      const response = await request(app)
        .delete("/api/v1/user/delete")
        .set('Cookie', ['access_token=your_token_here'])
        .send({ user_id: "U001" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User Deleted Successfully");
    });

    it("should return 404 if user not found", async () => {
      User.findOneAndDelete.mockResolvedValue(null);

      const response = await request(app)
        .delete("/api/v1/user/delete")
        .set('Cookie', ['access_token=your_token_here'])
        .send({ user_id: "U001" });

      expect(response.status).toBe(404);
    });
  });

  describe("GET /user/all", () => {
    afterEach(() => {
      jest.resetAllMocks();
    });
    it("should return all users", async () => {
      const mockUsers = [
        {
          _id: "123",
          user_id: "U001",
          email: "test1@example.com",
          role: "admin",
          status: "active",
          password: "password123",
        },
        {
          _id: "124",
          user_id: "U002",
          email: "test2@example.com",
          role: "member",
          status: "active",
          password: "password123",
        },
      ];
      const mockSelect = jest.fn().mockResolvedValue(mockUsers);
      User.find.mockImplementation(()=>({
        select: mockSelect }));

      const response = await request(app).get("/api/v1/user/all").set('Cookie', ['access_token=your_token_here'])
      ;

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Users fetched successfully.");
    });
  });

  describe("GET /user/search/:searchKey", () => {
    afterEach(() => {
      jest.resetAllMocks();
    });
    it("should return users based on search key", async () => {
      const mockUsers = [
        {
          _id: "123",
          user_id: "U001",
          email: "test1@example.com",
          role: "admin",
          status: "active",
          password: "password123",
        },
      ];

      User.aggregate.mockResolvedValue(mockUsers);

      const response = await request(app).get("/api/v1/user/search/test").set('Cookie', ['access_token=your_token_here']);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Users fetched successfully.");
    });
  });
});
