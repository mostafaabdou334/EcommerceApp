import mongoose, { Schema } from "mongoose";



const productSchema = new Schema({

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
    image: [{
       
        public_id: { type: String, required: true },
        secure_url: { type: String, required: true },
        
    }],
    description: {
        type: String,
        lowercase: true,
        // required: true,
    },
    colors: [{
        type: String,
        lowercase: true,
    }],
    sizes: [{
        type: String,
        lowercase: true,
    }],
    price: {
        type: Number,
        required: true,
        default: 1
    },
    discount: {
        type: Number,
        default: 0,
        min:0,
        max:100,
    },
    priceAfterDiscount: {
        type: Number,
        default: 0
    },

    stock: {
        type: Number,
        required: true,
        default: 1
    },
    soldItems: {
        type: Number,
        default: 0,
    },
    cloudFolder: {
        type: String,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    deletedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    subCategoryId: {
        type: Schema.Types.ObjectId,
        ref: 'subCategory',
        required: true
    },
    brandId: {
        type: Schema.Types.ObjectId,
        ref: 'brand',
        required: true
    },
    customId: String,
    rate: {
        type: Number,
        default: 0,
        required: true,
    },

}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true },
})

//another way to calculate priceAfterDiscount if i dont need to save it ( but i need to save it)
// productSchema.virtual("finaaalPrice").get(function(){
//     if(this.price){
//         return Number.parseFloat(this.price - (this.price * this.discount || 0)/100).toFixed(2)
//     }
// })

productSchema.virtual('Reviews', {
    ref: 'Review',
    foreignField: 'productId',
    localField: '_id',
})

export const productModel = mongoose.model('product', productSchema)