const supplyCategoryModel = require("../models/SupplyCategory");

const supplyCategoryService = {
  /**
   * Gets all supply categories
   * @returns
   */
  async get() {
    return await supplyCategoryModel.find();
  },

  /**
   * Creates a new supply category and returns it
   * @param {*} data
   * @returns
   */
  async create(data) {
    const supplyCategory = new supplyCategoryModel({
      categoryName: data.categoryName,
      description: data.description,
    });

    return await supplyCategory.save();
  },

  /**
   * Updates a supply category
   * @param {*} supplyCategoryId
   * @param {*} data
   */
  async update(supplyCategoryId, data) {
    const supplyCategory = await supplyCategoryModel.findByIdAndUpdate(
      supplyCategoryId,
      { $set: data },
      { new: true }
    );

    return supplyCategory;
  },

  /**
   * Deletes a supply category
   * @param {*} supplyCategoryId
   */
  async delete(supplyCategoryId) {
    const supplyCategory = await supplyCategoryModel.findById(supplyCategoryId);
    supplyCategory.remove();
  },
};

module.exports = supplyCategoryService;
