import joi from 'joi'

export const addToCartSchema = {

    body: joi.object({
        productId:joi.string().hex().length(24).required(),
        quantity:joi.number().integer().min(1).required()

    }).required()
}

export const deleteProductSchema = {

    body: joi.object({
        productId:joi.string().hex().length(24).required(),
    }).required()
}

export const deleteCartSchema = {

    query: joi.object({
        cartId:joi.string().hex().length(24).required(),
    }).required()
}