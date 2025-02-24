const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
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
  fullname: {
    type: String,
    virtual: true,
    get() {
      return `${this.firstname} ${this.lastname}`;
    },
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
    enum: ["active","inactive","blocked","invalid_email"]
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
});

UserSchema.set("toJSON", { virtuals: true });

UserSchema.methods.validatePassword = async function(plainTextPassword){
  const isPasswordCorrect = await bcrypt.compare(plainTextPassword,this.password);
  return isPasswordCorrect;
}

//Middleware to encrypt the password
UserSchema.pre("save",async function(next){
  if(!this.isModified(this.password)) next() ;
  this.password=await bcrypt.hash(this.password,10);
  next();
});

module.exports = mongoose.model("User", UserSchema);
