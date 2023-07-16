const bcrypt = require("bcrypt");
const farmerModel = require("../models/Farmer");

const farmerService = {
  /**
   * Gets all farmers in a particular district
   * @param {*} district
   * @returns
   */
  async getByDistrict(district) {
    return await farmerModel.find({ "location.district": district });
  },

  /**
   * Storing a newly registered user
   **/
  async store(data, longitude, latitude) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const exists = await farmerModel.findOne({ email: data.email });

    if (!exists) {
      const newFarmer = new farmerModel({
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,
        location: {
          longitude,
          latitude,
          country: data.country,
          district: data.district,
          subCounty: data.subCounty,
          distanceFromTarmac: data.distanceFromTarmac,
        },
        meta: {
          displayImage: data.displayImage ?? null,
          primaryPhoneNumber: data.primaryPhoneNumber,
          alternatePhoneNumber: data.alternatePhoneNumber,
        },
      });

      return await newFarmer.save();
    } else {
      throw new Error("The email provided is already taken !");
    }
  },
};

module.exports = farmerService;
