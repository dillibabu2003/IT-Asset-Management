const mongoose = require("mongoose");
const { convertSnakeCaseToPascaleCase, convertPascaleCaseToSnakeCase } = require("../utils/helperFunctions");

const AssetSchema = new mongoose.Schema({
  serial_no: {
    type: String,
    required: true,
    unique: true,
  },
  asset_id: {
    type: String,
    default: null,
  },
  invoice_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
    justOne: true,
    required: true,
  },
  category: {
    type: String,
    enum: ["laptop", "desktop", "server", "printer", "monitor", "mouse", "keyboard"],
    get: (v) => convertSnakeCaseToPascaleCase(v),
    set: (v) => convertPascaleCaseToSnakeCase(v),
    required: true,
  },
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String,
  },
  ram: {
    type: String,
    enum: ["8gb", "16gb", "32gb", "64gb", "128gb"],
    get: (v) => convertSnakeCaseToPascaleCase(v),
    set: (v) => convertPascaleCaseToSnakeCase(v),
  },
  storage: {
    type: String,
    enum: ["256gb", "512gb", "1tb"],
    get: (v) => convertSnakeCaseToPascaleCase(v),
    set: (v) => convertPascaleCaseToSnakeCase(v),
  },
  processor: {
    type: String,
  },
  os_type: {
    type: String,
    enum: ["ubuntu", "windows", "mac"],
    get: (v) => convertSnakeCaseToPascaleCase(v),
    set: (v) => convertPascaleCaseToSnakeCase(v),
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
    enum: ["available", "deployed","about_to_archive", "archived", "reissue"],
    get: (v) => convertSnakeCaseToPascaleCase(v),
    set: (v) => convertPascaleCaseToSnakeCase(v),
    required: true,
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    justOne: true,
    default: null,
    sparse: true,
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
  },
  timestamps: true, toJSON: { virtuals: true,getters: true, setters:true }, toObject: { virtuals: true,getters: true,setters: true },runSettersOnQuery: true,id: false
});

AssetSchema.index(
  { asset_id: 1 },
  {
    sparse: true,
    partialFilterExpression: { asset_id: { $ne: null } }
  }
);
AssetSchema.methods.generateId = function(employeeId,totalCheckoutsTillNowOfEmployee){
  if(employeeId===undefined || totalCheckoutsTillNowOfEmployee===undefined){ 
    throw new Error('Cannot generate asset id without employee id');
  }
  const docStatus = convertPascaleCaseToSnakeCase(this.status);
  if(docStatus!== 'available' && docStatus !== 'reissue') {
    throw new Error('Cannot generate asset id for non-available or non-reissue assets');
  }
  employeeId=employeeId.replace('EMP','').toUpperCase();
  const category = this.category.charAt(0).toUpperCase() + this.category.substring(1);
  this.asset_id = `DBOX${category}${employeeId}-${totalCheckoutsTillNowOfEmployee + 1}`;
  return this.asset_id;
}

// Updates Asset statuses based on the current date daily with help of cron job
AssetSchema.statics.updateAssetStatuses = async function(daysBeforeExpiry = 7) {
  const now = new Date();
  const warningPeriod = daysBeforeExpiry * 24 * 60 * 60 * 1000; // convert days to milliseconds

  await this.updateMany(
    { end: { $lt: now }, status: { $ne: 'archived' } },
    { $set: { status: 'archived' } }
  );

  await this.updateMany(
    { 
      end: { $gt: now, $lte: new Date(now.getTime() + warningPeriod) },
      status: { $nin: ['archived', 'about_to_archive'] }
    },
    { $set: { status: 'about_to_archive' } }
  );
};

// Add validation for start and end dates
AssetSchema.pre('save', function(next) {
  if (this.start > this.end) {
    next(new Error('Start date cannot be later than end date'));
  }
  if(this.isModified('status') && this.status === 'deployed'){
    if(!this.assigned_to){
      next(new Error('Cannot deploy asset without assigning to an employee'));
    }
  }
  next();
});

module.exports = mongoose.model("Asset", AssetSchema);
