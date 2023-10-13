import mongoose, { Schema } from "mongoose";



const couponSchema = new Schema({

    couponCode: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
    },
    couponAmount: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
        default: 1
    },
    isPercentageCoupon: {
        type: Boolean,
        required: true,
        default: false
    },
    isFixedCoupon: {
        type: Boolean,
        required: true,
        default: false
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
    couponAssignedToUser: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,

        },
        maxUsage: {
            type: Number,
            required: true,
            default: 1
        },
        usageCount: {
            type: Number,
            default: 0,
        },
    }],

    fromDate: {
        type: String,
        required: true,

    },
    TODate: {
        type: String,
        required: true,

    },
    couponStatus: {
        type: String,
        required: true,
        enum: ['valid', 'expired'],
        default: "valid"

    },
    couponAssginedToProduct: [
        {
            type: Schema.Types.ObjectId,
            ref: 'product',
        },
    ],


}, { timestamps: true })


export const couponModel = mongoose.model('coupon', couponSchema)