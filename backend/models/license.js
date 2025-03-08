const mongoose = require("mongoose");
const { convertSnakeCaseToPascaleCase, convertPascaleCaseToSnakeCase } = require("../utils/helperFunctions");

const LicenseSchema = new mongoose.Schema({
  license_id: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
    enum: ["sophos", "grammarly", "microsoft", "adobe", "autodesk"],
    get: (v) => convertSnakeCaseToPascaleCase(v),
    set: (v)=> convertPascaleCaseToSnakeCase(v),
    required: true,
  },
  invoice_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
    justOne: true,
    required: true,
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    justOne: true,
    default: null,
    sparse: true,
  },
  model: {
    type: String,
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  warranty: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["available", "activated", "expired", "about_to_expire"],
    get: (v) => convertSnakeCaseToPascaleCase(v),
    set: (v) => convertPascaleCaseToSnakeCase(v),
    required: true,
  },
}, {
  virtuals: {
    expiry: {
      get() {
        const now = new Date();
        const end = this.end;
        const diff = Math.abs(end - now);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const years = Math.floor(days / 365);
        const months = Math.floor((days % 365) / 30);
        const remainingDays = Math.floor(days % 30);
        let result = [];
        if (years > 0) result.push(`${years} years`);
        if (months > 0) result.push(`${months} months`);
        if (remainingDays > 0) result.push(`${remainingDays} days`);
        return result.join(', ');
      },
    },
    name: {
      get() {
        const category = this.category.charAt(0).toUpperCase() + this.category.substring(1);
        const model = this.model.charAt(0).toUpperCase() + this.model.substring(1);
        return `${category} ${model}`;
      },
    }
  },
  timestamps: true,toJSON: { virtuals: true,getters:true,setters:true },toObject: { virtuals: true,getters:true,setters:true },runSettersOnQuery: true,id: false
});

// Updates License statuses based on the current date daily with help of cron job
LicenseSchema.statics.updateLicenseStatuses = async function(daysBeforeExpiry = 7) {
  const now = new Date();
  const warningPeriod = daysBeforeExpiry * 24 * 60 * 60 * 1000; // convert days to milliseconds

  await this.updateMany(
    { end: { $lt: now }, status: { $ne: 'expired' } },
    { $set: { status: 'expired' } }
  );

  await this.updateMany(
    { 
      end: { $gt: now, $lte: new Date(now.getTime() + warningPeriod) },
      status: { $nin: ['expired', 'about_to_expire'] }
    },
    { $set: { status: 'about_to_expire' } }
  );
};

// Add validation for start and end dates
LicenseSchema.pre('save', function(next) {
  if (this.start > this.end) {
    next(new Error('Start date cannot be later than end date'));
  }
  next();
});


module.exports = mongoose.model("License", LicenseSchema);
