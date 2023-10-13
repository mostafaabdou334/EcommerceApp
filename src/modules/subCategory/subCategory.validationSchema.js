import joi from 'joi'

export const createSubCategorySchema = {

    body: joi.object({
        name: joi.string().min(3).max(50).required().messages({ 'any.required': 'subCategoryName is required', 'string.min': 'subCategoryName length must be more than or equal to 3 characters', 'string.max': 'subCategoryName length must be less than or equal to 15 characters' }),
    }).required(),

    params:joi.object({
        categoryId:joi.string().hex().length(24).required(),
    }).required()
}


export const updateSubCategorySchema = {

    body: joi.object({
        name: joi.string().min(3).max(50).messages({ 'any.required': 'subCategoryName is required', 'string.min': 'subCategoryName length must be more than or equal to 3 characters', 'string.max': 'subCategoryName length must be less than or equal to 15 characters' }),
    }).required(),

    params:joi.object({
        subCategoryId:joi.string().hex().length(24).required(),
    }).required()
}


export const deleteSubCategorySchema = {

    params:joi.object({
        subCategoryId:joi.string().hex().length(24).required(),
    }).required()
}