const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    categoryName: {
        type: String,
        required: true
    }
})

const CategoryModel = new mongoose.model("category", CategorySchema);
module.exports = CategoryModel;