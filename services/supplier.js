const supplierModel = require("../models/Supplier");
const bcrypt = require("bcrypt");

const supplierService = {
  /**
   * Gets all suppliers
   * @returns
   */
  async get() {
    return await supplierModel.find();
  },

  /**
   * Gets a supplier by Id
   */
  async getOne(id) {
    return await supplierModel.findById(id);
  },

  // Get by district
  async getByDistrict(district) {
    return await supplierModel.find({ "district": district });
  },

  /**
   *  Gets the suppliers that belong to a particular district
   */
  async getSuppliersInADistrict(district) {
    return await supplierModel.find({ district: district });
  },

  /**
   * Creates a new supplier
   * @param {*} data
   * @returns
   */
  async create(data) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const supplier = new supplierModel({
      firstName: data.firstName,
      surname: data.surname,
      companyName: data.companyName,
      email: data.email,
      password: hashedPassword,
      country: data.country,
      district: data.district,
      location: {
        longitude: data.longitude,
        latitude: data.latitude
      },
      subCounty: data.subCounty,
      type: data.type,
      meta: {
        primaryPhoneNumber: data.primaryPhoneNumber,
        alternatePhoneNumber: data.alternatePhoneNumber ?? null,
        websiteUrl: data.websiteUrl,
        displayImg: data.uploadedFile?.location ?? null,
      },
    });

    return await supplier.save();
  },

  /**
   * Updates the supplier Details except email and password
   * @param {*} data
   * @returns
   */
  async update(supplierId, data) {
    const supplier = await supplierModel.findByIdAndUpdate(
      supplierId,
      { $set: data },
      { new: true }
    );

    return supplier;
  },

  /**
   * Deletes a supplier
   * @param {*} supplierId
   */
  async delete(supplierId) {
    const supplier = await supplierModel.findById(supplierId);
    supplier.remove();
  },
};

module.exports = supplierService;
