const supplySubCategoryModel = require("../models/supplySubCategory");
const supplierProductModel = require("../models/supplierProduct");

const supplySubCategoryService = {
  /**
   * Gets all supply sub categories
   * @returns Promise
   */
  async get() {
    return await supplySubCategoryModel.find();
  },

  /**
   * Creates a new supply sub category and returns it
   * @param {*} data
   * @returns
   */
  async create(data) {
    const supplySubCategory = new supplySubCategoryModel({
      subCategoryName: data.subCategoryName,
      image: data.uploadedFile.location,
      supplyCategory: data.category,
    });

    return await supplySubCategory.save();
  },

  /**
   * Updates a supply sub category
   * @param {*} supplySubCategoryId
   * @param {*} data
   */
  async update(supplySubCategoryId, data) {
    // TODO: Create provison to update an image.
    const supplySubCategory = await supplySubCategoryModel.findByIdAndUpdate(
      supplySubCategoryId,
      { $set: data },
      { new: true }
    );

    return supplySubCategory;
  },

  /**
   * Deletes a supply sub category
   * @param {*} supplySubCategoryId
   */
  async delete(supplySubCategoryId) {
    const supplySubCategory = await supplySubCategoryModel.findById(
      supplySubCategoryId
    );
    supplySubCategory.remove();
  },
};

module.exports = supplySubCategoryService;
