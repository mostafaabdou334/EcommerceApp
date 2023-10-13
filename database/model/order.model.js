import mongoose, { Schema } from "mongoose";



const orderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phoneNumbers: [{
        type: String,
        required: true
    }],
    products: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                default: 1,
                min:1,
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            finalPrice: {
                type: Number,
                required: true,
            },

        },
    ],
    subTotal: {
        type: Number,
        default: 0,
        required: true,
    },
    couponId: {
        type: Schema.Types.ObjectId,
        ref: 'Coupon',
    },
    paidAmount: {
        type: Number,
        default: 0,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['cash', 'card'],
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    canceledBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    orderStatus: {
        type: String,
        enum: [
          'pending',
          'confirmed',
          'placed',
          'preparation',
          'shipping',
          'delivered',
          'canceled',
          'refunded',
        ],
      },
    reason: String,
    invoice:{
        public_id: { type: String },
        secure_url: { type: String },
    },


}, { timestamps: true })



export const orderModel = mongoose.model('order', orderSchema)



//  userId => owner this order
//  address , phoneNumbers => of this owner
//  updatedBy , canceledBy , reason => of this owner
//  products => some information for this products 
//  subTotal => total price of all products before apply coupon
//  couponId => if there is coupon or not
//  paidAmount => total price of all products after applied this coupon
//  paymentMethod => method of pay



// 'pending'         => waiting to pay if online
// 'confirmed',      => payed complete online
// 'placed',         => payed  when client received his order (cash)
// 'preparation',    => order is preparation 
// 'on way' == 'shipping',         => it moved
// 'delivered',      => it received
// 'canceled',       => canceled
// 'refunded',       => refused and came back