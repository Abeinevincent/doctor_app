const SupplierBidModel = require("../models/supplierBidItem");

const supplierBidService = {
  /**
   * Gets all supplier services
   * @returns
   */
  async get() {
    return await SupplierBidModel.find()
      // .populate({ path: "supplyCategory" })
      // .populate({ path: "supplier", select: ["-password", "-email"] });
  },

  /**
   * Creates a new supplier service and returns it
   * @param {*} data
   * @returns
   */
  async create(data) {

    const supplierBidService = new SupplierBidModel({
      title: data.title,
      description: data.description,
      price: data.price,
      quantity: data.quantity,
      expiry_time: data.expiry_time,
      status: data.status || "New",
      image: data.uploadedFile?.location ?? null,
      supplier: data.supplier,
      supplyCategory: data.supplyCategory,
    });

    return await supplierBidService.save();
  },

  /**
   * Updates a supplier service
   * @param {*} supplierProductId
   * @param {*} data
   */
  async update(supplierServiced, data) {
    const supplierService = await SupplierBidModel.findByIdAndUpdate(
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
    await SupplierBidModel.findByIdAndDelete(supplierProductId);
  },
};

module.exports = supplierBidService;
