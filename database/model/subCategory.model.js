import mongoose, { Schema } from "mongoose";



const subCategorySchema = new Schema({

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
    customId:String,
    cloudPath:String,



}, { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } })

//virtual('any name i need to put in it all result due to virtual',{ref:'child collection'})

subCategorySchema.virtual('brands', {
    ref: 'brand',
    foreignField: 'subCategoryId',
    localField: '_id'
})


export const subCategoryModel = mongoose.model('subCategory', subCategorySchema)