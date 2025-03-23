const request = require("supertest");
const app = require("../src/app"); // Import your Express app
const User = require("../models/user");
const Permission = require("../models/permission");
const redisClient = require("../config/redis");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const { encryptData } = require("../utils/encrypt");

global.fetch = jest.fn(); // Mock fetch globally

jest.mock("../models/user", () => ({
  findOne: jest.fn(),
}));
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
jest.mock("../utils/ApiError", () => {
  const actualApiError = jest.requireActual("../utils/ApiError");
  return actualApiError;
});

describe("Auth Controller", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("POST /auth/login", () => {
    afterEach(() => {
      // console.log("Resetting all mocks");
      jest.resetAllMocks();
    });
    it("should return 200 and tokens for valid credentials", async () => {
      const mockUser = {
        _id: "123",
        user_id: "U001",
        email: "test@example.com",
        role: "admin",
        status: "active",
        password: "password123",
        validatePassword: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          _id: "123",
          user_id: "U001",
          email: "test@example.com",
          role: "admin",
        }),
      };

      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockResolvedValueOnce("newAccessToken").mockReturnValueOnce("newRefreshToken");
      Permission.findOne.mockResolvedValue({ permissions: ["read:users"] });
      redisClient.set.mockResolvedValue(true);
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "test@example.com", password: "password123" });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Logged in successfully.");
      expect(response.body.data).toHaveProperty("permissions");
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("should return 401 for invalid credentials", async () => {
        const mockUser = {
            _id: "123",
            user_id: "U001",
            email: "test@example.com",
            role: "admin",
            status: "active",
            password: "password123",
            validatePassword: jest.fn().mockResolvedValue(false),
            toJSON: jest.fn().mockReturnValue({
              _id: "123",
              user_id: "U001",
              email: "test@example.com",
              role: "admin",
            }),
          };
    
          User.findOne.mockResolvedValue(mockUser);
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "test@example.com", password: "wrongpassword" });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid email or password");
      expect(response.body.data).not.toBeDefined();
      expect(response.body.errors).toBeDefined();
    });

    it("should return 400 if the account is inactive", async () => {
      const mockUser = {
        status: "inactive",
        validatePassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "test@example.com", password: "password123" });
      expect(response.status).toBe(400);
      expect(response.body.errors.error).toBe("Account is inactive or blocked.");
    });
  });

  describe("POST /auth/refresh-access-token", () => {
    afterEach(() => {
      jest.resetAllMocks();
    });
    it("should return 200 and new tokens for valid refresh token", async () => {
      const mockDecodedToken = {
        _id: "123",
        id: "U001",
        email: "test@example.com",
        role: "admin",
      };

    jwt.verify.mockResolvedValue(mockDecodedToken);
    redisClient.get.mockResolvedValue("validRefreshToken");
    jwt.sign.mockResolvedValueOnce("newAccessToken").mockReturnValueOnce("newRefreshToken");
    
    const response = await request(app)
    .post("/api/v1/auth/refresh-access-token")
    .set("Cookie", ["refresh_token=validRefreshToken"]);
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Access token refreshed successfully.");
    expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("should return 400 for invalid refresh token", async () => {
      jwt.verify.mockImplementation(() => {
        // console.log(secret, token);
        throw new ApiError(400, { error: "Invalid refresh token" }, "Invalid refresh token");
      }
      );
      const response = await request(app)
        .post("/api/v1/auth/refresh-access-token")
        .set("Cookie", ["refresh_token=invalidToken"]);

      expect(response.status).toBe(400);
      expect(response.body.errors.error).toBe("Invalid refresh token");
    });

    it("should return 400 for missing refresh token", async () => {
      jwt.verify.mockImplementation(() => {
        // console.log(secret, token);
        throw new ApiError(400, { error: "Invalid refresh token" }, "Invalid refresh token");
      }
      );
      const response = await request(app)
        .post("/api/v1/auth/refresh-access-token");
      expect(response.status).toBe(400);
      expect(response.body.errors.error).toBe("Invalid refresh token");
    });

    it("should return 400 for expired refresh token", async () => {
      jwt.verify.mockImplementation(() => {
        // console.log(secret, token);
        throw new jwt.JsonWebTokenError("Token expired", new jwt.TokenExpiredError("Token expired", new Date()));
      }
      );
      const response = await request(app)
        .post("/api/v1/auth/refresh-access-token")
        .set("Cookie", ["refresh_token=expiredToken"]);

      expect(response.status).toBe(401);
      expect(response.body.errors.name).toBe("JsonWebTokenError");
    });
    it("should return 400 for revoked refresh token", async () => {
      const mockDecodedToken = {
        _id: "123",
        id: "U001",
        email: "test@example.com",
        role: "admin",
      };
      jwt.verify.mockResolvedValue(mockDecodedToken);
      redisClient.get.mockResolvedValue(null);
      const response = await request(app)
        .post("/api/v1/auth/refresh-access-token")
        .set("Cookie", ["refresh_token=revokedToken"]);

      expect(response.status).toBe(400);
      expect(response.body.errors.error).toBe("Invalid refresh token");
    });
  });

  describe("GET /auth/logout", () => {
    it("should clear cookies and return 200 on logout", async () => {
      redisClient.del.mockResolvedValue(true);
      const response = await request(app)
        .get("/api/v1/auth/logout")
        .set("Cookie", ["refresh_token=validRefreshToken"]);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Logged out successfully.");
      expect(response.headers["set-cookie"]).toBeDefined();
    });
  });


  describe("POST /auth/forgot-password", () => {
    it("should return 200 and send email for valid email", async () => {
      const mockUser = {
        email: "test@example.com",
        status: "active",
      };
      User.findOne.mockResolvedValue(mockUser);
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ success: true, message: "Email sent successfully." }),
      });
      redisClient.set.mockResolvedValue(true);

      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "test@example.com" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Email sent successfully.");
    });
    it("should return 422 if email is missing", async () => {
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({});

      expect(response.status).toBe(422);
      // console.log(response.body);
      
      expect(response.body.errors.error).toBe("Email is required.");
    });

    it("should return 422 for invalid email", async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "invalid@example.com" });

      expect(response.status).toBe(422);
      expect(response.body.errors.error).toBe("Email is Not valid");
    });

    it("should return 422 if account is inactive", async () => {
      const mockUser = {
        email: "test@example.com",
        status: "inactive",
      };
      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "test@example.com" });

      expect(response.status).toBe(422);
      expect(response.body.errors.error).toBe("Your account is inactive or blocked");
    });
  });

  describe("PATCH /auth/forgot-password", () => {
    it("should return 200 and reset password for valid data", async () => {
      const mockUser = {
        email: "test@example.com",
        save: jest.fn(),
      };
      User.findOne.mockResolvedValue(mockUser);
      redisClient.get.mockResolvedValue("123456");

      const response = await request(app)
        .patch("/api/v1/auth/forgot-password")
        .send({
          encrypted_email: encryptData("test@example.com"),
          encrypted_code: encryptData("123456"),
          new_password: "newPassword123",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Password reset successfully.");
    });

    it("should return 400 for invalid or expired link", async () => {
      redisClient.get.mockResolvedValue(null);

      const response = await request(app)
        .patch("/api/v1/auth/forgot-password")
        .send({
          encrypted_email: encryptData("test@example.com"),
          encrypted_code: encryptData("123456"),
          new_password: "newPassword123",
        });
      expect(response.status).toBe(400);
      expect(response.body.errors.error).toBe("Link is invalid or expired.");
    });
  });

  describe("GET /auth/verify-email/:id", () => {
    it("should return 200 and verify email for valid id", async () => {
      const mockUser = {
        email: "test@example.com",
        status: "inactive",
        save: jest.fn(),
      };
      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .get(`/api/v1/auth/verify-email/${encryptData("test@example.com")}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Email verified successfully.");
    });

    it("should return 400 for already verified email", async () => {
      const mockUser = {
        email: "test@example.com",
        status: "active",
      };
      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .get(`/api/v1/auth/verify-email/${encryptData("test@example.com")}`);

      expect(response.status).toBe(400);
      expect(response.body.errors.error).toBe("Email is already verified.");
    });

    it("should return 400 for invalid email", async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/v1/auth/verify-email/${encryptData("invalid@example.com")}`);

      expect(response.status).toBe(400);
      expect(response.body.errors.error).toBe("Invalid email.");
    });
  });
});