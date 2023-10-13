import mongoose, { Schema } from "mongoose";



const brandSchema = new Schema({

    name: {
        type: String,
        lowercase: true,
        // unique: true,  // as maybe we have brands in more subcategories
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
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true 
    },
    categoryId:{
        type:Schema.Types.ObjectId,
        ref:'category',
        required:true 
    },
    subCategoryId:{
        type:Schema.Types.ObjectId,
        ref:'subCategory',
        required:true 
    },
    customId: String,
    cloudPath:String,


}, { timestamps: true , toObject: { virtuals: true }, toJSON: { virtuals: true } })

brandSchema.virtual('products', {
    ref: 'product',
    foreignField: 'brandId',
    localField: '_id'
})

export const brandModel = mongoose.model('brand', brandSchema)