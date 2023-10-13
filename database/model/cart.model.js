import mongoose, { Schema } from "mongoose";



const cartSchema = new Schema({


    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products: [{
        _id:false , // (to delete _id which appear in response) ... it  refer to every object of this array as by default every object in mongo db should have _id (by default) 
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'product',
            required: true
        },
        quantity: {

            type: Number,
            required: true,
        }
    }],

    subTotal: {
        type: Number,
        required: true,
    },

}, { timestamps: true })



export const cartModel = mongoose.model('cart', cartSchema)