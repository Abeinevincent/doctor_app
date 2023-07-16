const SupplierServiceModel = require("../models/supplierService");

const supplierServicesService = {
  /**
   * Gets all supplier services
   * @returns
   */
  async get() {
    return await SupplierServiceModel.find()
      .populate({ path: "supplyCategory" })
      .populate({ path: "supplier", select: ["-password", "-email"] });
  },

  /**
   * Creates a new supplier service and returns it
   * @param {*} data
   * @returns
   */
  async create(data) {
    
    const supplierService = new SupplierServiceModel({
      service: data.service,
      description: data.description,
      price: data.price,
      availability: data.availability,      
      images: data.uploadedFile?.location ?? null,
      supplier: data.supplier,
      supplyCategory: data.supplyCategory,
    });

    return await supplierService.save();
  },

  /**
   * Updates a supplier service
   * @param {*} supplierProductId
   * @param {*} data
   */
  async update(supplierServiced, data) {
    const supplierService = await SupplierServiceModel.findByIdAndUpdate(
        supplierServiced,
      { $set: data },
      { new: true }
    );

    return supplierService;
  },

  /**
   * Deletes a supplier product
   * @param {*} supplierProductId
   */
  async delete(supplierProductId) {
    await SupplierServiceModel.findByIdAndDelete(supplierProductId);
  },
};

module.exports = supplierServicesService;
