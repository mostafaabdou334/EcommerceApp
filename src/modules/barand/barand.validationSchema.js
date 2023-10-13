import joi from 'joi'

export const createBrandSchema = {

    body: joi.object({
        name: joi.string().min(3).max(50).required().messages({ 'any.required': 'BrandName is required', 'string.min': 'BrandName length must be more than or equal to 3 characters', 'string.max': 'BrandName length must be less than or equal to 15 characters' }),
    }).required(),

    query:joi.object({
        categoryId:joi.string().hex().length(24).required(),
        subCategoryId:joi.string().hex().length(24).required(),

    }).required()


}

export const updateBrandSchema = {

    body: joi.object({
        name: joi.string().min(3).max(50).messages({ 'any.required': 'BrandName is required', 'string.min': 'BrandName length must be more than or equal to 3 characters', 'string.max': 'BrandName length must be less than or equal to 15 characters' }),
    }).required(),

    params:joi.object({
        brandId:joi.string().hex().length(24).required(),
    }).required(),
}


export const deleteBrandSchema = {
    
    params:joi.object({
        brandId:joi.string().hex().length(24).required(),
    }).required(),
}