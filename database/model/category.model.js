import mongoose, { Schema } from "mongoose";



const categorySchema = new Schema({

    name: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
    },
    slug: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
    },
    image: {
        public_id: { type: String, required: true },
        secure_url: { type: String, required: true },
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true 
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    customId: String,


}, { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } })


//virtual('any name i need to put in it all result due to virtual',{ref:'child collection'})

categorySchema.virtual('subCategories', {
    ref: 'subCategory',  // subCategory model
    foreignField: 'categoryId',  // there is field in subCategory model called categoryId
    localField: '_id'
})

export const categoryModel = mongoose.model('category', categorySchema)