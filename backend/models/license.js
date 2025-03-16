const mongoose = require("mongoose");
const { convertSnakeCaseToPascaleCase, convertPascaleCaseToSnakeCase } = require("../utils/helperFunctions");

const LicenseSchema = new mongoose.Schema({
  serial_no: {
    type: String,
    required: true,
    unique: true,
  },
  license_id: {
    type: String,
    default: null,
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
    default:"available",
    enum: ["available", "activated","reissue", "about_to_archive", "archived"],
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
LicenseSchema.index(
  { license_id: 1 },
  {
    sparse: true,
    partialFilterExpression: { license_id: { $ne: null } }
  }
);
LicenseSchema.methods.generateId = function(employeeId,totalCheckoutsTillNowOfEmployee){
  console.log(employeeId,totalCheckoutsTillNowOfEmployee);
  
  if(employeeId===undefined || totalCheckoutsTillNowOfEmployee===undefined){ 
    throw new Error('Cannot generate license id without employee id');
  }
  const docStatus = convertPascaleCaseToSnakeCase(this.status);
  if(docStatus!== 'available' && docStatus !== 'reissue') {
    throw new Error('Cannot generate license id for non-available or non-reissue licenses');
  }
  employeeId=employeeId.replace('EMP','').toUpperCase();
  const category = this.category.charAt(0).toUpperCase() + this.category.substring(1);
  this.license_id = `DBOX${category}${employeeId}-${totalCheckoutsTillNowOfEmployee + 1}`;
  return this.license_id;
}
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
