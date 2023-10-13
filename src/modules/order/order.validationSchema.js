

import joi from 'joi'

export const fromCartOrderSchema = {

    body: joi.object({
        couponCode: joi.string().min(5).max(55),
        address:joi.string().required(),
        phoneNumbers:joi.string().length(11).required(),
        paymentMethod:joi.string().valid("card","cash").required(),

    }).required() ,

    query: joi.object({
        cartId: joi.string().hex().length(24).required(),
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


export const cancelOrderSchema = {

    query: joi.object({
        orderId: joi.string().hex().length(24).required(),
    }).required()
}

