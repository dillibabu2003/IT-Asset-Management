const zod = require("zod");
const { genderEnum, passwordRegex } = require("./constants");

const envSchema = zod.object({
  PORT: zod.string({ message: "Port is required and should be a number" }),
  MONGO_URI: zod.string({ message: "MONGO_URI is required" }),
  DB_NAME: zod.string({ message: "DB name is required" }),
  ACCESS_TOKEN_SECRET: zod.string({ message: "Access token is required." }),
  REFRESH_TOKEN_SECRET: zod.string({ message: "Refresh token is required." }),
  REDIS_URI: zod.string({ message: "REDIS_URI is required." }),
  S3_BUCKET_NAME: zod.string({ message: "Image Url is required" }),
  S3_REGION: zod.string({ message: "S3 region is required" }),
  S3_PROFILE_PIC_FOLDER: zod.string({
    message: "S3 profile pic folder name is required",
  }),
  S3_INVOICES_FOLDER: zod.string({
    message: "S3 invoices folder name is required",
  }),
  AWS_SECRET_KEY: zod.string({ message: "AWS secret key is required" }),
  AWS_ACCESS_KEY: zod.string({ message: "AWS access key is required" }),
  EMAIL_API: zod.string({ message: "Email Api is required." }),
  CORS_FRONTEND_BASE_URI: zod.string({
    message: "CORS frontend base uri is required.",
  }),
});

const loginSchema = zod.object({
  email: zod
    .string({ message: "Email is required." })
    .email({ message: "Email is not valid." }),
  password: zod.string({ message: "Password is required." }),
});

const userSchema = zod.object({
  user_id: zod.string({ message: "User Id is required." }),
  role: zod.string({ message: "Role is required" }),
  firstname: zod
    .string({ message: "First name is required" })
    .min(2, { message: "First name should be at least two characters" })
    .max(30, { message: "First name should not exceed 30 characters" }),
  lastname: zod
    .string({ message: "Last name is required" })
    .min(2, { message: "Last name should be at least two characters" })
    .max(30, { message: "Last name should not exceed 30 characters" }),
  email: zod
    .string({ message: "Email is required" })
    .email({ message: "Email is not valid." }),
  password: zod
    .string({ message: "Password is required" })
    .regex(passwordRegex, {
      message:
        "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character",
    }),
  date_of_birth: zod.coerce.date({ message: "Date is not valid" }),
  // status: zod.enum(statusEnum,{message:"Status is not valid"}),
  gender: zod.enum(genderEnum, { message: "Gender is not valid" }),
});

const metadataSchema = zod.object({
  bleongs_to: zod.string({ message: "Belongsto is required" }),
  id: zod.string({ message: "Id is required" }),
  label: zod.string({ message: "label is required" }),
  required: zod.boolean({ message: "Required should be a boolean" }),
  additional: zod.boolean({
    message: "Additional Field is required and should be a boolean",
  }),
  type: zod.enum(["text", "textarea", "date", "select"], {
    message: "type should be valid",
  }),
  options: zod.array({ message: "options is required and should be an array" }),
});

const tileSchema = zod.object({
  title: zod.string({ message: "Title is required" }),
  matcher_field: zod.string({ message: "Matcher field is required" }),
  matcher_value: zod.union([
    zod.string(),
    zod.object({
      start_date: zod.coerce.date({ message: "Date is not valid" }),
      end_date: zod.coerce.date({ message: "Date is not valid" }),
    }),
  ]),
  func: zod.enum(["sum", "count", "avg"], {
    message: "Function should be valid",
  }),
  target: zod.string({ message: "Target is required" }).optional(),
  icon: zod.string({ message: "Icon is required" }),
  color: zod.string({ message: "Color is required" }),
  _id: zod.string({ message: "Id is required" }),
});

const elementSchema = zod.object({
  title: zod.string({ message: "Title is required" }),
  type: zod.enum(["table", "pie", "bar", "line"], {
    message: "Type should be valid",
  }),
  fields: zod.array(zod.string(), {
    message: "Fields is required and should be an array",
  }),
  _id: zod.string({ message: "Id is required" }),
});

const configureDashboardSchema = zod.object({
  id: zod.string({ message: "Id is required" }),
  label: zod.string({ message: "label is required" }),
  tiles: zod.array(tileSchema, {
    message: "Tiles is required and should be an array",
  }),
  elements: zod.array(elementSchema),
  _id: zod.string({ message: "Id is required" }),
});

module.exports = {
  envSchema,
  loginSchema,
  userSchema,
  metadataSchema,
  tileSchema,
  elementSchema,
  configureDashboardSchema,
};
