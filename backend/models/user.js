const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { statusEnum, genderEnum, roleEnum } = require("../utils/constants");

const UserSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
      match: /^DBOX[a-zA-Z0-9]+$/,
    },
    role: {
      type: String,
      enum: roleEnum,
      required: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile_pic: {
      type: String,
      default:
        "https://dbox-it-asset-management.s3.ap-south-1.amazonaws.com/profile-pics/default.png",
    },
    date_of_birth: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: statusEnum,
      default: "inactive",
      required: true,
    },
    gender: {
      type: String,
      enum: genderEnum,
      required: true,
    },
  },
  {
    virtuals: {
      fullname: {
        get() {
          return `${this.firstname} ${this.lastname}`;
        },
      },
    },
    toJSON: { virtuals: true, getters: true, setters: true },
    toObject: { virtuals: true, getters: true, setters: true },
    timestamps: true,
    runSettersOnQuery: true,
  },
);

UserSchema.methods.validatePassword = async function (plainTextPassword) {
  return new Promise((resolve) => {
    bcrypt.compare(plainTextPassword, this.password, (err, res) => {
      if (err) resolve(false);
      resolve(res);
    });
  });
};
//Middleware to encrypt the password
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
module.exports = mongoose.model("User", UserSchema);
