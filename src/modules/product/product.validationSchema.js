import joi from 'joi'

export const addProductSchema = {

    body: joi.object({
        name: joi.string().min(3).max(50).required().messages({ 'any.required': 'categoryName is required', 'string.min': 'categoryName length must be more than or equal to 3 characters', 'string.max': 'categoryName length must be less than or equal to 15 characters' }),
        description: joi.string().min(3).max(50).messages({ 'string.min': 'description length must be more than or equal to 3 characters', 'string.max': 'description length must be less than or equal to 15 characters' }),
        price: joi.number().min(1).required(),
        discount: joi.number().min(0).max(100),
        colors:joi.string().optional(),
        sizes:joi.string().optional(),
        stock:joi.number().min(1).required()

    }).required(),
    query: joi.object({

        categoryId: joi.string().hex().length(24).required(),
        subCategoryId: joi.string().hex().length(24).required(),
        brandId: joi.string().hex().length(24).required(),

    }).required()
}




export const updateProductSchema = {

    body: joi.object({
        name: joi.string().min(3).max(50).messages({ 'any.required': 'categoryName is required', 'string.min': 'categoryName length must be more than or equal to 3 characters', 'string.max': 'categoryName length must be less than or equal to 15 characters' }),
        description: joi.string().min(3).max(50).messages({ 'string.min': 'description length must be more than or equal to 3 characters', 'string.max': 'description length must be less than or equal to 15 characters' }),
        price: joi.number().min(1),
        discount: joi.number().min(0),
        colors:joi.string().optional(),
        sizes:joi.string().optional(),
        stock:joi.number().min(1)

    }).required(),
    params: joi.object({
        productId: joi.string().hex().length(24).required(), 
    }).required()
}


export const deleteProductSchema = {


    params: joi.object({
        productId: joi.string().hex().length(24).required(),
    }).required()
}