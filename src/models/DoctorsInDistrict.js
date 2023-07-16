// Import mongoose ORM
const mongoose = require("mongoose");

// Create Doctor model
const DoctorInDistrictModel = new mongoose.Schema(
  {
    country: {
      type: String,
      required: true,
    },

    district: {
      type: String,
      required: true,
      unique: true,
    },

    doctorCount: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Export this model for import in the routes that will need to use it
module.exports = mongoose.model("DoctorInDistrict", DoctorInDistrictModel);
