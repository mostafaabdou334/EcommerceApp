import joi from 'joi'

export const createCategorySchema = {

    body: joi.object({
        name: joi.string().min(3).max(50).required().messages({ 'any.required': 'categoryName is required', 'string.min': 'categoryName length must be more than or equal to 3 characters', 'string.max': 'categoryName length must be less than or equal to 15 characters' }),
    }).required()
}

export const updateCategorySchema = {

    body: joi.object({
        name: joi.string().min(3).max(50).messages({ 'string.min': 'categoryName length must be more than or equal to 3 characters', 'string.max': 'categoryName length must be less than or equal to 15 characters' }),
    }).required(),

    params:joi.object({
        categoryId:joi.string().hex().length(24).required(),
    }).required()
}

export const deleteCategorySchema = {

    params:joi.object({
        categoryId:joi.string().hex().length(24).required(),
    }).required()
}







