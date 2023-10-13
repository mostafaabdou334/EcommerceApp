

import joi from 'joi'

export const addCouponSchema = {

    body: joi.object({

        couponCode: joi.string().min(5).max(55).required(),
        couponAmount: joi.number().positive().min(1).max(100).required(),
        isPercentageCoupon: joi.boolean().optional(),
        isFixedCoupon: joi.boolean().optional(),
        fromDate: joi.date().greater(Date.now() - (24 * 60 * 60 * 1000)).required(),
        TODate: joi.date().greater(joi.ref("fromDate")).required(),
        couponAssignedToUser: joi.array().items().required(),
        // couponAssginedToUsers: joi.array().items().required(),

    }).required()
}


export const updateCouponSchema = {

    body: joi.object({

        couponCode: joi.string().min(5).max(55),
        couponAmount: joi.number().positive().min(1).max(100),
        isPercentageCoupon: joi.boolean().optional(),
        isFixedCoupon: joi.boolean().optional(),
        fromDate: joi.date().greater(Date.now() - (24 * 60 * 60 * 1000)),
        TODate: joi.date().greater(Date.now() - (24 * 60 * 60 * 1000)),
        couponAssignedToUser: joi.array().items(),
        // couponAssginedToUsers: joi.array().items().required(),

    }).required()
}


export const deleteCouponSchema = {

    query: joi.object({
        coupon_id: joi.string().hex().length(24).required(),
    }).required()
}

