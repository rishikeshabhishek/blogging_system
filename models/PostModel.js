const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');


const PostSchema = Schema({
    category: {
        type: Schema.Types.ObjectId,
        ref: "category"
    },
    title: {
        type: String,
        required: true
    },
    subTitle: {
        type: String,
        required: true
    },
    postText: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Boolean,
        default: false
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "user"
    }
});

PostSchema.plugin(mongoosePaginate);


const PostModel = mongoose.model("post", PostSchema);

module.exports = PostModel;