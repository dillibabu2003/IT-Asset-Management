const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { statusEnum, genderEnum, roleEnum } = require("../utils/constants");

const UserSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
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
    default: "someurl",
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
},{
  virtuals: {
    fullname: {
      get() {
        return `${this.firstname} ${this.lastname}`;
      },
    },
  }
});

UserSchema.set("toJSON", { virtuals: true,transform: (doc, ret) => {
  delete ret._id;
  delete ret.__v;
  delete ret.id;
  return ret;
}, });

UserSchema.methods.validatePassword = async function(plainTextPassword){
  return new Promise((resolve, reject) => {
    bcrypt.compare(plainTextPassword, this.password, (err, res) => {
      if (err) resolve(false);
      resolve(res);
    })
  })
}
//Middleware to encrypt the password
UserSchema.pre("save",async function(next){
  if(this.isModified("password")){
      this.password=await bcrypt.hash(this.password,10);
  }
  next();
});
module.exports = mongoose.model("User", UserSchema);
